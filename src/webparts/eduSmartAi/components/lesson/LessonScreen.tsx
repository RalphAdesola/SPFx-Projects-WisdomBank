import * as React from 'react';
import { IconButton, MessageBar, MessageBarType, PrimaryButton, Spinner, SpinnerSize } from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import { useCourses } from '../../hooks/useCourses';
import { ICourse } from '../../types/ICourse';
import styles from './LessonScreen.module.scss';
import { IUser } from '../../types/IUser';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { AssistantSummaryService } from '../../services/AssistantSummaryService';

export interface ILessonScreenProps {
  theme: 'dark' | 'light';
  sp: SPFI;
  course?: ICourse;
  onOpenAssistant: (course: ICourse, mode: 'summary' | 'question') => void;
  onLaunchAssessment: (course: ICourse) => void;
  currentUser: IUser;
  currentUserId: number;
}

function formatDate(value?: string): string {
  if (!value) {
    return 'Not specified';
  }

  return new Date(value).toLocaleDateString();
}

function isVideoMaterial(material?: ICourse): boolean {
  if (!material) {
    return false;
  }

  const materialType = material.materialType?.trim().toLowerCase() || '';
  const fileName = material.fileName?.trim().toLowerCase() || '';
  return materialType.includes('video') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(fileName);
}

const LessonScreen: React.FC<ILessonScreenProps> = ({
  theme,
  sp,
  course,
  onOpenAssistant,
  onLaunchAssessment,
  currentUser,
  currentUserId
}) => {
  const { data: courses, isLoading, error } = useCourses(sp);
  const {
    data: progressStates,
    isLoading: progressLoading,
    error: progressError,
    markStarted,
    markProgress,
    markCompleted
  } = useLearningProgress(sp, currentUserId);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [completionError, setCompletionError] = React.useState<Error | undefined>();
  const [hasCompletedCourse, setHasCompletedCourse] = React.useState(false);
  const [showAssistantChooser, setShowAssistantChooser] = React.useState(false);
  const [showSummaryPreview, setShowSummaryPreview] = React.useState(false);
  const [summaryText, setSummaryText] = React.useState('');
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState<string>('');
  const lastAutoProgressRef = React.useRef(0);
  const material = course || courses[0];
  const progressState = material
    ? progressStates.find(
      (item) =>
        item.courseId === Number(material.id) ||
        item.courseTitle.trim().toLowerCase() === material.title.trim().toLowerCase()
    )
    : undefined;
  const isCompleted = (progressState?.progressPercent || 0) >= 100;
  const completionUnlocked = hasCompletedCourse || isCompleted;
  const videoMaterial = isVideoMaterial(material);
  const mediaUrl = material?.documentUrl || '';
  const previewUrl = !videoMaterial && mediaUrl
    ? `${mediaUrl}${mediaUrl.indexOf('?') >= 0 ? '&' : '?'}web=1&action=embedview`
    : '';
  const estimatedReadingMinutes = Math.max(Number(material?.estimatedMinutes || material?.estimatedHours * 60 || 8) || 8, 8);

  React.useEffect(() => {
    if (!material) {
      return;
    }

    lastAutoProgressRef.current = progressState?.progressPercent || 0;
    if (isCompleted) {
      setHasCompletedCourse(true);
    }
  }, [material, progressState?.progressPercent]);

  React.useEffect(() => {
    if (!material || !showSummaryPreview) {
      return;
    }

    let cancelled = false;
    setSummaryLoading(true);
    setSummaryError('');

    new AssistantSummaryService(sp)
      .getSummary(material)
      .then((value) => {
        if (!cancelled) {
          setSummaryText(value);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setSummaryError(reason instanceof Error ? reason.message : 'Unable to load the summary.');
          setSummaryText(material.description || 'No summary is available yet.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [material, showSummaryPreview, sp]);

  React.useEffect(() => {
    if (!material || completionUnlocked) {
      return;
    }

    markStarted(currentUser.displayName || 'Learner', material.title, Number(material.id)).catch(() => undefined);
  }, [completionUnlocked, currentUser.displayName, material, markStarted]);

  React.useEffect(() => {
    if (!material || completionUnlocked) {
      return;
    }

    let startTime = Date.now();
    const pushProgress = async (): Promise<void> => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const elapsedPercent = (elapsedMinutes / estimatedReadingMinutes) * 100;
      let nextProgress = 25;
      if (elapsedPercent >= 65) {
        nextProgress = 75;
      } else if (elapsedPercent >= 35) {
        nextProgress = 50;
      }

      if (nextProgress > lastAutoProgressRef.current && nextProgress < 100) {
        lastAutoProgressRef.current = nextProgress;
        await markProgress(
          currentUser.displayName || 'Learner',
          material.title,
          nextProgress,
          Number(material.id)
        );
      }
    };

    const timer = window.setInterval(() => {
      pushProgress().catch(() => undefined);
    }, 30000);

    const onVisibilityChange = (): void => {
      if (!document.hidden) {
        startTime = Date.now();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    pushProgress().catch(() => undefined);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [completionUnlocked, currentUser.displayName, estimatedReadingMinutes, markProgress, material]);

  if (isLoading && !material) {
    return <SkeletonLoader lines={5} />;
  }

  if (!material) {
    return (
      <div className={`${styles.lesson} ${theme === 'dark' ? styles.lessonDark : styles.lessonLight}`}>
        <PageHeader
          title="Learning Material Details"
          subtitle={error ? `Unable to load Learning Materials: ${error.message}` : 'No published learning material is available yet.'}
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.lesson} ${theme === 'dark' ? styles.lessonDark : styles.lessonLight}`}>
      <PageHeader title="Learning Material Details" subtitle={videoMaterial ? 'Watch the assigned video and prepare for the assessment.' : 'Review the assigned document and prepare for the assessment.'} theme={theme} />
      <div className={styles.contentGrid}>
        <section className={styles.mainColumn}>
          <div className={styles.breadcrumb}>Learning Materials &gt; {material.subject}</div>
          <div className={styles.titleSection}>
            <h2>{material.title}</h2>
            {material.isRequired ? <span className={styles.badge}>Required</span> : null}
          </div>
          <div className={styles.lessonMeta}>
            Estimated duration: {material.estimatedMinutes || 0} min | Material type: {material.materialType || 'Document'} | Updated: {formatDate(material.modifiedDate)}
          </div>
          <article className={styles.body}>
            <p>{material.description || 'No description has been added for this learning material.'}</p>
            <h3>Material information</h3>
            <ul>
              <li>Material code: {material.materialCode || 'Not specified'}</li>
              <li>Department: {material.department || 'All departments'}</li>
              <li>Audience: {material.audienceLevel || material.level}</li>
              <li>Review date: {formatDate(material.reviewDate)}</li>
              <li>Expiry date: {formatDate(material.expiryDate)}</li>
            </ul>
          </article>
          <div className={styles.actionRow}>
            <PrimaryButton
              text={videoMaterial ? 'Open video' : 'View document'}
              aria-label={`${videoMaterial ? 'Open video' : 'View'} ${material.title}`}
              onClick={() => {
                markStarted(currentUser.displayName || 'Learner', material.title, Number(material.id)).catch(() => undefined);
                window.open(videoMaterial ? mediaUrl : previewUrl, '_blank', 'noopener,noreferrer');
              }}
              disabled={!(videoMaterial ? mediaUrl : previewUrl)}
            />
            <PrimaryButton
              text="AI Assistant"
              aria-label={`Open AI Assistant for ${material.title}`}
              onClick={() => setShowAssistantChooser(true)}
            />
            <PrimaryButton
              className={styles.completionButton}
              text={completionUnlocked ? 'Course Completed' : isCompleting ? 'Saving...' : 'Mark Course Complete'}
              aria-label={`Mark ${material.title} complete`}
              disabled={completionUnlocked || isCompleting || progressLoading}
              onClick={async () => {
                setIsCompleting(true);
                setCompletionError(undefined);
                setHasCompletedCourse(true);
                try {
                  await markCompleted(
                    currentUser.displayName || 'Learner',
                    material.title,
                    Number(material.id)
                  );
                } catch (reason) {
                  setHasCompletedCourse(isCompleted);
                  setCompletionError(
                    reason instanceof Error ? reason : new Error('Unable to complete this course.')
                  );
                } finally {
                  setIsCompleting(false);
                }
              }}
            />
          </div>
          {progressError || completionError ? (
            <MessageBar messageBarType={MessageBarType.error}>
              {(completionError || progressError)?.message}
            </MessageBar>
          ) : null}
        </section>
        <aside className={styles.sidePanel}>
          <div className={styles.videoCard}>
            <div className={styles.videoLabel}>{videoMaterial ? 'Video player' : 'Document preview'}</div>
            {videoMaterial && mediaUrl ? (
              <video
                className={styles.videoPlayer}
                src={mediaUrl}
                controls
                preload="metadata"
                aria-label={`${material.title} video`}
              />
            ) : previewUrl ? (
              <iframe
                className={styles.documentFrame}
                src={previewUrl}
                title={`${material.title} preview`}
                allowFullScreen
              />
            ) : (
              <div className={styles.videoPlaceholder}>Preview unavailable</div>
            )}
          </div>
          <div className={styles.resources}>
            <h3>Tags</h3>
            {material.tags?.length ? (
              <ul>
                {material.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            ) : (
              <p>No tags have been added.</p>
            )}
          </div>
          <PrimaryButton
            className={styles.quizButton}
            text={completionUnlocked ? 'Launch Assessment' : 'Complete Course to Unlock Assessment'}
            aria-label={`Launch assessment for ${material.title}`}
            onClick={() => onLaunchAssessment(material)}
            disabled={!completionUnlocked}
          />
        </aside>
      </div>
      {showAssistantChooser && material ? (
        <div className={styles.assistantOverlay} role="presentation" onClick={() => setShowAssistantChooser(false)}>
          <div className={styles.assistantModal} role="dialog" aria-modal="true" aria-label="AI Assistant options" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Employee Learning AI at your service, based on this course, how may I help you?</h3>
              </div>
              <IconButton
                iconProps={{ iconName: 'Cancel' }}
                ariaLabel="Close"
                title="Close"
                onClick={() => setShowAssistantChooser(false)}
              />
            </div>
            <div className={styles.assistantChoices}>
              <PrimaryButton
                text="Summarize the document"
                onClick={() => {
                  setShowAssistantChooser(false);
                  setShowSummaryPreview(true);
                }}
              />
              <PrimaryButton
                text="Ask a question about this course"
                onClick={() => {
                  setShowAssistantChooser(false);
                  onOpenAssistant(material, 'question');
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
      {showSummaryPreview && material ? (
        <div className={styles.assistantOverlay} role="presentation" onClick={() => setShowSummaryPreview(false)}>
          <div className={`${styles.assistantModal} ${styles.summaryModal}`} role="dialog" aria-modal="true" aria-label="Course summary" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>{material.title}</h3>
                <p>Course summary</p>
              </div>
              <IconButton
                iconProps={{ iconName: 'Cancel' }}
                ariaLabel="Close summary"
                title="Close summary"
                onClick={() => setShowSummaryPreview(false)}
              />
            </div>
            <div className={styles.summaryBody}>
              <div className={styles.summaryPanel}>
                {summaryLoading ? (
                  <Spinner size={SpinnerSize.medium} label="Loading summary..." />
                ) : (
                  <p>{summaryText || material.description || 'No summary is available yet.'}</p>
                )}
                {summaryError ? <div className={styles.summaryNote}>{summaryError}</div> : null}
              </div>
              <div className={styles.summaryPreview}>
                <div className={styles.videoLabel}>{videoMaterial ? 'Video player' : 'Document preview'}</div>
                {videoMaterial && mediaUrl ? (
                 <video
                   className={styles.summaryVideoPlayer}
                   src={mediaUrl}
                   controls
                   preload="metadata"
                   aria-label={`${material.title} video`}
                 />
                ) : previewUrl ? (
                 <iframe
                    className={styles.summaryFrame}
                    src={previewUrl}
                    title={`${material.title} summary preview`}
                    allowFullScreen
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>Preview unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LessonScreen;

import * as React from 'react';
import { IEduSmartAiProps } from './IEduSmartAiProps';
import { AppRoute, useNavigation } from '../hooks/useNavigation';
import Navigation from './shared/Navigation';
import LandingPage from './landing/LandingPage';
import StudentDashboard from './dashboard/StudentDashboard';
import MyCourses from './courses/MyCourses';
import PersonalizedLearningPath from './learningPath/PersonalizedLearningPath';
import LessonScreen from './lesson/LessonScreen';
import QuizScreen from './quiz/QuizScreen';
import AIAssistant from './aiAssistant/AIAssistant';
import NotificationPanel from './notifications/NotificationPanel';
import CertificateScreen from './certificates/CertificateScreen';
import styles from './EduSmartAi.module.scss';
import { useEffect, useState } from 'react';
import { ICourse } from '../types/ICourse';
import { IUser } from '../types/IUser';
import { LearningProgressService } from '../services/LearningProgressService';
import { useNotifications } from '../hooks/useNotifications';

function resetWorkbenchWidth(): void {
  const selectorsToHide = [
    '#spSiteHeader',
    '#spLeftNav',
    '#spCommandBar',
    '#sp-appBar',
    '#CommentsWrapper',
    '#SuiteNavPlaceHolder',
    '[data-automation-id="pageHeader"]',
    '[data-automation-id="pageCommandBar"]'
  ].join(', ');

  const selectorsToStretch = [
    '#workbenchPageContent',
    '#spPageCanvasContent',
    '.SPCanvas-canvas',
    '.ControlZone',
    '.CanvasZone',
    '.CanvasSection'
  ].join(', ');

  const css = `
    ${selectorsToHide} {
      display: none !important;
    }

    html, body {
      overflow-x: hidden !important;
    }

    ${selectorsToStretch} {
      max-width: 100vw !important;
      width: 100vw !important;
      margin: 0 !important;
      padding: 0 !important;
      left: 0 !important;
      right: 0 !important;
    }

    .CanvasZone > div {
      max-width: 100vw !important;
      margin: 0 !important;
    }
  `;

  const head = document.getElementsByTagName('head')[0] || document.documentElement;
  let styleElement = document.getElementById('edu-smart-ai-fullscreen-style') as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'edu-smart-ai-fullscreen-style';
    head.appendChild(styleElement);
  }
  styleElement.textContent = css;

  document.querySelectorAll(selectorsToStretch).forEach((element) => {
    const target = element as HTMLElement;
    target.style.maxWidth = '100vw';
    target.style.width = '100vw';
    target.style.margin = '0';
    target.style.padding = '0';
  });
}




const EduSmartAI: React.FC<IEduSmartAiProps> = (props) => {
  const { route, navigate } = useNavigation();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedCourse, setSelectedCourse] = useState<ICourse | undefined>();
  const [assistantMode, setAssistantMode] = useState<'summary' | 'question'>('question');
  const {
    data: notifications,
    isLoading: notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications(props.sp, props.userId);
  const currentUser: IUser = {
    id: props.userLoginName,
    loginName: props.userLoginName,
    displayName: props.userDisplayName || 'Learner',
    email: props.userEmail
  };

  useEffect(() => {
    resetWorkbenchWidth();
    const observer = new MutationObserver(() => {
      resetWorkbenchWidth();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const isDarkTheme = theme === 'dark';
  const useDarkShell = route !== AppRoute.Landing && isDarkTheme;

  const handleGetStarted = () => {
    navigate(AppRoute.Dashboard);
  };

  const handleOpenCourse = (course: ICourse): void => {
    new LearningProgressService(props.sp)
      .markStarted(props.userId, currentUser.displayName, course.title, Number(course.id))
      .catch(() => undefined);
    setSelectedCourse(course);
    navigate(AppRoute.Lesson);
  };

  const handleLaunchAssessment = (course: ICourse): void => {
    setSelectedCourse(course);
    navigate(AppRoute.Quiz);
  };

  const handleOpenAssistant = (course: ICourse, mode: 'summary' | 'question'): void => {
    setSelectedCourse(course);
    setAssistantMode(mode);
    navigate(AppRoute.AIAssistant);
  };

  return (
    <div className={`${styles.appShell} ${useDarkShell ? styles.appShellDark : styles.appShellLight}`}>
      {route !== AppRoute.Landing && (
        <Navigation
          selectedRoute={route}
          onNavigate={navigate}
          institutionName={props.institutionName ?? 'Enterprise knowledge & learning platform'}
          theme={theme}
          onToggleTheme={() => setTheme(isDarkTheme ? 'light' : 'dark')}
          unreadNotificationCount={unreadCount}
        />
      )}
      <main className={`${styles.mainContent} ${useDarkShell ? styles.mainContentDark : styles.mainContentLight}`}>
        {route === AppRoute.Landing && (
          <LandingPage
            onGetStarted={handleGetStarted}
            theme="light"
          />
        )}
        {route === AppRoute.Dashboard && (
          <StudentDashboard
            theme={theme}
            sp={props.sp}
            onOpenCourse={handleOpenCourse}
            currentUser={currentUser}
          />
        )}
        {route === AppRoute.MyCourses && (
          <MyCourses
            sp={props.sp}
            onOpenCourse={handleOpenCourse}
            onTakeQuiz={handleLaunchAssessment}
            currentUser={currentUser}
            currentUserId={props.userId}
          />
        )}
        {route === AppRoute.LearningPath && (
          <PersonalizedLearningPath
            theme={theme}
            sp={props.sp}
            currentUser={currentUser}
            currentUserId={props.userId}
            onOpenCourse={handleOpenCourse}
            onTakeQuiz={handleLaunchAssessment}
          />
        )}
        {route === AppRoute.Lesson && (
          <LessonScreen
            theme={theme}
            sp={props.sp}
            course={selectedCourse}
            onOpenAssistant={handleOpenAssistant}
            onLaunchAssessment={handleLaunchAssessment}
            currentUser={currentUser}
            currentUserId={props.userId}
          />
        )}
        {route === AppRoute.Quiz && (
          <QuizScreen
            theme={theme}
            sp={props.sp}
            currentUser={currentUser}
            currentUserId={props.userId}
            course={selectedCourse}
            onViewCertificates={() => navigate(AppRoute.Certificates)}
          />
        )}
        {route === AppRoute.AIAssistant && (
          <AIAssistant
            sp={props.sp}
            apiKey={props.aiApiKey ?? ''}
            studentName={props.userDisplayName || 'Student'}
            studentLevel={props.defaultStudentLevel ?? 'Beginner'}
            currentSubject={selectedCourse?.subject || selectedCourse?.title || 'General'}
            assistantMode={assistantMode}
            course={selectedCourse}
          />
        )}
        {route === AppRoute.Notifications && (
          <NotificationPanel
            theme={theme}
            notifications={notifications}
            isLoading={notificationsLoading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
          />
        )}
        {route === AppRoute.Certificates && (
          <CertificateScreen
            theme={theme}
            sp={props.sp}
            currentUserId={props.userId}
            learnerName={currentUser.displayName}
          />
        )}
      </main>
    </div>
  );
};

export default EduSmartAI;

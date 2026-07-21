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
import PerformanceAnalytics from './analytics/PerformanceAnalytics';
import NotificationPanel from './notifications/NotificationPanel';
import styles from './EduSmartAi.module.scss';
import { useEffect, useState } from 'react';

function resetWorkbenchWidth(): void {
    // Use plain JavaScript to set the max-width style to 'none'
    const workbenchContent = document.getElementById("workbenchPageContent");
    if (workbenchContent) {
      (workbenchContent as HTMLElement).style.maxWidth = "none";
    }
 
    const sideNav = document.getElementById("spLeftNav");
    if (sideNav) {
      (sideNav as HTMLElement).style.display = "none";
    }
 
    // ? uncomment this after deploying
    // ? Hide navigation elements
    const siteHeader = document.getElementById("spSiteHeader");
    if (siteHeader) {
      (siteHeader as HTMLElement).style.display = "none";
    }
 
    const commandBar = document.getElementById("spCommandBar");
    if (commandBar) {
      (commandBar as HTMLElement).style.display = "none";
    }
 
    const appBar = document.getElementById("sp-appBar");
    if (appBar) {
      (appBar as HTMLElement).style.display = "none";
    }
 
    const comments = document.getElementById("CommentsWrapper");
    if (comments) {
      (comments as HTMLElement).style.display = "none";
    }
 
    // ? Force full width
    document
      .querySelectorAll(
        ".SPCanvas-canvas, .ControlZone, .CanvasZone, .CanvasSection",
      )
      .forEach((element) => {
        // (element as HTMLElement).style.maxWidth = "none";
        (element as HTMLElement).style.maxWidth = "100vw";
        (element as HTMLElement).style.width = "100vw";
        (element as HTMLElement).style.padding = "0";
        (element as HTMLElement).style.margin = "0";
        (element as HTMLElement).style.gap = "0";
      });
 
    // Fix max width issue of canvas zone
    const css: string = `
      .CanvasZone > div {
        max-width: 100vw !important;
        margin: 0 !important;
      }
    `;
    const head =
      document.getElementsByTagName("head")[0] || document.documentElement;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = css;
    head.appendChild(styleElement);
 
    document.querySelectorAll(".SPCanvas-canvas").forEach((element) => {
      (element as HTMLElement).style.maxWidth = "none";
    });
 
    document.querySelectorAll(".CanvasZone").forEach((element) => {
      (element as HTMLElement).style.maxWidth = "none";
    });
  }




const EduSmartAI: React.FC<IEduSmartAiProps> = (props) => {
  const { route, navigate } = useNavigation();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    resetWorkbenchWidth();
  }, []);

  const isDarkTheme = theme === 'dark';
  const useDarkShell = route !== AppRoute.Landing && isDarkTheme;

  const handleGetStarted = () => {
    navigate(AppRoute.Dashboard);
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
        />
      )}
      <main className={`${styles.mainContent} ${useDarkShell ? styles.mainContentDark : styles.mainContentLight}`}>
        {route === AppRoute.Landing && (
          <LandingPage
            onGetStarted={handleGetStarted}
            theme="light"
          />
        )}
        {route === AppRoute.Dashboard && <StudentDashboard theme={theme} />}
        {route === AppRoute.MyCourses && <MyCourses />}
        {route === AppRoute.LearningPath && <PersonalizedLearningPath theme={theme} />}
        {route === AppRoute.Lesson && <LessonScreen theme={theme} />}
        {route === AppRoute.Quiz && <QuizScreen theme={theme} />}
        {route === AppRoute.AIAssistant && (
          <AIAssistant
            apiKey={props.aiApiKey ?? ''}
            studentName={props.userDisplayName || 'Student'}
            studentLevel={props.defaultStudentLevel ?? 'Beginner'}
            currentSubject="Mathematics"
          />
        )}
        {route === AppRoute.Analytics && <PerformanceAnalytics theme={theme} />}
        {route === AppRoute.Notifications && <NotificationPanel theme={theme} />}
        {route === AppRoute.Certificates && (
          <div className={styles.errorCard}>Certificates and completions will appear here soon.</div>
        )}
      </main>
    </div>
  );
};

export default EduSmartAI;

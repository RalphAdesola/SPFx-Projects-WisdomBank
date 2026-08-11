import { useCallback, useState } from 'react';

export enum AppRoute {
  Landing = 'landing',
  Dashboard = 'dashboard',
  MyCourses = 'my-learning',
  LearningPath = 'recommended-learning',
  Lesson = 'learning-material',
  Quiz = 'assessment',
  AIAssistant = 'ai-assistant',
  Notifications = 'notifications',
  Certificates = 'certificates'
}

export function useNavigation() {
  const [route, setRoute] = useState<AppRoute>(AppRoute.Landing);

  const navigate = useCallback((destination: AppRoute) => {
    setRoute(destination);
  }, []);

  return { route, navigate };
}

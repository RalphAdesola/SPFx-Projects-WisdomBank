export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Computer Science',
  'Biology',
  'Other'
];

export const COURSE_LEVELS = ['Primary', 'Junior Secondary', 'Senior Secondary'];

export const COURSE_STATUSES = ['Active', 'Draft', 'Archived'];

export const STUDENT_STATUSES = ['Not Started', 'In Progress', 'Completed'];

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const NOTIFICATION_TYPES = ['Study Plan', 'Quiz Reminder', 'Milestone', 'New Material', 'System'];

export const SHAREPOINT_LISTS = {
  aiAssistantLogs: 'AI Assistant Logs',
  notifications: 'List Notification',
  learningMaterials: 'Learning Materials',
  learningProgress: 'Employee Learning Progress',
  assessments: 'Assessment',
  assessmentQuestions: 'Assessment Questions',
  assessmentResults: 'Assessment Results'
} as const;

export const ROUTES = {
  landing: 'landing',
  dashboard: 'dashboard',
  myCourses: 'my-courses',
  learningPath: 'learning-path',
  lesson: 'lesson',
  quiz: 'quiz',
  aiAssistant: 'ai-assistant',
  analytics: 'analytics',
  notifications: 'notifications'
} as const;

export const APP_COLORS = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF'
};

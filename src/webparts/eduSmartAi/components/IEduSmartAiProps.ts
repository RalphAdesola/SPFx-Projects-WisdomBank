export interface IEduSmartAiProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  institutionName?: string;
  aiApiKey?: string;
  defaultStudentLevel?: string;
}
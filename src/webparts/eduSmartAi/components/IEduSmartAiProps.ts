import { SPFI } from '@pnp/sp';

export interface IEduSmartAiProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userEmail: string;
  userLoginName: string;
  userId: number;
  institutionName?: string;
  aiApiKey?: string;
  defaultStudentLevel?: string;
  sp: SPFI;
}

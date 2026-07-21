export interface IWeakArea {
  id: string;
  studentId: string;
  subjectName: string;
  topicName: string;
  weaknessScore: number;
  recommendedAction: string;
  isResolved: boolean;
  identifiedDate?: string;
}

export interface IQuiz {
  id: string;
  title: string;
  topicId: string;
  questionsJSON: string;
  passingScore: number;
  timeLimitMinutes?: number;
}

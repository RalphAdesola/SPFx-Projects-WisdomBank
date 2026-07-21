import { IWeakArea } from '../types/IWeakArea';
import { IStudentProgress } from '../types/IStudentProgress';
import { analyzeWeakAreas } from '../utils/weakAreaAnalyzer';

/**
 * WeakAreaService calculates and retrieves weak area recommendations.
 */
export class WeakAreaService {
  /**
   * Analyze student progress to build weak area insights.
   * @param progress Student progress records.
   * @returns Weak area items.
   */
  public async getWeakAreas(progress: IStudentProgress[]): Promise<IWeakArea[]> {
    return analyzeWeakAreas(progress);
  }
}

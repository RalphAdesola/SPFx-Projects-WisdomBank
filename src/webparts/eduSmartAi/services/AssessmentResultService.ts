import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { SHAREPOINT_LISTS } from '../utils/constants';

interface IAssessmentResultItem {
  Id: number;
  EmployeeId?: number;
  CourseId?: number;
  CourseTitle?: string;
  AssessmentId?: number;
  Score?: number;
  Passed?: boolean;
  SubmittedDate?: string;
  [key: string]: unknown;
}

interface IListField {
  InternalName: string;
  TypeAsString: string;
  LookupList?: string;
  ReadOnlyField: boolean;
  Hidden: boolean;
}

interface ILookupItem {
  Id: number;
  Title?: string;
  Titles?: string;
  FileLeafRef?: string;
  [key: string]: unknown;
}

export interface IAssessmentCertificate {
  id: number;
  learnerName: string;
  courseTitle: string;
  score: number;
  passed: boolean;
  submittedDate?: string;
}

export interface IAssessmentResultSummary {
  completedCount: number;
  averageScore: number;
  passedCount: number;
  improvementTrend: number;
}

export class AssessmentResultService {
  constructor(private readonly sp: SPFI) {}

  public async getCertificates(
    currentUserId: number,
    learnerName: string
  ): Promise<IAssessmentCertificate[]> {
    if (currentUserId <= 0) {
      return [];
    }

    const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.assessmentResults);
    const fields = await list.fields
      .select('InternalName', 'TypeAsString', 'LookupList', 'ReadOnlyField', 'Hidden')() as IListField[];
    const assessmentField = this.findField(fields, ['Assessment'], 'Lookup');
    const employeeField = this.findField(fields, ['Employee', 'Learner', 'User'], 'User');
    const courseField = this.findField(fields, ['Course'], 'Lookup');
    if (!employeeField) {
      throw new Error('Assessment Results requires an Employee person column.');
    }

    const courseTitles = await this.getLookupTitles(courseField);
    const assessmentCourseTitles = await this.getAssessmentCourseTitles(assessmentField);
    const items = await list.items
      .select('*')
      .filter(`${employeeField.InternalName}Id eq ${currentUserId}`)
      .orderBy('Id', false)
      .top(500)() as IAssessmentResultItem[];

    return items.map((item) => {
      const courseId = Number(item[`${courseField?.InternalName || 'Course'}Id`] || item.CourseId);
      const assessmentId = Number(item[`${assessmentField?.InternalName || 'Assessment'}Id`] || item.AssessmentId);
      const resolvedCourseTitle =
        courseTitles.get(courseId) ||
        assessmentCourseTitles.get(assessmentId) ||
        String(item.CourseTitle || '').trim();
      return {
        id: item.Id,
        learnerName,
        courseTitle: resolvedCourseTitle || 'Assessment',
        score: Number(item.Score) || 0,
        passed: !!item.Passed,
        submittedDate: item.SubmittedDate
      };
    });
  }

  public async getSummary(currentUserId: number): Promise<IAssessmentResultSummary> {
    const query = this.sp.web.lists
      .getByTitle(SHAREPOINT_LISTS.assessmentResults)
      .items
      .select('Id', 'EmployeeId', 'Score', 'Passed')
      .orderBy('Id', true)
      .top(500);
    const items = currentUserId > 0
      ? await query.filter(`EmployeeId eq ${currentUserId}`)() as IAssessmentResultItem[]
      : [];
    const totalScore = items.reduce((sum, item) => sum + (Number(item.Score) || 0), 0);

    return {
      completedCount: items.length,
      averageScore: items.length ? Math.round(totalScore / items.length) : 0,
      passedCount: items.filter((item) => !!item.Passed).length,
      improvementTrend: items.length > 1
        ? (Number(items[items.length - 1].Score) || 0) - (Number(items[items.length - 2].Score) || 0)
        : 0
    };
  }

  private findField(
    fields: IListField[],
    aliases: string[],
    type: string
  ): IListField | undefined {
    const normalize = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const normalizedAliases = aliases.map(normalize);
    return fields.find((field) =>
      field.TypeAsString === type && normalizedAliases.indexOf(normalize(field.InternalName)) >= 0
    );
  }

  private async getLookupTitles(field?: IListField): Promise<Map<number, string>> {
    const titles = new Map<number, string>();
    if (!field?.LookupList) {
      return titles;
    }

    const items = await this.sp.web.lists
      .getById(field.LookupList)
      .items
      .select('*')
      .top(500)() as ILookupItem[];
    items.forEach((item) => {
      const title = item.Titles || item.Title || item.FileLeafRef;
      if (title) {
        titles.set(item.Id, title);
      }
    });
    return titles;
  }

  private async getAssessmentCourseTitles(field?: IListField): Promise<Map<number, string>> {
    const titles = new Map<number, string>();
    if (!field?.LookupList) {
      return titles;
    }

    const courseField = await this.getListLookupField(field.LookupList, ['Course']);
    const courseTitles = await this.getLookupTitles(courseField);
    const assessmentItems = await this.sp.web.lists
      .getById(field.LookupList)
      .items
      .select('*')
      .top(500)() as ILookupItem[];

    assessmentItems.forEach((item) => {
      const assessmentCourseId = Number(item[`${courseField?.InternalName || 'Course'}Id`] || 0);
      const title = courseTitles.get(assessmentCourseId) || item.Titles || item.Title || item.FileLeafRef;
      if (item.Id && title) {
        titles.set(item.Id, title);
      }
    });

    return titles;
  }

  private async getListLookupField(
    listId: string,
    aliases: string[]
  ): Promise<IListField | undefined> {
    const fields = await this.sp.web.lists
      .getById(listId)
      .fields
      .select('InternalName', 'TypeAsString', 'LookupList', 'ReadOnlyField', 'Hidden')() as IListField[];
    return this.findField(fields, aliases, 'Lookup');
  }
}

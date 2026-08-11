import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { SHAREPOINT_LISTS } from '../utils/constants';

interface IListField {
  InternalName: string;
  TypeAsString: string;
  ReadOnlyField: boolean;
  Hidden: boolean;
  LookupList?: string;
  SchemaXml?: string;
}

interface IListItem {
  Id: number;
  Title?: string;
  Titles?: string;
  [key: string]: unknown;
}

export interface ICourseLearningState {
  courseId?: number;
  courseTitle: string;
  progressPercent: number;
  status: string;
  quizAttempts: number;
}

function normalize(value: string): string {
  return value.replace(/_x0020_/gi, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function findField(
  fields: IListField[],
  aliases: string[],
  types?: string[]
): IListField | undefined {
  const normalizedAliases = aliases.map(normalize);
  return fields.find((field) =>
    normalizedAliases.indexOf(normalize(field.InternalName)) >= 0 &&
    (!types || types.indexOf(field.TypeAsString) >= 0)
  );
}

function setField(
  payload: Record<string, unknown>,
  field: IListField | undefined,
  value: unknown
): void {
  if (!field || value === undefined || value === null) {
    return;
  }

  if (field.TypeAsString === 'User' || field.TypeAsString === 'Lookup') {
    payload[`${field.InternalName}Id`] = value;
  } else {
    payload[field.InternalName] = value;
  }
}

function isPercentageField(field?: IListField): boolean {
  return !!field?.SchemaXml && /Percentage="TRUE"/i.test(field.SchemaXml);
}

function fromStoredProgress(field: IListField | undefined, value: unknown): number {
  const numericValue = Number(value) || 0;
  return isPercentageField(field) && numericValue <= 1
    ? numericValue * 100
    : numericValue;
}

function toStoredProgress(field: IListField | undefined, value: number): number {
  return isPercentageField(field) ? value / 100 : value;
}

export class LearningProgressService {
  constructor(private readonly sp: SPFI) {}

  public async getStates(userId: number): Promise<ICourseLearningState[]> {
    const states = new Map<string, ICourseLearningState>();

    try {
      const progressList = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.learningProgress);
      const fields = await this.getFields(SHAREPOINT_LISTS.learningProgress);
      const employeeField = findField(fields, ['Employee', 'Learner', 'User'], ['User']);
      const courseField = findField(
        fields,
        ['LearningMaterial', 'RelatedMaterial', 'Course'],
        ['Lookup']
      );
      const progressField = findField(
        fields,
        ['ProgressPercentage', 'ProgressPercent', 'Progress'],
        ['Number', 'Integer']
      );
      const statusField = findField(fields, ['Status'], ['Choice', 'Text']);
      const courseTitles = await this.getLookupTitles(courseField);
      const query = progressList.items.select('*').top(500);
      const items = employeeField && userId > 0
        ? await query.filter(`${employeeField.InternalName}Id eq ${userId}`)() as IListItem[]
        : [];
      const percentageRepairs: Array<Promise<unknown>> = [];

      for (const item of items) {
        const courseId = Number(item[`${courseField?.InternalName || 'Course'}Id`]);
        const courseTitle = courseTitles.get(courseId) || String(item.CourseTitle || item.Titles || item.Title || '');
        if (!courseTitle) {
          continue;
        }

        const storedProgress = item[progressField?.InternalName || 'ProgressPercentage'];
        const progressValue = fromStoredProgress(
          progressField,
          storedProgress
        );
        if (
          progressField &&
          isPercentageField(progressField) &&
          Number(storedProgress) > 1
        ) {
          percentageRepairs.push(
            progressList.items.getById(item.Id).update({
              [progressField.InternalName]: Math.min(Number(storedProgress), 100) / 100
            })
          );
        }
        states.set(courseTitle.toLowerCase(), {
          courseId,
          courseTitle,
          progressPercent: progressValue,
          status: String(
            item[statusField?.InternalName || 'Status'] ||
            (progressValue >= 100 ? 'Completed' : 'In Progress')
          ),
          quizAttempts: 0
        });
      }
      await Promise.all(percentageRepairs);
    } catch {
      // Assessment attempts still provide useful state if the progress list is unavailable.
    }

    try {
      const resultsList = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.assessmentResults);
      const fields = await this.getFields(SHAREPOINT_LISTS.assessmentResults);
      const employeeField = findField(fields, ['Employee', 'Learner', 'User'], ['User']);
      const courseField = findField(fields, ['Course'], ['Lookup']);
      const courseTitles = await this.getLookupTitles(courseField);
      const query = resultsList.items.select('*').top(500);
      const results = employeeField && userId > 0
        ? await query.filter(`${employeeField.InternalName}Id eq ${userId}`)() as IListItem[]
        : [];

      for (const result of results) {
        const courseId = Number(result[`${courseField?.InternalName || 'Course'}Id`]);
        const courseTitle = courseTitles.get(courseId) || String(result.CourseTitle || result.Titles || result.Title || '');
        if (!courseTitle) {
          continue;
        }

        const key = courseTitle.toLowerCase();
        const current = states.get(key) || {
          courseId,
          courseTitle,
          progressPercent: 0,
          status: 'In Progress',
          quizAttempts: 0
        };
        current.quizAttempts += 1;
        current.progressPercent = Math.max(current.progressPercent, 75);
        states.set(key, current);
      }
    } catch {
      // Progress remains available even if assessment results cannot be read.
    }

    return Array.from(states.values());
  }

  public async markStarted(
    userId: number,
    userName: string,
    courseTitle: string,
    courseId?: number
  ): Promise<void> {
    await this.upsertProgress(userId, userName, courseTitle, 25, 'In Progress', courseId);
  }

  public async markProgress(
    userId: number,
    userName: string,
    courseTitle: string,
    progressPercent: number,
    courseId?: number
  ): Promise<void> {
    const normalizedProgress = Math.max(25, Math.min(75, Math.round(progressPercent)));
    await this.upsertProgress(userId, userName, courseTitle, normalizedProgress, 'In Progress', courseId);
  }

  public async markCompleted(
    userId: number,
    userName: string,
    courseTitle: string,
    courseId?: number
  ): Promise<void> {
    await this.upsertProgress(userId, userName, courseTitle, 100, 'Completed', courseId);
  }

  private async getFields(listTitle: string): Promise<IListField[]> {
    const fields = await this.sp.web.lists
      .getByTitle(listTitle)
      .fields
      .select(
        'InternalName',
        'TypeAsString',
        'ReadOnlyField',
        'Hidden',
        'LookupList',
        'SchemaXml'
      )() as IListField[];
    return fields.filter((field) => !field.ReadOnlyField && !field.Hidden);
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
      .top(500)() as IListItem[];
    for (const item of items) {
      const title = String(item.Titles || item.Title || item.FileLeafRef || '');
      if (title) {
        titles.set(item.Id, title);
      }
    }

    return titles;
  }

  private async resolveLookupId(
    field: IListField | undefined,
    title: string,
    preferredId?: number
  ): Promise<number | undefined> {
    const titles = await this.getLookupTitles(field);
    if (preferredId && titles.has(preferredId)) {
      return preferredId;
    }

    const expected = title.trim().toLowerCase();
    let exactMatch: number | undefined;
    let bestMatch: number | undefined;
    let bestScore = 0;
    const expectedTokens = new Set(expected.split(/\s+/).filter((token) => token.length > 2));

    titles.forEach((itemTitle, id) => {
      if (itemTitle.trim().toLowerCase() === expected) {
        exactMatch = id;
        return;
      }

      const itemTokens = new Set(
        itemTitle.trim().toLowerCase().split(/\s+/).filter((token) => token.length > 2)
      );
      const matches = Array.from(expectedTokens).filter((token) => itemTokens.has(token)).length;
      const score = matches / Math.max(1, Math.min(expectedTokens.size, itemTokens.size));
      if (score > bestScore) {
        bestScore = score;
        bestMatch = id;
      }
    });

    return exactMatch || (bestScore >= 0.6 ? bestMatch : undefined);
  }

  private async upsertProgress(
    userId: number,
    userName: string,
    courseTitle: string,
    progressPercent: number,
    status: string,
    preferredCourseId?: number
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.learningProgress);
    const fields = await this.getFields(SHAREPOINT_LISTS.learningProgress);
    const employeeField = findField(fields, ['Employee', 'Learner', 'User'], ['User']);
    const courseField = findField(
      fields,
      ['LearningMaterial', 'RelatedMaterial', 'Course'],
      ['Lookup']
    );
    const progressField = findField(
      fields,
      ['ProgressPercentage', 'ProgressPercent', 'Progress'],
      ['Number', 'Integer']
    );
    const statusField = findField(fields, ['Status'], ['Choice', 'Text']);
    const startedField = findField(fields, ['StartedDate', 'StartDate'], ['DateTime']);
    const completedField = findField(fields, ['CompletedDate', 'CompletionDate'], ['DateTime']);
    const accessedField = findField(fields, ['LastAccessedDate', 'LastAccessed'], ['DateTime']);

    if (!employeeField || !courseField || !progressField || !statusField) {
      throw new Error(
        'Employee Learning Progress requires Employee, Course, ProgressPercentage, and Status columns.'
      );
    }

    const courseId = await this.resolveLookupId(courseField, courseTitle, preferredCourseId);
    if (!courseId) {
      throw new Error(`Unable to match "${courseTitle}" to the progress list Course lookup.`);
    }

    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
      Title: `${courseTitle} - ${userName}`
    };
    setField(payload, findField(fields, ['Titles'], ['Text', 'Note']), courseTitle);
    setField(payload, employeeField, userId);
    setField(payload, courseField, courseId);
    setField(payload, progressField, toStoredProgress(progressField, progressPercent));
    setField(payload, statusField, status);
    setField(payload, accessedField, now);
    if (status === 'In Progress') {
      setField(payload, startedField, now);
    }
    if (status === 'Completed') {
      setField(payload, completedField, now);
    }

    const items = await list.items
      .select('*')
      .filter(`${employeeField.InternalName}Id eq ${userId}`)
      .top(500)() as IListItem[];
    const existing = items.find((item) =>
      Number(item[`${courseField.InternalName}Id`]) === courseId
    );

    if (existing) {
      const currentProgress = fromStoredProgress(
        progressField,
        existing[progressField.InternalName]
      );
      if (currentProgress >= progressPercent) {
        return;
      }
      await list.items.getById(existing.Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  }
}

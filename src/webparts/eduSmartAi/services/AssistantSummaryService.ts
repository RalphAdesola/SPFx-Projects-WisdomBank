import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { ICourse } from '../types/ICourse';
import { SHAREPOINT_LISTS } from '../utils/constants';

interface IListField {
  InternalName: string;
  TypeAsString: string;
  LookupList?: string;
  ReadOnlyField: boolean;
  Hidden: boolean;
}

interface IListItem {
  Id: number;
  Title?: string;
  Titles?: string;
  Summary?: string;
  SummaryText?: string;
  Content?: string;
  Message?: string;
  Response?: string;
  LogText?: string;
  CourseTitle?: string;
  CourseId?: number;
  [key: string]: unknown;
}

function normalize(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function findField(fields: IListField[], aliases: string[], typeHints?: string[]): IListField | undefined {
  const normalizedAliases = aliases.map(normalize);
  return fields.find((field) =>
    normalizedAliases.indexOf(normalize(field.InternalName)) >= 0 &&
    (!typeHints || typeHints.indexOf(field.TypeAsString) >= 0)
  );
}

function getTextValue(item: IListItem | undefined, aliases: string[]): string {
  if (!item) {
    return '';
  }

  for (const alias of aliases) {
    const key = alias as keyof IListItem;
    const value = item[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
}

export class AssistantSummaryService {
  constructor(private readonly sp: SPFI) {}

  public async getSummary(course: ICourse): Promise<string> {
    const fallback = course.description?.trim() || `No summary has been added for ${course.title} yet.`;

    try {
      const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.aiAssistantLogs);
      const fields = await list.fields
        .select('InternalName', 'TypeAsString', 'LookupList', 'ReadOnlyField', 'Hidden')() as IListField[];
      const courseField = findField(fields, ['Course', 'LearningMaterial', 'RelatedMaterial', 'Material'], ['Lookup', 'Text', 'Note']);
      const summaryField = findField(fields, ['Summary', 'SummaryText', 'Content', 'Message', 'Response', 'LogText'], ['Text', 'Note']);
      const items = await list.items.select('*').top(500)() as IListItem[];
      const expectedTitle = course.title.trim().toLowerCase();
      const expectedCourseCode = course.materialCode?.trim().toLowerCase();

      const matched = items.find((item) => {
        const itemTitle = getTextValue(item, ['CourseTitle', 'Titles', 'Title']);
        const itemSummaryKey = [
          itemTitle,
          getTextValue(item, ['Summary', 'SummaryText', 'Content', 'Message', 'Response', 'LogText'])
        ].join(' ').toLowerCase();
        const lookupMatch = Number(item[`${courseField?.InternalName || 'Course'}Id`] || item.CourseId || 0);
        const lookupTitle = String(item[courseField?.InternalName || 'Course'] || '').trim().toLowerCase();
        return (
          lookupMatch === Number(course.id) ||
          lookupTitle === expectedTitle ||
          itemSummaryKey.indexOf(expectedTitle) >= 0 ||
          (expectedCourseCode ? itemSummaryKey.indexOf(expectedCourseCode) >= 0 : false)
        );
      });

      const summary = matched
        ? (
          summaryField
            ? String(matched[summaryField.InternalName] || '').trim()
            : ''
        ) || getTextValue(matched, ['Summary', 'SummaryText', 'Content', 'Message', 'Response', 'LogText'])
        : '';

      return summary || fallback;
    } catch {
      return fallback;
    }
  }
}

import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { ICourse } from '../types/ICourse';
import { SHAREPOINT_LISTS } from '../utils/constants';

interface ILearningMaterialItem {
  Id: number;
  Title?: string;
  Titles?: string;
  MaterialCode?: string;
  Category?: string;
  Department?: string;
  AudienceLevel?: string;
  MaterialType?: string;
  Descriptions?: string;
  IsRequired?: boolean;
  EstimatedDuration?: number;
  ExpiryDate?: string;
  ReviewDate?: string;
  Status?: string;
  Tags?: unknown;
  Modified?: string;
  FileLeafRef?: string;
  FileRef?: string;
  FSObjType?: number;
  File?: {
    Name?: string;
    ServerRelativeUrl?: string;
  };
}

function normalizeTags(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map((tag) => {
        if (typeof tag === 'string') {
          return tag;
        }

        if (tag && typeof tag === 'object') {
          const term = tag as { Label?: string; label?: string; Title?: string };
          return term.Label || term.label || term.Title || '';
        }

        return '';
      })
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    const collection = value as {
      results?: unknown[];
      Label?: string;
      label?: string;
      Title?: string;
    };

    if (Array.isArray(collection.results)) {
      return normalizeTags(collection.results);
    }

    const label = collection.Label || collection.label || collection.Title;
    return label ? [label] : [];
  }

  return [];
}

const gradients = [
  'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
  'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
  'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)',
  'linear-gradient(90deg, #c2410c 0%, #f97316 100%)'
];

export class CourseService {
  constructor(private readonly sp: SPFI) {}

  public async getCourses(): Promise<ICourse[]> {
    const items = await this.sp.web.lists
      .getByTitle(SHAREPOINT_LISTS.learningMaterials)
      .items
      .select('*,File/Name,File/ServerRelativeUrl')
      .expand('File')
      .orderBy('Modified', false)
      .top(200)() as ILearningMaterialItem[];

    return items
      .filter((item) => !!(item.File?.ServerRelativeUrl || item.FileRef))
      .map((item, index) => {
        const fileName = item.File?.Name || item.FileLeafRef;
        const documentUrl = item.File?.ServerRelativeUrl || item.FileRef;
        const estimatedMinutes = Number(item.EstimatedDuration) || 0;
        const tags = normalizeTags(item.Tags);

        return {
          id: item.Id.toString(),
          title: item.Titles || item.Title || fileName || 'Learning material',
          description: item.Descriptions || '',
          subject: item.Category || item.Department || 'General',
          level: item.AudienceLevel || 'All Staff',
          status: item.Status || 'Published',
          totalTopics: 1,
          estimatedHours: estimatedMinutes / 60,
          estimatedMinutes,
          progress: 0,
          focusArea: item.Department || item.Category || 'General',
          lessons: 1,
          quizzes: 0,
          highlight: item.IsRequired ? 'Required' : item.MaterialType || '',
          gradient: gradients[index % gradients.length],
          materialCode: item.MaterialCode,
          materialType: item.MaterialType,
          department: item.Department,
          audienceLevel: item.AudienceLevel,
          isRequired: !!item.IsRequired,
          expiryDate: item.ExpiryDate,
          reviewDate: item.ReviewDate,
          tags,
          fileName,
          documentUrl,
          modifiedDate: item.Modified
        };
      });
  }
}

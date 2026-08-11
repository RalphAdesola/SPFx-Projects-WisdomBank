import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { SHAREPOINT_LISTS } from '../utils/constants';

interface IListField {
  InternalName: string;
  Title: string;
  TypeAsString: string;
  ReadOnlyField: boolean;
  Hidden: boolean;
  LookupList?: string;
}

interface IListItem {
  Id: number;
  Title?: string;
  Titles?: string;
  [key: string]: unknown;
}

interface IAssessmentReference {
  id: number;
  duplicateIds: number[];
}

export interface IAssessmentQuestionInput {
  title: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface IAssessmentAttempt {
  assessmentTitle: string;
  courseTitle: string;
  relatedMaterialTitle: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: IAssessmentQuestionInput[];
  userId: number;
  userDisplayName: string;
  userEmail: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  answersJSON: string;
  submittedAt: string;
}

function normalizeFieldName(value: string): string {
  return value
    .replace(/_x0020_/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function findField(
  fields: IListField[],
  aliases: string[],
  supportedTypes?: string[]
): IListField | undefined {
  const normalizedAliases = aliases.map(normalizeFieldName);

  return fields.find((field) =>
    normalizedAliases.indexOf(normalizeFieldName(field.InternalName)) >= 0 &&
    (!supportedTypes || supportedTypes.indexOf(field.TypeAsString) >= 0)
  );
}

function setField(
  payload: Record<string, unknown>,
  fields: IListField[],
  aliases: string[],
  value: unknown,
  supportedTypes?: string[]
): IListField | undefined {
  const field = findField(fields, aliases, supportedTypes);

  if (!field || value === undefined || value === null) {
    return field;
  }

  if (field.TypeAsString === 'User' || field.TypeAsString === 'Lookup') {
    payload[`${field.InternalName}Id`] = value;
  } else {
    payload[field.InternalName] = value;
  }

  return field;
}

export class QuizService {
  constructor(private readonly sp: SPFI) {}

  public async submitAssessment(attempt: IAssessmentAttempt): Promise<void> {
    const assessment = await this.upsertAssessment(attempt);
    await this.upsertQuestions(assessment.id, assessment.duplicateIds, attempt.questions);
    await this.addAssessmentResult(assessment.id, attempt);
    await this.addCompletionNotification(attempt);
  }

  private async getFields(listTitle: string): Promise<IListField[]> {
    const fields = await this.sp.web.lists
      .getByTitle(listTitle)
      .fields
      .select(
        'InternalName',
        'Title',
        'TypeAsString',
        'ReadOnlyField',
        'Hidden',
        'LookupList'
      )() as IListField[];

    return fields.filter((field) => !field.ReadOnlyField && !field.Hidden);
  }

  private async resolveLookupId(field: IListField | undefined, title: string): Promise<number | undefined> {
    if (!field?.LookupList || !title) {
      return undefined;
    }

    const items = await this.sp.web.lists
      .getById(field.LookupList)
      .items
      .select('*')
      .top(500)() as IListItem[];
    const expectedTitle = title.trim().toLowerCase();
    const exactMatch = items.find((item) => {
      const itemTitle = String(item.Titles || item.Title || item.FileLeafRef || '').trim().toLowerCase();
      return itemTitle === expectedTitle;
    });

    if (exactMatch) {
      return exactMatch.Id;
    }

    const expectedTokens = new Set(
      expectedTitle.split(/\s+/).filter((token) => token.length > 2)
    );
    let bestMatch: IListItem | undefined;
    let bestScore = 0;
    for (const item of items) {
      const itemTitle = String(item.Titles || item.Title || item.FileLeafRef || '').trim().toLowerCase();
      const itemTokens = new Set(itemTitle.split(/\s+/).filter((token) => token.length > 2));
      const matches = Array.from(expectedTokens).filter((token) => itemTokens.has(token)).length;
      const score = matches / Math.max(1, Math.min(expectedTokens.size, itemTokens.size));
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    return bestScore >= 0.6 ? bestMatch?.Id : undefined;
  }

  private async upsertAssessment(attempt: IAssessmentAttempt): Promise<IAssessmentReference> {
    const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.assessments);
    const fields = await this.getFields(SHAREPOINT_LISTS.assessments);
    const payload: Record<string, unknown> = {
      Title: attempt.assessmentTitle
    };

    setField(payload, fields, ['Titles'], attempt.assessmentTitle, ['Text', 'Note']);
    setField(payload, fields, ['PassingScore'], attempt.passingScore, ['Number', 'Integer']);
    setField(
      payload,
      fields,
      ['TimeLimitMinutes', 'TimeLimitMinute', 'TimeLimit'],
      attempt.timeLimitMinutes,
      ['Number', 'Integer']
    );
    setField(payload, fields, ['Status'], 'Active', ['Choice', 'Text']);

    const courseField = findField(fields, ['Course'], ['Lookup']);
    const courseId = await this.resolveLookupId(courseField, attempt.courseTitle);
    setField(payload, fields, ['Course'], courseId, ['Lookup']);

    const materialField = findField(fields, ['RelatedMaterial'], ['Lookup']);
    const materialId = await this.resolveLookupId(materialField, attempt.relatedMaterialTitle);
    setField(payload, fields, ['RelatedMaterial'], materialId, ['Lookup']);

    const assessments = await list.items.select('*').top(500)() as IListItem[];
    const expectedTitle = attempt.assessmentTitle.trim().toLowerCase();
    const matchingAssessments = assessments.filter((item) => {
      const itemTitle = String(item.Titles || item.Title || '').trim().toLowerCase();
      return itemTitle === expectedTitle || itemTitle.indexOf(`${expectedTitle} -`) === 0;
    }).sort((left, right) => left.Id - right.Id);
    const existing = matchingAssessments[0];

    if (existing) {
      await list.items.getById(existing.Id).update(payload);
      return {
        id: existing.Id,
        duplicateIds: matchingAssessments.slice(1).map((item) => item.Id)
      };
    }

    const created = await list.items.add(payload) as {
      data?: { Id?: number; ID?: number };
      Id?: number;
    };
    const assessmentId = Number(created.data?.Id || created.data?.ID || created.Id);

    if (!assessmentId) {
      throw new Error('The assessment was created, but SharePoint did not return its item ID.');
    }

    return {
      id: assessmentId,
      duplicateIds: []
    };
  }

  private async upsertQuestions(
    assessmentId: number,
    duplicateAssessmentIds: number[],
    questions: IAssessmentQuestionInput[]
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.assessmentQuestions);
    const fields = await this.getFields(SHAREPOINT_LISTS.assessmentQuestions);
    const assessmentField = findField(fields, ['Assessment'], ['Lookup']);
    const requiredFields = [
      assessmentField,
      findField(fields, ['QuestionText'], ['Text', 'Note']),
      findField(fields, ['OptionA'], ['Text', 'Note']),
      findField(fields, ['OptionB'], ['Text', 'Note']),
      findField(fields, ['CorrectAnswer'], ['Text', 'Note', 'Choice'])
    ];

    if (requiredFields.some((field) => !field)) {
      throw new Error(
        'Assessment Questions is missing one or more required columns: Assessment, QuestionText, OptionA, OptionB, or CorrectAnswer.'
      );
    }

    const assessmentLookupName = `${assessmentField!.InternalName}Id`;
    const existingItems = await list.items.select('*').top(500)() as IListItem[];
    const duplicateQuestions = existingItems.filter((item) =>
      duplicateAssessmentIds.indexOf(Number(item[assessmentLookupName])) >= 0
    );
    const existingQuestions = existingItems
      .filter((item) => Number(item[assessmentLookupName]) === assessmentId)
      .sort((left, right) => left.Id - right.Id);
    const retainedQuestionIds = new Set<number>();
    const hasValidQuestionSet =
      duplicateQuestions.length === 0 &&
      existingQuestions.length === questions.length &&
      questions.every((question) =>
        existingQuestions.some((item) =>
          String(item.Titles || item.Title || '').trim().toLowerCase() ===
            question.title.trim().toLowerCase() &&
          String(item.QuestionText || '').trim().toLowerCase() ===
            question.questionText.trim().toLowerCase()
        )
      );

    if (hasValidQuestionSet) {
      return;
    }

    for (const duplicateQuestion of duplicateQuestions) {
      await list.items.getById(duplicateQuestion.Id).delete();
    }

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      const payload: Record<string, unknown> = {
        Title: question.title
      };

      setField(payload, fields, ['Titles'], question.title, ['Text', 'Note']);
      setField(payload, fields, ['Assessment'], assessmentId, ['Lookup']);
      setField(payload, fields, ['QuestionText'], question.questionText, ['Text', 'Note']);
      setField(payload, fields, ['QuestionType'], question.questionType, ['Choice', 'Text']);
      setField(payload, fields, ['OptionA'], question.options[0] || '', ['Text', 'Note']);
      setField(payload, fields, ['OptionB'], question.options[1] || '', ['Text', 'Note']);
      setField(payload, fields, ['OptionC'], question.options[2] || '', ['Text', 'Note']);
      setField(payload, fields, ['OptionD'], question.options[3] || '', ['Text', 'Note']);
      setField(payload, fields, ['CorrectAnswer'], question.correctAnswer, ['Text', 'Note', 'Choice']);
      setField(payload, fields, ['Points'], question.points, ['Number', 'Integer']);

      const expectedTitle = question.title.toLowerCase();
      const matchingQuestions = existingQuestions.filter((item) =>
        String(item.Titles || item.Title || '').trim().toLowerCase() === expectedTitle ||
        String(item.QuestionText || '').trim().toLowerCase() === question.questionText.trim().toLowerCase()
      );
      const existing = matchingQuestions[0];

      if (existing) {
        await list.items.getById(existing.Id).update(payload);
        retainedQuestionIds.add(existing.Id);

        for (const duplicateQuestion of matchingQuestions.slice(1)) {
          await list.items.getById(duplicateQuestion.Id).delete();
        }
      } else {
        await list.items.add(payload);
      }
    }

    for (const obsoleteQuestion of existingQuestions) {
      if (!retainedQuestionIds.has(obsoleteQuestion.Id)) {
        const expectedQuestion = questions.some((question) =>
          String(obsoleteQuestion.Titles || obsoleteQuestion.Title || '').trim().toLowerCase() ===
          question.title.trim().toLowerCase()
        );

        if (!expectedQuestion) {
          await list.items.getById(obsoleteQuestion.Id).delete();
        }
      }
    }

    const savedQuestions = await list.items
      .select('Id', assessmentLookupName)
      .filter(`${assessmentLookupName} eq ${assessmentId}`)
      .top(100)() as IListItem[];

    if (savedQuestions.length !== questions.length) {
      throw new Error(
        `SharePoint saved ${savedQuestions.length} of ${questions.length} assessment questions.`
      );
    }
  }

  private async addAssessmentResult(
    assessmentId: number,
    attempt: IAssessmentAttempt
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.assessmentResults);
    const fields = await this.getFields(SHAREPOINT_LISTS.assessmentResults);
    const submittedDate = new Date(attempt.submittedAt);
    const resultTitle = `${attempt.assessmentTitle} - ${attempt.userDisplayName} - ${submittedDate.toLocaleString()}`;
    const payload: Record<string, unknown> = {
      Title: resultTitle
    };

    setField(payload, fields, ['Titles'], resultTitle, ['Text', 'Note']);
    setField(payload, fields, ['Employee'], attempt.userId, ['User']);
    setField(payload, fields, ['Assessment'], assessmentId, ['Lookup']);

    const courseField = findField(fields, ['Course'], ['Lookup']);
    const courseId = await this.resolveLookupId(courseField, attempt.courseTitle);
    setField(payload, fields, ['Course'], courseId, ['Lookup']);
    setField(payload, fields, ['CourseTitle', 'CourseName'], attempt.courseTitle, ['Text', 'Note']);

    setField(payload, fields, ['Score'], attempt.score, ['Number', 'Integer']);
    setField(payload, fields, ['Passed'], attempt.passed, ['Boolean']);
    setField(payload, fields, ['SubmittedDate'], attempt.submittedAt, ['DateTime']);
    setField(payload, fields, ['CorrectCount'], attempt.correctAnswers, ['Number', 'Integer']);
    setField(payload, fields, ['IncorrectCount'], attempt.incorrectAnswers, ['Number', 'Integer']);
    setField(payload, fields, ['AnswersJSON', 'ResponsesJSON'], attempt.answersJSON, ['Text', 'Note']);

    await list.items.add(payload);
  }

  private async addCompletionNotification(attempt: IAssessmentAttempt): Promise<void> {
    const list = this.sp.web.lists.getByTitle(SHAREPOINT_LISTS.notifications);
    const fields = await this.getFields(SHAREPOINT_LISTS.notifications);
    const title = `${attempt.assessmentTitle} completed`;
    const payload: Record<string, unknown> = {
      Title: title
    };

    setField(payload, fields, ['Titles'], title, ['Text', 'Note']);
    setField(
      payload,
      fields,
      ['Message'],
      'Assessment completed and scored. Your result has been saved. Proceed to view/download your certificate.',
      ['Text', 'Note']
    );
    setField(payload, fields, ['TargetEmployee'], attempt.userId, ['User']);
    setField(payload, fields, ['NotificationType'], 'Milestone', ['Choice', 'Text']);
    setField(payload, fields, ['IsRead'], false, ['Boolean']);

    const courseField = findField(fields, ['RelatedCourse'], ['Lookup']);
    const courseId = await this.resolveLookupId(courseField, attempt.courseTitle);
    setField(payload, fields, ['RelatedCourse'], courseId, ['Lookup']);

    await list.items.add(payload);
  }
}

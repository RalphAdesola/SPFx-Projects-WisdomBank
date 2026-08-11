import { IAssessmentQuestion } from './QuizQuestion';

export interface ICourseAssessment {
  title: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: IAssessmentQuestion[];
}

const cybersecurityQuestions: IAssessmentQuestion[] = [
  { text: 'Which action should be taken when a suspicious email is received?', options: ['Forward it to a colleague', 'Report it and do not click any links', 'Delete it without reporting', 'Reply with your password'], answer: 'Report it and do not click any links' },
  { text: 'What is the best way to handle confidential company information?', options: ['Store it in a public folder', 'Share it over personal email', 'Use approved tools and access controls', 'Leave it on a shared desk'], answer: 'Use approved tools and access controls' },
  { text: 'True or False: MFA adds an extra layer of protection to your account.', options: ['True', 'False'], answer: 'True' },
  { text: 'What should you do if you receive an unexpected MFA approval request?', options: ['Approve it quickly', 'Ignore it and continue working', 'Deny it and report the incident', 'Ask a colleague to approve it'], answer: 'Deny it and report the incident' },
  { text: 'Which password practice provides the strongest protection?', options: ['Reuse one complex password everywhere', 'Use unique passwords stored in an approved password manager', 'Write passwords in a notebook', 'Share passwords with your manager'], answer: 'Use unique passwords stored in an approved password manager' },
  { text: 'Which connection is safest when accessing company systems remotely?', options: ['Any public Wi-Fi network', 'A trusted network using the approved company VPN', 'A neighbour’s open Wi-Fi', 'A public computer at a café'], answer: 'A trusted network using the approved company VPN' },
  { text: 'What is the safest action before sharing a company document?', options: ['Give everyone edit access', 'Verify the recipient and apply the correct access permission', 'Upload it to a personal cloud drive', 'Remove the file name'], answer: 'Verify the recipient and apply the correct access permission' },
  { text: 'True or False: Installing unapproved software can introduce security risks.', options: ['True', 'False'], answer: 'True' },
  { text: 'What should happen when a company device is lost or stolen?', options: ['Wait several days to see if it appears', 'Replace it personally without reporting', 'Report it immediately through the approved channel', 'Post about it on social media'], answer: 'Report it immediately through the approved channel' },
  { text: 'Which sign is commonly associated with a phishing message?', options: ['An expected message from a verified internal system', 'Urgent language asking you to open an unfamiliar link', 'A scheduled calendar reminder', 'A document you requested from your manager'], answer: 'Urgent language asking you to open an unfamiliar link' }
];

const conductQuestions: IAssessmentQuestion[] = [
  { text: 'What should an employee do when a personal interest could influence a business decision?', options: ['Keep it private', 'Disclose the conflict promptly', 'Ask a friend to decide', 'Continue without documenting it'], answer: 'Disclose the conflict promptly' },
  { text: 'Which action best reflects responsible use of company assets?', options: ['Use them mainly for personal business', 'Protect them and use them for authorized work', 'Share access with friends', 'Remove equipment without approval'], answer: 'Protect them and use them for authorized work' },
  { text: 'True or False: Retaliation against someone who reports a concern in good faith is acceptable.', options: ['True', 'False'], answer: 'False' },
  { text: 'What is the appropriate response to suspected misconduct?', options: ['Ignore it', 'Post it publicly', 'Report it through an approved channel', 'Investigate colleagues secretly'], answer: 'Report it through an approved channel' },
  { text: 'How should confidential information be handled?', options: ['Shared with anyone who asks', 'Protected and disclosed only for authorized business needs', 'Stored on personal accounts', 'Discussed in public areas'], answer: 'Protected and disclosed only for authorized business needs' },
  { text: 'Which behavior supports a respectful workplace?', options: ['Discrimination', 'Harassment', 'Fair and professional treatment', 'Excluding colleagues unfairly'], answer: 'Fair and professional treatment' },
  { text: 'What should employees do with business records?', options: ['Alter inconvenient details', 'Maintain accurate and complete records', 'Delete them whenever desired', 'Use estimates as confirmed facts'], answer: 'Maintain accurate and complete records' },
  { text: 'When may a gift from a supplier be inappropriate?', options: ['When it could influence a business decision', 'When it has no value', 'When it is disclosed and approved', 'When policy clearly permits it'], answer: 'When it could influence a business decision' },
  { text: 'True or False: Bribery is acceptable when it helps the company win business.', options: ['True', 'False'], answer: 'False' },
  { text: 'What is the best guide when an ethical decision is unclear?', options: ['Personal convenience', 'Company policy and advice from the appropriate compliance channel', 'Competitor behavior', 'Social media opinions'], answer: 'Company policy and advice from the appropriate compliance channel' }
];

const handbookQuestions: IAssessmentQuestion[] = [
  { text: 'What should an employee do if they will be unexpectedly absent?', options: ['Say nothing', 'Notify the appropriate manager through the approved process', 'Ask a customer to report it', 'Wait until the next week'], answer: 'Notify the appropriate manager through the approved process' },
  { text: 'Where should an employee confirm the correct procedure for requesting leave?', options: ['Social media', 'The employee handbook and approved HR process', 'A former employee', 'An external forum'], answer: 'The employee handbook and approved HR process' },
  { text: 'True or False: Workplace safety concerns should be reported promptly.', options: ['True', 'False'], answer: 'True' },
  { text: 'Which behavior is expected in the workplace?', options: ['Respectful and professional conduct', 'Harassment', 'Discrimination', 'Deliberate disruption'], answer: 'Respectful and professional conduct' },
  { text: 'How should employee and company confidential information be treated?', options: ['Shared freely', 'Protected according to policy', 'Sent to personal email', 'Published online'], answer: 'Protected according to policy' },
  { text: 'What should an employee do when they do not understand an HR policy?', options: ['Guess', 'Ask their manager or HR for clarification', 'Ignore it', 'Create a personal rule'], answer: 'Ask their manager or HR for clarification' },
  { text: 'True or False: Company systems should be used in accordance with acceptable-use policies.', options: ['True', 'False'], answer: 'True' },
  { text: 'What is the purpose of performance feedback?', options: ['To embarrass employees', 'To clarify expectations and support improvement', 'To replace all training', 'To avoid communication'], answer: 'To clarify expectations and support improvement' },
  { text: 'What should happen if an employee experiences or witnesses harassment?', options: ['Keep it secret', 'Report it through an approved channel', 'Respond publicly online', 'Delete all evidence'], answer: 'Report it through an approved channel' },
  { text: 'Why should employees review updates to the handbook?', options: ['To understand current responsibilities and workplace procedures', 'To avoid all manager discussions', 'To change policies themselves', 'To share confidential content externally'], answer: 'To understand current responsibilities and workplace procedures' }
];

const salesQuestions: IAssessmentQuestion[] = [
  { text: 'What is the primary purpose of a sales discovery conversation?', options: ['Deliver a long product speech', 'Understand the customer’s needs and desired outcomes', 'Negotiate immediately', 'Avoid asking questions'], answer: 'Understand the customer’s needs and desired outcomes' },
  { text: 'Which question is most useful for qualifying an opportunity?', options: ['What business problem are you trying to solve?', 'Do you like our logo?', 'Can we skip your requirements?', 'Will you buy without a proposal?'], answer: 'What business problem are you trying to solve?' },
  { text: 'True or False: A strong value proposition connects the solution to a customer outcome.', options: ['True', 'False'], answer: 'True' },
  { text: 'Why should sales activity be recorded in the CRM?', options: ['To create duplicate work', 'To maintain an accurate shared view of the opportunity', 'To hide customer information', 'To replace customer conversations'], answer: 'To maintain an accurate shared view of the opportunity' },
  { text: 'What is the best response to a customer objection?', options: ['Interrupt the customer', 'Listen, clarify the concern, and respond with relevant evidence', 'Ignore it', 'End the conversation'], answer: 'Listen, clarify the concern, and respond with relevant evidence' },
  { text: 'What should a good follow-up message include?', options: ['Unrelated marketing content', 'Agreed actions, owners, and next steps', 'Confidential data from another customer', 'No clear purpose'], answer: 'Agreed actions, owners, and next steps' },
  { text: 'Which practice improves sales forecasting?', options: ['Using unsupported assumptions', 'Keeping opportunity stages and dates current', 'Counting every lead as closed', 'Ignoring stalled deals'], answer: 'Keeping opportunity stages and dates current' },
  { text: 'True or False: Salespeople should promise features that do not exist to secure a deal.', options: ['True', 'False'], answer: 'False' },
  { text: 'When should customer success or delivery teams be involved?', options: ['Only after a complaint', 'Early enough to support a realistic handover and outcome', 'Never', 'Only before discovery'], answer: 'Early enough to support a realistic handover and outcome' },
  { text: 'What is the best basis for a sustainable customer relationship?', options: ['Pressure and incomplete information', 'Trust, clear expectations, and delivered value', 'Frequent unapproved discounts', 'Avoiding difficult conversations'], answer: 'Trust, clear expectations, and delivered value' }
];

const microsoft365Questions: IAssessmentQuestion[] = [
  { text: 'Where should a team store files that need shared ownership?', options: ['A personal desktop', 'The appropriate SharePoint or Teams location', 'A personal email inbox', 'An unapproved cloud drive'], answer: 'The appropriate SharePoint or Teams location' },
  { text: 'What is a key benefit of co-authoring in Microsoft 365?', options: ['Only one person can work at a time', 'Multiple authorized users can edit the same file together', 'Version history is removed', 'Files must be emailed repeatedly'], answer: 'Multiple authorized users can edit the same file together' },
  { text: 'True or False: Links are usually preferable to emailing multiple copies of the same document.', options: ['True', 'False'], answer: 'True' },
  { text: 'What should be checked before sharing a Microsoft 365 file?', options: ['The recipient and permission level', 'Only the file color', 'The recipient’s social profile', 'Nothing'], answer: 'The recipient and permission level' },
  { text: 'What does version history help users do?', options: ['Permanently hide changes', 'Review or restore earlier file versions', 'Remove ownership', 'Disable collaboration'], answer: 'Review or restore earlier file versions' },
  { text: 'When is a Teams channel preferable to a private chat?', options: ['For information the whole working team should find later', 'For personal passwords', 'For unrelated private matters', 'When no team exists'], answer: 'For information the whole working team should find later' },
  { text: 'Which filename is easiest for colleagues to understand?', options: ['Document1-final-final2', 'Q3 Sales Review 2026', 'New File', 'Untitled'], answer: 'Q3 Sales Review 2026' },
  { text: 'True or False: Sensitive information should follow organizational classification and sharing rules.', options: ['True', 'False'], answer: 'True' },
  { text: 'What is the safest response to an unexpected Microsoft 365 sharing invitation?', options: ['Open it immediately', 'Verify the sender and link before opening', 'Forward it externally', 'Enter credentials on any page'], answer: 'Verify the sender and link before opening' },
  { text: 'What is a good practice after a Microsoft Teams meeting?', options: ['Leave decisions undocumented', 'Store notes and agreed actions in the team’s shared workspace', 'Delete all shared files', 'Move records to a personal account'], answer: 'Store notes and agreed actions in the team’s shared workspace' }
];

const defaultAssessment: ICourseAssessment = {
  title: 'IT Security Assessment',
  passingScore: 70,
  timeLimitMinutes: 12,
  questions: cybersecurityQuestions
};

const assessmentsByCourse: Record<string, ICourseAssessment> = {
  'workplace cybersecurity awareness': defaultAssessment,
  'code of business conduct': {
    title: 'Code of Business Conduct Assessment',
    passingScore: 70,
    timeLimitMinutes: 12,
    questions: conductQuestions
  },
  'lban employee handbook': {
    title: 'LBAN Employee Handbook Assessment',
    passingScore: 70,
    timeLimitMinutes: 12,
    questions: handbookQuestions
  },
  'employee handbook 2026': {
    title: 'LBAN Employee Handbook Assessment',
    passingScore: 70,
    timeLimitMinutes: 12,
    questions: handbookQuestions
  },
  'enterprise sales playbook': {
    title: 'Enterprise Sales Playbook Assessment',
    passingScore: 70,
    timeLimitMinutes: 12,
    questions: salesQuestions
  },
  'microsoft 365 best practices': {
    title: 'Microsoft 365 Best Practices Assessment',
    passingScore: 70,
    timeLimitMinutes: 12,
    questions: microsoft365Questions
  }
};

export function getCourseAssessment(courseTitle?: string): ICourseAssessment {
  const normalizedTitle = (courseTitle || '').trim().toLowerCase();
  return assessmentsByCourse[normalizedTitle] || defaultAssessment;
}

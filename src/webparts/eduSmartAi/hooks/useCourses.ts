import { useEffect, useState } from 'react';
import { ICourse } from '../types/ICourse';

export interface IDataResult<T> {
  data: T;
  isLoading: boolean;
}

const sampleCourses: ICourse[] = [
  {
    id: 'handbook',
    title: 'Employee Handbook',
    description: 'Understand the organization’s values, policies, and day-to-day working expectations.',
    subject: 'People & Culture',
    level: 'Essential',
    status: 'Active',
    totalTopics: 8,
    estimatedHours: 3,
    progress: 88,
    focusArea: 'Culture & Policies',
    lessons: 8,
    quizzes: 2,
    highlight: 'Assigned this week',
    gradient: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)'
  },
  {
    id: 'security',
    title: 'Information Security Policy',
    description: 'Learn the essentials of safeguarding company data and handling sensitive information.',
    subject: 'Security',
    level: 'Intermediate',
    status: 'Active',
    totalTopics: 10,
    estimatedHours: 5,
    progress: 64,
    focusArea: 'Data Protection',
    lessons: 10,
    quizzes: 3,
    highlight: 'Due tomorrow',
    gradient: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)'
  },
  {
    id: 'm365',
    title: 'Microsoft 365 Best Practices',
    description: 'A practical guide to using Microsoft 365 tools securely and effectively.',
    subject: 'Productivity',
    level: 'Intermediate',
    status: 'Completed',
    totalTopics: 7,
    estimatedHours: 4,
    progress: 100,
    focusArea: 'Collaboration',
    lessons: 7,
    quizzes: 2,
    highlight: 'Certified',
    gradient: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)'
  },
  {
    id: 'sales',
    title: 'Sales Playbook',
    description: 'Review the approved customer engagement playbook and commercial enablement standards.',
    subject: 'Sales Enablement',
    level: 'Advanced',
    status: 'Active',
    totalTopics: 9,
    estimatedHours: 6,
    progress: 41,
    focusArea: 'Customer Conversations',
    lessons: 9,
    quizzes: 3,
    highlight: '',
    gradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)'
  }
];

export function useCourses(): IDataResult<ICourse[]> {
  const [data, setData] = useState<ICourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    setData(sampleCourses);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading
  };
}
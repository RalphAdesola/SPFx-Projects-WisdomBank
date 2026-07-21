import * as React from 'react';
import { TextField, DefaultButton, IDropdownOption, Persona, PersonaSize } from '@fluentui/react';
import { useCourses } from '../../hooks/useCourses';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CourseCard from './CourseCard';
import SkeletonLoader from '../shared/SkeletonLoader';
import styles from './MyCourses.module.scss';

const statusOptions: IDropdownOption[] = [
  { key: 'All', text: 'All' },
  { key: 'Active', text: 'In Progress' },
  { key: 'Completed', text: 'Completed' },
  { key: 'Draft', text: 'Planned' }
];

const subjectOptions: IDropdownOption[] = [
  { key: 'All', text: 'All' },
  { key: 'Security', text: 'Security' },
  { key: 'People & Culture', text: 'People & Culture' },
  { key: 'Productivity', text: 'Productivity' },
  { key: 'Sales Enablement', text: 'Sales Enablement' }
];

const MyCourses: React.FC = () => {
  const { data: courses, isLoading } = useCourses();
  const { data: currentUser } = useCurrentUser();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Active' | 'Completed' | 'Draft'>('All');
  const [subjectFilter, setSubjectFilter] = React.useState<string>('All');

  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || course.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <div className={styles.brandHeader}>
            <div className={styles.brandLogo}>WB</div>
            <div>
              <div className={styles.brandTitle}>WisdomBank</div>
              <div className={styles.brandSubtitle}>Personalized Learning Assistant</div>
            </div>
          </div>
          <h1>My Learning</h1>
          <p className={styles.pageSubtitle}>Stay current with assigned company documents, policy updates, and required learning materials.</p>
        </div>

        <div className={styles.userPanel}>
          <DefaultButton className={styles.notifyButton} text="Filter" />
          <Persona
            text={currentUser?.displayName || 'Learner'}
            size={PersonaSize.size40}
            secondaryText={currentUser?.email || ''}
          />
        </div>
      </div>

      <header className={styles.headerBar}>
        <div className={styles.searchContainer}>
          <TextField
            className={styles.searchField}
            placeholder="Search learning materials..."
            value={search}
            onChange={(_, value) => setSearch(value || '')}
          />
        </div>
        <div className={styles.searchActions}>
          <DefaultButton className={styles.filterButton} text="Filter" />
        </div>
      </header>

      <div className={styles.tabBar}>
        {subjectOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`${styles.tabButton} ${subjectFilter === option.key ? styles.tabActive : ''}`}
            onClick={() => setSubjectFilter(option.key as string)}
          >
            {option.text}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonLoader lines={4} />
      ) : (
        <div className={styles.courseGrid}>
          {filteredCourses.length === 0 ? (
            <div className={styles.empty}>No matching courses found.</div>
          ) : (
            filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';
import PageHeader from '../shared/PageHeader';
import styles from './LessonScreen.module.scss';

export interface ILessonScreenProps {
  theme: 'dark' | 'light';
}

const LessonScreen: React.FC<ILessonScreenProps> = ({ theme }) => (
  <div className={`${styles.lesson} ${theme === 'dark' ? styles.lessonDark : styles.lessonLight}`}>
    <PageHeader title="Learning Material Details" subtitle="Review the assigned document, capture the key points, and prepare for the assessment." theme={theme} />
    <div className={styles.contentGrid}>
      <section className={styles.mainColumn}>
        <div className={styles.breadcrumb}>Knowledge Library &gt; Security</div>
        <div className={styles.titleSection}>
          <h2>Information Security Policy</h2>
          <span className={styles.badge}>Required</span>
        </div>
        <div className={styles.lessonMeta}>Estimated reading time: 12 min • Document type: PDF • Updated: 2 days ago</div>
        <article className={styles.body}>
          <p>This document outlines the organization’s security expectations, including data handling, password practices, alerting procedures, and escalation requirements.</p>
          <p>Employees are expected to follow the approved process for handling confidential information and to report incidents promptly.</p>
          <h3>Objectives</h3>
          <ul>
            <li>Understand secure handling of company information</li>
            <li>Recognize common security risks</li>
            <li>Prepare for the required assessment</li>
          </ul>
        </article>
        <PrimaryButton text="Mark as Read" aria-label="Mark material as read" />
      </section>
      <aside className={styles.sidePanel}>
        <div className={styles.videoCard}>
          <div className={styles.videoLabel}>Document preview</div>
          <div className={styles.videoPlaceholder}>Policy preview placeholder</div>
        </div>
        <div className={styles.resources}>
          <h3>Key takeaways</h3>
          <ul>
            <li>Use approved tools for sharing files</li>
            <li>Protect credentials and MFA prompts</li>
            <li>Escalate suspicious activity immediately</li>
          </ul>
        </div>
        <PrimaryButton className={styles.quizButton} text="Launch Assessment" aria-label="Launch assessment" />
      </aside>
    </div>
  </div>
);

export default LessonScreen;

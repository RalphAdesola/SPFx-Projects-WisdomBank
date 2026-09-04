import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';
import styles from './LandingPage.module.scss';
import landingBackground from '../../assets/landingpage.jpg';

export interface ILandingPageProps {
  onGetStarted: () => void;
  theme: 'dark' | 'light';
}

const LandingPage: React.FC<ILandingPageProps> = ({ onGetStarted, theme }) => {
  const isDarkTheme = theme === 'dark';

  return (
    <section
      className={`${styles.hero} ${isDarkTheme ? styles.heroDark : styles.heroLight}`}
      style={{ backgroundImage: `url(${landingBackground})` }}>
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <div className={styles.topRow}>
          <div className={styles.brandGroup}>
            <span className={styles.brandTag}>Employee Learning Hub</span>
            <span className={styles.brandLabel}>Enterprise knowledge & learning platform</span>
          </div>
        </div>

        <div className={styles.heroHeader}>
          <h1>Welcome to Employee Learning</h1>
          <p>
            Your Efficient and Reliable Knowledge Hub.
          </p>
        </div>

        <div className={styles.actions}>
          <PrimaryButton className={styles.ctaButton} onClick={onGetStarted} aria-label="Proceed">
            Proceed
          </PrimaryButton>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <strong>Curated learning flows</strong>
            <span>Designed to keep learners engaged and moving forward.</span>
          </div>
          <div className={styles.featureCard}>
            <strong>AI-guided support</strong>
            <span>Answers, explanations, and suggestions right when you need them.</span>
          </div>
          <div className={styles.featureCard}>
            <strong>Clear progress insights</strong>
            <span>Track achievements with elegant, simple dashboards.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;

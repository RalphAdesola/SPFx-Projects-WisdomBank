import * as React from 'react';
import styles from './PageHeader.module.scss';

export interface IPageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  theme?: 'dark' | 'light';
}

const PageHeader: React.FC<IPageHeaderProps> = ({ title, subtitle, action, theme = 'light' }) => (
  <div className={`${styles.header} ${theme === 'dark' ? styles.headerDark : styles.headerLight}`}>
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {action ? <div className={styles.action}>{action}</div> : null}
  </div>
);

export default PageHeader;

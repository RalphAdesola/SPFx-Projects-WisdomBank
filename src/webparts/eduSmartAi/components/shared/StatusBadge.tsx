import * as React from 'react';
import styles from './StatusBadge.module.scss';

export interface IStatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const variantMap: Record<string, string> = {
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
  neutral: styles.neutral
};

const StatusBadge: React.FC<IStatusBadgeProps> = ({ label, variant = 'neutral' }) => (
  <span className={`${styles.badge} ${variantMap[variant]}`}>{label}</span>
);

export default StatusBadge;

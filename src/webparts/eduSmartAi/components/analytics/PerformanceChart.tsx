import * as React from 'react';
import styles from './PerformanceChart.module.scss';

export interface IPerformanceChartProps {
  data: Array<{ label: string; values: number[] }>;
}

const PerformanceChart: React.FC<IPerformanceChartProps> = ({ data }) => {
  return (
    <div className={styles.chartWrapper}>
      <svg viewBox="0 0 600 260" className={styles.chart} aria-label="Performance chart">
        <g transform="translate(40,20)">
          {data[0]?.values.map((_, index) => (
            <text key={index} x={index * 100} y={220} className={styles.axisLabel}>{`W${index + 1}`}</text>
          ))}
          {data.map((series, seriesIndex) => {
            const path = series.values.map((value, valueIndex) => `${valueIndex === 0 ? 'M' : 'L'}${valueIndex * 100} ${240 - value * 2.2}`).join(' ');
            return <path key={seriesIndex} d={path} fill="none" stroke={seriesIndex === 0 ? '#4f46e5' : seriesIndex === 1 ? '#10b981' : '#f59e0b'} strokeWidth="3" />;
          })}
        </g>
      </svg>
    </div>
  );
};

export default PerformanceChart;

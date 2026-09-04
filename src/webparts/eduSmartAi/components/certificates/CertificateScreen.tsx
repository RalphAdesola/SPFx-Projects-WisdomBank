import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import { useCertificates } from '../../hooks/useCertificates';
import { IAssessmentCertificate } from '../../services/AssessmentResultService';
import botImage from '../../assets/icons8-bot-100.png';
import styles from './CertificateScreen.module.scss';

export interface ICertificateScreenProps {
  theme: 'dark' | 'light';
  sp: SPFI;
  currentUserId: number;
  learnerName: string;
}

function formatDate(value?: string): string {
  return value ? new Date(value).toLocaleDateString() : 'Date unavailable';
}

function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function drawCenteredText(
  context: CanvasRenderingContext2D,
  text: string,
  y: number,
  maxWidth: number
): void {
  context.fillText(text, 800, y, maxWidth);
}

function downloadCertificate(certificate: IAssessmentCertificate): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1100;
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.fillStyle = '#f8fafc';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0f766e';
  context.fillRect(0, 0, canvas.width, 72);
  context.fillStyle = '#1f2937';
  context.fillRect(0, 1028, canvas.width, 72);
  context.strokeStyle = '#d4a72c';
  context.lineWidth = 8;
  context.strokeRect(42, 42, 1516, 1016);
  context.strokeStyle = '#0f766e';
  context.lineWidth = 2;
  context.strokeRect(62, 62, 1476, 976);

  context.textAlign = 'center';
  context.fillStyle = '#0f766e';
  context.font = '700 34px Arial';
  drawCenteredText(context, 'LBAN Employee', 160, 1200);
  context.fillStyle = '#6b7280';
  context.font = '500 24px Arial';
  drawCenteredText(context, 'ENTERPRISE KNOWLEDGE & LEARNING PLATFORM', 205, 1200);
  context.fillStyle = '#111827';
  context.font = '700 60px Georgia';
  drawCenteredText(context, 'Certificate of Course Completion', 330, 1400);
  context.fillStyle = '#6b7280';
  context.font = '400 25px Arial';
  drawCenteredText(context, 'This certificate is presented to', 405, 1200);
  context.fillStyle = '#111827';
  context.font = '700 54px Georgia';
  drawCenteredText(context, certificate.learnerName, 495, 1350);
  context.strokeStyle = '#d4a72c';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(360, 525);
  context.lineTo(1240, 525);
  context.stroke();
  context.fillStyle = '#6b7280';
  context.font = '400 25px Arial';
  drawCenteredText(context, 'for completing the assessment in', 600, 1200);
  context.fillStyle = '#0f766e';
  context.font = '700 42px Arial';
  drawCenteredText(context, certificate.courseTitle, 675, 1350);
  context.fillStyle = '#111827';
  context.font = '700 46px Arial';
  drawCenteredText(context, `Score: ${certificate.score}%`, 775, 600);
  context.fillStyle = certificate.passed ? '#047857' : '#b45309';
  context.font = '700 28px Arial';
  drawCenteredText(context, certificate.passed ? 'PASSED' : 'COMPLETED', 825, 600);

  context.fillStyle = '#374151';
  context.font = '400 22px Arial';
  context.textAlign = 'left';
  context.fillText(`Issued: ${formatDate(certificate.submittedDate)}`, 170, 930);
  context.textAlign = 'right';
  context.fillText(`Certificate ID: EL-${certificate.id}`, 1430, 930);
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';
  context.font = '600 20px Arial';
  drawCenteredText(context, 'Employee Learning & Development', 1072, 1200);

  const link = document.createElement('a');
  link.download = `${safeFileName(certificate.courseTitle)}-certificate.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

const CertificateScreen: React.FC<ICertificateScreenProps> = ({
  theme,
  sp,
  currentUserId,
  learnerName
}) => {
  const { data: certificates, isLoading, error } = useCertificates(
    sp,
    currentUserId,
    learnerName
  );

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <PageHeader
        title="Certificates Achieved"
        subtitle="View and download certificates for your completed assessments."
        theme={theme}
      />
      {isLoading ? (
        <SkeletonLoader lines={4} />
      ) : error ? (
        <div className={styles.empty}>{error.message}</div>
      ) : certificates.length === 0 ? (
        <div className={styles.empty}>Complete an assessment to receive your first certificate.</div>
      ) : (
        <div className={styles.list}>
          {certificates.map((certificate) => (
            <article className={styles.certificateItem} key={certificate.id}>
              <div className={styles.certificate}>
                <div className={styles.accentTop} />
                <div className={styles.certificateBody}>
                  <div className={styles.certificateBrand}>
                    <img src={botImage} alt="" />
                    <div>
                      <strong>LBAN Employee</strong>
                      <span>Enterprise knowledge & learning platform</span>
                    </div>
                  </div>
                  <div className={styles.certificateTitle}>Certificate of Course Completion</div>
                  <p>This certificate is presented to</p>
                  <h2>{certificate.learnerName}</h2>
                  <p>for completing the assessment in</p>
                  <h3>{certificate.courseTitle}</h3>
                  <div className={styles.resultRow}>
                    <div><span>Score</span><strong>{certificate.score}%</strong></div>
                    <div><span>Status</span><strong>{certificate.passed ? 'Passed' : 'Completed'}</strong></div>
                    <div><span>Issued</span><strong>{formatDate(certificate.submittedDate)}</strong></div>
                  </div>
                  <div className={styles.certificateFooter}>
                    <span>Employee Learning & Development</span>
                    <span>Certificate ID: EL-{certificate.id}</span>
                  </div>
                </div>
              </div>
              <DefaultButton
                className={styles.downloadButton}
                text="Download Certificate"
                iconProps={{ iconName: 'Download' }}
                onClick={() => downloadCertificate(certificate)}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateScreen;

import * as React from 'react';
import { IconButton, Nav } from '@fluentui/react';
import { AppRoute } from '../../hooks/useNavigation';
import botImage from '../../assets/icons8-bot-100.png';
import styles from './Navigation.module.scss';

export interface INavigationProps {
  selectedRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  institutionName: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const navLinks = [
  { name: 'Dashboard', route: AppRoute.Dashboard },
  { name: 'My Learning', route: AppRoute.MyCourses },
  { name: 'Recommended Learning', route: AppRoute.LearningPath },
  { name: 'Learning Material', route: AppRoute.Lesson },
  { name: 'Assessment', route: AppRoute.Quiz },
  { name: 'AI Assistant', route: AppRoute.AIAssistant },
  { name: 'Notifications', route: AppRoute.Notifications },
  { name: 'Analytics', route: AppRoute.Analytics },
  { name: 'Certificates', route: AppRoute.Certificates }
];

const Navigation: React.FC<INavigationProps> = ({ selectedRoute, onNavigate, institutionName, theme, onToggleTheme }) => {
  const isDarkTheme = theme === 'dark';

  return (
    <aside className={`${styles.sidebar} ${isDarkTheme ? styles.sidebarDark : styles.sidebarLight}`} aria-label="Application navigation">
      <div className={styles.brand}>
        <img className={styles.logo} src={botImage} alt="WisdomBank logo" />
        <div>
          <div className={styles.title}>WisdomBank</div>
          <div className={styles.subtitle}>{institutionName}</div>
        </div>
      </div>

      <nav>
        <Nav
          groups={[
            {
              links: navLinks.map((item) => ({
                key: item.route,
                name: item.name,
                url: '#',
                onClick: () => {
                  onNavigate(item.route);
                },
                isSelected: selectedRoute === item.route
              }))
            }
          ]}
        />
      </nav>
      <div className={styles.logoutArea}>
        <div className={styles.actionRow}>
          <IconButton
            className={styles.navIconButton}
            iconProps={{ iconName: 'Home' }}
            ariaLabel="Home"
            title="Home"
            onClick={() => onNavigate(AppRoute.Landing)}
          />
          <IconButton
            className={styles.navIconButton}
            iconProps={{ iconName: isDarkTheme ? 'Sunny' : 'ClearNight' }}
            ariaLabel={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={onToggleTheme}
          />
          <IconButton
            className={`${styles.navIconButton} ${styles.logoutButton}`}
            iconProps={{ iconName: 'SignOut' }}
            ariaLabel="Log out"
            title="Log out"
            onClick={() => onNavigate(AppRoute.Landing)}
          />
        </div>
      </div>
    </aside>
  );
};

export default Navigation;

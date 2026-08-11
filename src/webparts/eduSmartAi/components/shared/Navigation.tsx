import * as React from 'react';
import { IconButton, INavLink, Nav } from '@fluentui/react';
import { AppRoute } from '../../hooks/useNavigation';
import botImage from '../../assets/icons8-bot-100.png';
import styles from './Navigation.module.scss';

export interface INavigationProps {
  selectedRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  institutionName: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  unreadNotificationCount: number;
}

const navLinks = [
  { name: 'Dashboard', route: AppRoute.Dashboard },
  { name: 'My Learning', route: AppRoute.MyCourses },
  { name: 'Recommended Learning', route: AppRoute.LearningPath },
  { name: 'Notifications', route: AppRoute.Notifications },
  { name: 'Certificates', route: AppRoute.Certificates }
];

const Navigation: React.FC<INavigationProps> = ({
  selectedRoute,
  onNavigate,
  institutionName,
  theme,
  onToggleTheme,
  unreadNotificationCount
}) => {
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
          key={`${selectedRoute}-${unreadNotificationCount}`}
          selectedKey={selectedRoute}
          onRenderLink={(link?: INavLink) => (
            <div className={styles.navLinkText}>
              <span>{link?.name}</span>
              {link?.key === AppRoute.Notifications && unreadNotificationCount > 0 ? (
                <span className={styles.notificationCount}>({unreadNotificationCount})</span>
              ) : null}
            </div>
          )}
          groups={[
            {
              links: navLinks.map((item) => ({
                key: item.route,
                name: item.name,
                ariaLabel: item.route === AppRoute.Notifications && unreadNotificationCount > 0
                  ? `Notifications, ${unreadNotificationCount} unread`
                  : item.name,
                url: '#',
                onClick: (event?: React.MouseEvent<HTMLElement>) => {
                  event?.preventDefault();
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
        </div>
      </div>
    </aside>
  );
};

export default Navigation;

import styles from "../styles";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS, ROLE_LABELS, ROLE_COLORS, ROLE_PAGE_ACCESS } from "../constants";


export default function TopNav({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  const canAccess = (pageId) =>
    (ROLE_PAGE_ACCESS[user.role] || []).includes(pageId);

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.navLogo}>
        <span style={styles.navLogoIcon}>🎖</span>
        <div style={styles.navLogoBlock}>
          <span style={styles.navLogoText}>ARMISTRACK</span>
          <span style={styles.navLogoSub}>Asset Management</span>
        </div>
      </div>

      {/* Page links */}
      <div style={styles.navItems}>
        {NAV_ITEMS.map((item) =>
          canAccess(item.id) ? (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                ...styles.navItem,
                ...(activePage === item.id ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navItemIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ) : null
        )}
      </div>

      {/* User info + logout */}
      <div style={styles.navUser}>
        <div
          style={{
            ...styles.navRolePill,
            background: ROLE_COLORS[user.role] + "33",
            border: `1px solid ${ROLE_COLORS[user.role]}55`,
          }}
        >
          <span style={{ ...styles.navRoleDot, background: ROLE_COLORS[user.role] }} />
          <span style={{ ...styles.navRoleText, color: ROLE_COLORS[user.role] }}>
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <span style={styles.navUserName}>{user.name}</span>
        <button style={styles.navLogout} onClick={logout}>
          LOGOUT
        </button>
      </div>
    </nav>
  );
}
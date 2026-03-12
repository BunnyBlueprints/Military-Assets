import { useState } from "react";
import styles from "../styles";
import { useAuth } from "../context/AuthContext";
import { DEMO_USERS, ROLE_LABELS, ROLE_COLORS } from "../constants";

/**
 * Full-page authentication form shown before the user is logged in.
 * Includes a quick-access panel to pre-fill demo credentials by role.
 */
export default function LoginScreen() {
  const { login } = useAuth();

  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (user, idx) => {
    setUsername(user.username);
    setPassword(user.password);
    setSelectedIdx(idx);
  };

  return (
    <div style={styles.loginBg}>
      <div style={styles.loginGlow} />

      <div style={styles.loginCard}>
        {/* ── Branding ── */}
        <div style={styles.loginHeader}>
          <div style={styles.loginBadge}>🎖</div>
          <h1 style={styles.loginTitle}>ARMISTRACK</h1>
          <p style={styles.loginSubtitle}>Military Asset Management System</p>
          <div style={styles.loginDivider} />
          <p style={styles.loginClearance}>CLASSIFICATION: SECRET // NOFORN</p>
        </div>

        {/* ── Quick-access role panel ── */}
        <div style={styles.loginQuickAccess}>
          <p style={styles.loginQuickLabel}>QUICK ACCESS — SELECT ROLE</p>
          <div style={styles.loginRoleGrid}>
            {DEMO_USERS.map((u, i) => (
              <button
                key={i}
                onClick={() => quickFill(u, i)}
                style={{
                  ...styles.loginRoleBtn,
                  ...(selectedIdx === i ? styles.loginRoleBtnActive : {}),
                }}
              >
                <span style={{ ...styles.loginRoleDot, background: ROLE_COLORS[u.role] }} />
                <div>
                  <div style={styles.loginRoleName}>{u.name.split(" ").slice(-1)[0]}</div>
                  <div style={styles.loginRoleType}>{ROLE_LABELS[u.role]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Credential fields ── */}
        <div style={styles.loginFields}>
          <label style={styles.loginLabel}>OPERATOR ID</label>
          <input
            style={styles.loginInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />

          <label style={styles.loginLabel}>ACCESS CODE</label>
          <input
            style={styles.loginInput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && <p style={styles.loginError}>{error}</p>}

          <button
            style={{ ...styles.loginBtn, opacity: loading ? 0.6 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "AUTHENTICATING..." : "AUTHENTICATE →"}
          </button>
        </div>
      </div>
    </div>
  );
}
import styles from "../styles";

/**
 * LoadingRow
 * Full-width table row shown while data is being fetched.
 */
export function LoadingRow() {
  return (
    <tr>
      <td
        colSpan={20}
        style={{ ...styles.td, textAlign: "center", padding: 32, color: "#4a7fa8" }}
      >
        ⟳ Loading data...
      </td>
    </tr>
  );
}

export function ErrorBanner({ msg, onRetry }) {
  return (
    <div style={styles.errorBanner}>
      ⚠ {msg}
      {onRetry && (
        <button style={{ ...styles.smallBtn, marginLeft: 12 }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
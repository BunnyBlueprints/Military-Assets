import styles from "../styles";

export default function NetMovementModal({ data, onClose }) {
  if (!data) return null;

  const breakdown = [
    { label: "Purchases",      value: data.purchased   || 0, color: "#2a9d8f", icon: "⊕" },
    { label: "Transfers In",   value: data.transferIn  || 0, color: "#f4a261", icon: "↓" },
    { label: "Transfers Out",  value: data.transferOut || 0, color: "#e63946", icon: "↑" },
  ];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Net Movement Breakdown</h2>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <p style={styles.modalSub}>
          {data.base} · {data.equipment || "All Equipment"}
        </p>

        {/* Three stat tiles */}
        <div style={styles.modalGrid}>
          {breakdown.map((item) => (
            <div
              key={item.label}
              style={{ ...styles.modalStatCard, borderColor: item.color + "44" }}
            >
              <div style={{ fontSize: 28, color: item.color }}>{item.icon}</div>
              <div style={styles.modalStatLabel}>{item.label}</div>
              <div style={{ ...styles.modalStatValue, color: item.color }}>
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Formula row */}
        <div style={styles.modalNetRow}>
          <span style={styles.modalNetLabel}>NET MOVEMENT =</span>
          <span style={styles.modalNetFormula}>
            Purchases ({data.purchased || 0}) + Transfers In ({data.transferIn || 0}) − Transfers Out ({data.transferOut || 0})
          </span>
          <span style={styles.modalNetResult}>{data.netMovement || 0}</span>
        </div>
      </div>
    </div>
  );
}
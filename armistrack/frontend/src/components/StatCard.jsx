import { useState } from "react";
import styles from "../styles";

export default function StatCard({ label, value, sub, color, onClick, clickable }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.statCard,
        ...(hovered && clickable ? styles.statCardHover : {}),
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div style={{ ...styles.statCardAccent, background: color }} />
      <div style={styles.statCardLabel}>{label}</div>
      <div style={{ ...styles.statCardValue, color }}>
        {typeof value === "number" ? value.toLocaleString() : (value ?? "—")}
      </div>
      {sub && <div style={styles.statCardSub}>{sub}</div>}
      {clickable && <div style={{ ...styles.statCardClick, color }}>↗ Details</div>}
    </div>
  );
}
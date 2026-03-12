import { useState, useEffect, useCallback } from "react";
import styles from "../styles";
import { useAuth } from "../context/AuthContext";
import { BASES, EQUIPMENT_TYPES } from "../constants";
import { getDashboard } from "../api";
import StatCard from "../components/StatCard";
import NetMovementModal from "../components/NetMovementModal";
import { LoadingRow, ErrorBanner } from "../components/Feedback";

/**
 * Shows aggregated Opening Balance, Closing Balance, Net Movement,
 * Assigned, and Expended metrics across bases and equipment types.
 * Supports filters: Base, Equipment Type, Start Date, End Date.
 * Clicking Net Movement opens a breakdown modal.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const [filterBase,      setFilterBase]      = useState(user.base || "All");
  const [filterEquipment, setFilterEquipment] = useState("All");
  const [startDate,       setStartDate]       = useState("");
  const [endDate,         setEndDate]         = useState("");
  const [rows,            setRows]            = useState([]);
  const [totals,          setTotals]          = useState({});
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [modalData,       setModalData]       = useState(null);

  const basesForFilter = user.role === "admin" ? ["All", ...BASES] : [user.base];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterBase      !== "All") params.base      = filterBase;
      if (filterEquipment !== "All") params.equipment = filterEquipment;
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;

      const { data } = await getDashboard(params);
      setRows(data.rows);
      setTotals(data.totals);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filterBase, filterEquipment, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div style={styles.page}>
      {/* Header + filters */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>OPERATIONAL DASHBOARD</h2>
          <p style={styles.pageSubtitle}>Asset overview across all assigned bases</p>
        </div>
        <div style={styles.filterRow}>
          <select style={styles.select} value={filterBase} onChange={(e) => setFilterBase(e.target.value)}>
            {basesForFilter.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select style={styles.select} value={filterEquipment} onChange={(e) => setFilterEquipment(e.target.value)}>
            <option>All</option>
            {EQUIPMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
          </select>
          <input type="date" style={styles.select} value={startDate} onChange={(e) => setStartDate(e.target.value)} title="Start date" />
          <input type="date" style={styles.select} value={endDate}   onChange={(e) => setEndDate(e.target.value)}   title="End date" />
        </div>
      </div>

      {error && <ErrorBanner msg={error} onRetry={fetchData} />}

      {/* Summary stat cards */}
      <div style={styles.statGrid}>
        <StatCard label="OPENING BALANCE" value={totals.opening}     color="#6c91c2" sub="Start of period" />
        <StatCard label="CLOSING BALANCE" value={totals.closing}     color="#2a9d8f" sub="End of period" />
        <StatCard
          label="NET MOVEMENT"
          value={totals.netMovement}
          color="#f4a261"
          sub="Click for breakdown"
          clickable
          onClick={() =>
            setModalData({
              base:      filterBase === "All" ? "All Bases" : filterBase,
              equipment: filterEquipment === "All" ? "All Equipment" : filterEquipment,
              ...totals,
            })
          }
        />
        <StatCard label="ASSIGNED" value={totals.assigned} color="#e9c46a" sub="Deployed to units" />
        <StatCard label="EXPENDED" value={totals.expended} color="#e63946" sub="Used / consumed" />
      </div>

      {/* Inventory matrix table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>ASSET INVENTORY MATRIX</span>
          <span style={styles.tableBadge}>{rows.length} records</span>
        </div>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Base","Equipment","Opening","Purchased","Transfer In","Transfer Out","Net Movement","Assigned","Expended","Closing"]
                  .map((h) => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow />
              ) : (
                rows.map((r, i) => (
                  <tr key={i} style={{ ...styles.tr, background: i % 2 === 0 ? "#0d1b2a" : "#0a1520" }}>
                    <td style={styles.td}><span style={styles.basePill}>{r.base}</span></td>
                    <td style={styles.td}>{r.equipment}</td>
                    <td style={{ ...styles.td, color: "#6c91c2" }}>{r.opening}</td>
                    <td style={{ ...styles.td, color: "#2a9d8f" }}>{r.purchased}</td>
                    <td style={{ ...styles.td, color: "#f4a261" }}>{r.transferIn}</td>
                    <td style={{ ...styles.td, color: "#e63946" }}>{r.transferOut}</td>
                    <td style={styles.td}>
                      <span style={styles.netBadge} onClick={() => setModalData(r)}>
                        {r.netMovement} ↗
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: "#e9c46a" }}>{r.assigned}</td>
                    <td style={{ ...styles.td, color: "#e63946" }}>{r.expended}</td>
                    <td style={{ ...styles.td, color: "#2a9d8f", fontWeight: 700 }}>{r.closing}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Movement detail modal */}
      {modalData && (
        <NetMovementModal data={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
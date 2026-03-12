import { useState, useEffect, useCallback } from "react";
import styles from "../styles";
import { useAuth } from "../context/AuthContext";
import { BASES, EQUIPMENT_TYPES } from "../constants";
import { getTransfers, createTransfer, completeTransfer } from "../api";
import { formatDate } from "../utils/helper";
import { LoadingRow, ErrorBanner } from "../components/Feedback";

/**
 * Initiate and track inter-base asset transfers.
 * Admins and Base Commanders can mark "In Transit" transfers as Completed.
 * Accessible to: Admin, Base Commander, Logistics Officer.
 */
export default function TransfersPage() {
  const { user } = useAuth();

  const [transfers,  setTransfers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    date: "", fromBase: user.base || BASES[0], toBase: BASES[1],
    equipment: EQUIPMENT_TYPES[0], quantity: "", notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getTransfers();
      setTransfers(data.transfers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const handleSubmit = async () => {
    if (!form.date || !form.quantity || form.fromBase === form.toBase) return;
    setSubmitting(true);
    try {
      const { data } = await createTransfer({ ...form, quantity: parseInt(form.quantity) });
      setSuccess(`Transfer ${data.transfer.transferId} initiated: ${form.quantity} ${form.equipment} → ${form.toBase}`);
      setShowForm(false);
      setForm(emptyForm);
      fetchTransfers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeTransfer(id);
      setSuccess("Transfer marked as completed.");
      fetchTransfers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete transfer");
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>ASSET TRANSFERS</h2>
          <p style={styles.pageSubtitle}>Inter-base movement of critical assets</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "⇄ New Transfer"}
        </button>
      </div>

      {success && <div style={styles.successBanner}>{success}</div>}
      {error   && <ErrorBanner msg={error} onRetry={fetchTransfers} />}

      {/* Create form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>INITIATE TRANSFER ORDER</h3>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>DATE *</label>
              <input type="date" style={styles.formInput} value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>FROM BASE *</label>
              <select style={styles.formInput} value={form.fromBase}
                onChange={(e) => setForm({ ...form, fromBase: e.target.value })}
                disabled={user.role !== "admin"}>
                {BASES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>TO BASE *</label>
              <select style={styles.formInput} value={form.toBase}
                onChange={(e) => setForm({ ...form, toBase: e.target.value })}>
                {BASES.filter((b) => b !== form.fromBase).map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>EQUIPMENT *</label>
              <select style={styles.formInput} value={form.equipment}
                onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
                {EQUIPMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>QUANTITY *</label>
              <input type="number" style={styles.formInput} value={form.quantity} min="1"
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>NOTES</label>
              <input style={styles.formInput} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button
            style={{ ...styles.primaryBtn, opacity: submitting ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "INITIATING..." : "AUTHORIZE TRANSFER →"}
          </button>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>TRANSFER HISTORY</span>
          <span style={styles.tableBadge}>{transfers.length} records</span>
        </div>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID","Date","From","To","Equipment","Qty","Status","Authorized By","Action"]
                  .map((h) => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow />
              ) : (
                transfers.map((t, i) => (
                  <tr key={t._id} style={{ ...styles.tr, background: i % 2 === 0 ? "#0d1b2a" : "#0a1520" }}>
                    <td style={{ ...styles.td, color: "#6c91c2", fontFamily: "monospace" }}>{t.transferId}</td>
                    <td style={styles.td}>{formatDate(t.date)}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.basePill, background: "#e6394622", color: "#e63946", border: "1px solid #e6394444" }}>
                        {t.fromBase}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.basePill, background: "#2a9d8f22", color: "#2a9d8f", border: "1px solid #2a9d8f44" }}>
                        {t.toBase}
                      </span>
                    </td>
                    <td style={styles.td}>{t.equipment}</td>
                    <td style={{ ...styles.td, color: "#f4a261", fontWeight: 700 }}>{t.quantity}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPill,
                        ...(t.status === "Completed" ? styles.statusComplete : styles.statusTransit),
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={styles.td}>{t.authorizedBy}</td>
                    <td style={styles.td}>
                      {t.status === "In Transit" && user.role !== "logistics_officer" && (
                        <button style={styles.smallBtn} onClick={() => handleComplete(t._id)}>
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
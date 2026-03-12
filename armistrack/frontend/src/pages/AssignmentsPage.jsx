import { useState, useEffect } from "react";
import styles from "../styles";
import { useAuth } from "../context/AuthContext";
import { BASES, EQUIPMENT_TYPES } from "../constants";
import { getAssignments, createAssignment } from "../api";
import { formatDate } from "../utils/helper";
import { LoadingRow, ErrorBanner } from "../components/Feedback";

/**
 * Record asset assignments to personnel and expenditures (used/consumed).
 * Accessible to: Admin, Base Commander.
 * Logistics Officers see an Access Restricted screen.
 */
export default function AssignmentsPage() {
  const { user } = useAuth();

  // Declare all hooks before any conditional returns
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [filterType,  setFilterType]  = useState("All");

  const emptyForm = {
    date: "", base: user.base || BASES[0], equipment: EQUIPMENT_TYPES[0],
    quantity: "", type: "assigned", personnel: "", notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  // Logistics Officers are blocked - render after hooks
  if (user.role === "logistics_officer") {
    return (
      <div style={styles.page}>
        <div style={styles.accessDenied}>
          <div style={styles.accessIcon}>⊘</div>
          <h3 style={styles.accessTitle}>ACCESS RESTRICTED</h3>
          <p style={styles.accessText}>
            Logistics Officers do not have access to Assignments &amp; Expenditures.
            Contact your Base Commander.
          </p>
        </div>
      </div>
    );
  }

  const fetchAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterType !== "All") params.type = filterType;
      const { data } = await getAssignments(params);
      setAssignments(data.assignments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, [filterType]); // eslint-disable-line

  const handleSubmit = async () => {
    if (!form.date || !form.quantity || !form.personnel) return;
    setSubmitting(true);
    try {
      const { data } = await createAssignment({ ...form, quantity: parseInt(form.quantity) });
      setSuccess(
        `${form.type === "assigned" ? "Assignment" : "Expenditure"} ${data.assignment.assignmentId} recorded.`
      );
      setShowForm(false);
      setForm(emptyForm);
      fetchAssignments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>ASSIGNMENTS &amp; EXPENDITURES</h2>
          <p style={styles.pageSubtitle}>Track asset deployment to personnel and consumption</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "◉ Record Entry"}
        </button>
      </div>

      {success && <div style={styles.successBanner}>{success}</div>}
      {error   && <ErrorBanner msg={error} onRetry={fetchAssignments} />}

      {/* Create form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>NEW ASSIGNMENT / EXPENDITURE</h3>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>TYPE *</label>
              <select style={styles.formInput} value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="assigned">Assignment (to unit/personnel)</option>
                <option value="expended">Expenditure (used/consumed)</option>
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>DATE *</label>
              <input type="date" style={styles.formInput} value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>BASE</label>
              <select style={styles.formInput} value={form.base}
                onChange={(e) => setForm({ ...form, base: e.target.value })}
                disabled={user.role !== "admin"}>
                {BASES.map((b) => <option key={b}>{b}</option>)}
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
              <label style={styles.formLabel}>PERSONNEL / UNIT *</label>
              <input style={styles.formInput} value={form.personnel}
                onChange={(e) => setForm({ ...form, personnel: e.target.value })}
                placeholder="Unit name or personnel" />
            </div>
            <div style={{ ...styles.formField, gridColumn: "span 2" }}>
              <label style={styles.formLabel}>NOTES</label>
              <input style={styles.formInput} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes" />
            </div>
          </div>
          <button
            style={{ ...styles.primaryBtn, opacity: submitting ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "RECORDING..." : "RECORD ENTRY →"}
          </button>
        </div>
      )}

      {/* Filter */}
      <div style={styles.filterRow}>
        <select style={styles.select} value={filterType}
          onChange={(e) => setFilterType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="assigned">Assignments</option>
          <option value="expended">Expenditures</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>ASSIGNMENT / EXPENDITURE LOG</span>
          <span style={styles.tableBadge}>{assignments.length} records</span>
        </div>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID","Date","Type","Base","Equipment","Qty","Personnel / Unit","Recorded By","Notes"]
                  .map((h) => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow />
              ) : (
                assignments.map((a, i) => (
                  <tr key={a._id} style={{ ...styles.tr, background: i % 2 === 0 ? "#0d1b2a" : "#0a1520" }}>
                    <td style={{ ...styles.td, color: "#6c91c2", fontFamily: "monospace" }}>{a.assignmentId}</td>
                    <td style={styles.td}>{formatDate(a.date)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPill,
                        ...(a.type === "assigned" ? styles.typeAssigned : styles.typeExpended),
                      }}>
                        {a.type === "assigned" ? "◉ Assigned" : "✕ Expended"}
                      </span>
                    </td>
                    <td style={styles.td}><span style={styles.basePill}>{a.base}</span></td>
                    <td style={styles.td}>{a.equipment}</td>
                    <td style={{
                      ...styles.td,
                      color: a.type === "assigned" ? "#e9c46a" : "#e63946",
                      fontWeight: 700,
                    }}>
                      {a.quantity}
                    </td>
                    <td style={styles.td}>{a.personnel}</td>
                    <td style={{ ...styles.td, color: "#8892a4" }}>{a.createdBy?.name || "—"}</td>
                    <td style={{ ...styles.td, color: "#8892a4" }}>{a.notes || "—"}</td>
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
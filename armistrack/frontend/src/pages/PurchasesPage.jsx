import { useState, useEffect, useCallback } from "react";
import styles from "../styles";
import { useAuth } from "../context/AuthContext";
import { BASES, EQUIPMENT_TYPES } from "../constants";
import { getPurchases, createPurchase } from "../api";
import { formatDate } from "../utils/helper";
import { LoadingRow, ErrorBanner } from "../components/Feedback";

/**
 * Record new asset purchases for a base and view full purchase history.
 * Accessible to: Admin, Base Commander, Logistics Officer.
 */
export default function PurchasesPage() {
  const { user } = useAuth();

  const [purchases,       setPurchases]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const [showForm,        setShowForm]        = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [filterBase,      setFilterBase]      = useState(user.base || "All");
  const [filterEquipment, setFilterEquipment] = useState("All");
  const [filterDate,      setFilterDate]      = useState("");

  const emptyForm = {
    date: "", base: user.base || BASES[0],
    equipment: EQUIPMENT_TYPES[0], quantity: "", supplier: "", notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const basesForFilter = user.role === "admin" ? ["All", ...BASES] : [user.base];

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterBase      !== "All") params.base      = filterBase;
      if (filterEquipment !== "All") params.equipment = filterEquipment;
      if (filterDate)                params.startDate = filterDate;
      const { data } = await getPurchases(params);
      setPurchases(data.purchases);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, [filterBase, filterEquipment, filterDate]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const handleSubmit = async () => {
    if (!form.date || !form.quantity) return;
    setSubmitting(true);
    try {
      const { data } = await createPurchase({ ...form, quantity: parseInt(form.quantity) });
      setSuccess(`Purchase ${data.purchase.purchaseId} recorded successfully.`);
      setShowForm(false);
      setForm(emptyForm);
      fetchPurchases();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create purchase");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>PROCUREMENT RECORDS</h2>
          <p style={styles.pageSubtitle}>Log and review all asset acquisitions</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Record Purchase"}
        </button>
      </div>

      {success && <div style={styles.successBanner}>{success}</div>}
      {error   && <ErrorBanner msg={error} onRetry={fetchPurchases} />}

      {/* Create form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>NEW PURCHASE RECORD</h3>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.formLabel}>DATE *</label>
              <input type="date" style={styles.formInput} value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>BASE *</label>
              <select style={styles.formInput} value={form.base}
                onChange={(e) => setForm({ ...form, base: e.target.value })}
                disabled={user.role !== "admin"}>
                {BASES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>EQUIPMENT TYPE *</label>
              <select style={styles.formInput} value={form.equipment}
                onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
                {EQUIPMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>QUANTITY *</label>
              <input type="number" style={styles.formInput} value={form.quantity} min="1"
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>SUPPLIER</label>
              <input style={styles.formInput} value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Vendor name" />
            </div>
            <div style={styles.formField}>
              <label style={styles.formLabel}>NOTES</label>
              <input style={styles.formInput} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
            </div>
          </div>
          <button
            style={{ ...styles.primaryBtn, opacity: submitting ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "RECORDING..." : "CONFIRM PURCHASE →"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterRow}>
        <select style={styles.select} value={filterBase} onChange={(e) => setFilterBase(e.target.value)}>
          {basesForFilter.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select style={styles.select} value={filterEquipment} onChange={(e) => setFilterEquipment(e.target.value)}>
          <option>All</option>
          {EQUIPMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
        </select>
        <input type="date" style={styles.select} value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)} />
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>PURCHASE LOG</span>
          <span style={styles.tableBadge}>{purchases.length} records</span>
        </div>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID","Date","Base","Equipment","Quantity","Supplier","Recorded By","Notes"]
                  .map((h) => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow />
              ) : (
                purchases.map((p, i) => (
                  <tr key={p._id} style={{ ...styles.tr, background: i % 2 === 0 ? "#0d1b2a" : "#0a1520" }}>
                    <td style={{ ...styles.td, color: "#6c91c2", fontFamily: "monospace" }}>{p.purchaseId}</td>
                    <td style={styles.td}>{formatDate(p.date)}</td>
                    <td style={styles.td}><span style={styles.basePill}>{p.base}</span></td>
                    <td style={styles.td}>{p.equipment}</td>
                    <td style={{ ...styles.td, color: "#2a9d8f", fontWeight: 700 }}>{p.quantity?.toLocaleString()}</td>
                    <td style={styles.td}>{p.supplier || "—"}</td>
                    <td style={{ ...styles.td, color: "#8892a4" }}>{p.createdBy?.name || "—"}</td>
                    <td style={{ ...styles.td, color: "#8892a4" }}>{p.notes || "—"}</td>
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
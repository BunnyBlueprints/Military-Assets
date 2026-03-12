import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import TopNav      from "./components/TopNav";

import LoginScreen    from "./pages/LoginScreen";
import DashboardPage  from "./pages/DashboardPage";
import PurchasesPage  from "./pages/PurchasesPage";
import TransfersPage  from "./pages/TransfersPage";
import AssignmentsPage from "./pages/AssignmentsPage";


import styles from "./styles";


const PAGE_MAP = {
  dashboard:   <DashboardPage />,
  purchases:   <PurchasesPage />,
  transfers:   <TransfersPage />,
  assignments: <AssignmentsPage />,
};

function AppInner() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");


  if (loading) {
    return (
      <div style={{ ...styles.loginBg, justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "#4a7fa8", fontSize: 14, letterSpacing: 4 }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  return (
    <div style={styles.appShell}>
      <TopNav activePage={activePage} setActivePage={setActivePage} />
      {PAGE_MAP[activePage] || PAGE_MAP.dashboard}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
export const BASES = [
  "Alpha Base",
  "Bravo Base",
  "Charlie Base",
  "Delta Base",
];

export const EQUIPMENT_TYPES = [
  "Rifles",
  "Vehicles",
  "Ammunition",
  "Missiles",
  "Drones",
  "Artillery",
];

export const ROLE_LABELS = {
  admin:             "Administrator",
  base_commander:    "Base Commander",
  logistics_officer: "Logistics Officer",
};

export const ROLE_COLORS = {
  admin:             "#e63946",
  base_commander:    "#f4a261",
  logistics_officer: "#2a9d8f",
};

// Demo credentials shown on the login screen quick-access panel
export const DEMO_USERS = [
  { name: "Gen. Marcus Reid",  username: "gen.reid",   password: "admin123", role: "admin" },
  { name: "Col. Sarah Chen",   username: "col.chen",   password: "cmd123",   role: "base_commander" },
  { name: "Lt. James Okafor",  username: "lt.okafor",  password: "cmd456",   role: "base_commander" },
  { name: "Sgt. Nina Volkov",  username: "sgt.volkov", password: "log123",   role: "logistics_officer" },
  { name: "Cpl. David Torres", username: "cpl.torres", password: "log456",   role: "logistics_officer" },
];

// Navigation items — icon + route id
export const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   icon: "◈" },
  { id: "purchases",   label: "Purchases",   icon: "◎" },
  { id: "transfers",   label: "Transfers",   icon: "⇄" },
  { id: "assignments", label: "Assignments", icon: "◉" },
];

// Which pages each role is allowed to visit
export const ROLE_PAGE_ACCESS = {
  admin:             ["dashboard", "purchases", "transfers", "assignments"],
  base_commander:    ["dashboard", "purchases", "transfers", "assignments"],
  logistics_officer: ["dashboard", "purchases", "transfers"],
};
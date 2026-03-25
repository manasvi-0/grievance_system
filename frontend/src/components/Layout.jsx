import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  List,
  Shield,
  Building2,
  BarChart3,
  LogIn,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  /* 🔐 AUTH STATE */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FileText, label: "Submit Complaint", path: "/submit" },
    { icon: List, label: "My Complaints", path: "/complaints" },
    { icon: Shield, label: "Admin Panel", path: "/admin" },
    { icon: Building2, label: "Departments", path: "/departments" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },

  ];

  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      {/* SIDEBAR */}
      <aside className="sidebar fixed left-0 top-0 flex flex-col items-center justify-between py-8">
        
        {/* TOP */}
        <div className="flex flex-col items-center gap-8">
          {/* LOGO */}
          <div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B5FEF] to-[#7C7FFF]
                       flex items-center justify-center text-white font-bold text-lg"
          >
            G
          </div>

          {/* NAV */}
          <nav className="flex flex-col gap-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                title={label}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "sidebar-item-active" : ""}`
                }
              >
                <Icon size={22} />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
  {user ? (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }}
      className="sidebar-item"
      title="Logout"
    >
      <LogOut size={22} />
    </button>
  ) : (
    <NavLink to="/login" className="sidebar-item" title="Login">
      <LogIn size={22} />
    </NavLink>
  )}
</div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-20 p-8">
        {children}
      </main>
    </div>
  );
}

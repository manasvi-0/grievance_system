import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { supabase } from "../lib/supabase";

import {
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  Eye,
  Send,
  Building2,
  Sparkles,
  ShieldCheck,
  Activity,
} from "lucide-react";

/* ---------------- STATUS LABEL ---------------- */
const statusLabel = {
  pending: "Pending",
  progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

/* ---------------- FEATURES ---------------- */
const features = [
  {
    icon: Sparkles,
    title: "Smart Department Routing",
    description: "AI automatically routes complaints to the correct department.",
  },
  {
    icon: ShieldCheck,
    title: "Priority-Based Resolution",
    description: "Critical issues are resolved faster with smart prioritization.",
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    description: "Track complaints live from submission to closure.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      /* 🔥 GET CURRENT USER */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id;

      /* 🔥 FETCH USER COMPLAINTS */
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id,
          public_complaint_id,
          status,
          created_at,
          departments:actual_department(name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Dashboard error:", error);
        return;
      }

      /* 🔥 STATS CALCULATION */
      const total = data.length;
      const pending = data.filter(c => c.status === "pending").length;
      const progress = data.filter(c => c.status === "progress").length;
      const resolved = data.filter(c => c.status === "resolved").length;

      setStats([
        { title: "Total Complaints", value: total, icon: FileText, iconBg: "bg-[#5B5FEF]/10", iconColor: "text-[#5B5FEF]" },
        { title: "Pending", value: pending, icon: Clock, iconBg: "bg-[#FFB020]/10", iconColor: "text-[#FFB020]" },
        { title: "In Progress", value: progress, icon: Loader2, iconBg: "bg-[#4F46E5]/10", iconColor: "text-[#4F46E5]" },
        { title: "Resolved", value: resolved, icon: CheckCircle2, iconBg: "bg-[#22C55E]/10", iconColor: "text-[#22C55E]" },
      ]);

      /* 🔥 LAST 7 DAYS FILTER */
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const filtered = data
        .filter(c => new Date(c.created_at) >= sevenDaysAgo)
        .slice(0, 5);

      /* 🔥 FORMAT RECENT */
      const formatted = filtered.map(c => ({
        id: c.id,
        publicId: c.public_complaint_id,
        department: c.departments?.name || "Other",
        date: new Date(c.created_at).toLocaleDateString(),
        status: c.status,
      }));

      setRecentComplaints(formatted);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HERO */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1F2937] leading-tight">
            AI-Powered Grievance<br />Management System
          </h1>
          <p className="text-[#6B7280] mt-3 max-w-xl">
            Submit complaints and let AI classify & route them automatically.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate("/submit")}
              className="px-6 py-2.5 rounded-[10px] bg-[#5B5FEF] text-white font-medium"
            >
              <Send className="inline w-4 h-4 mr-2" />
              Submit Complaint
            </button>

            <button
              onClick={() => navigate("/departments")}
              className="px-6 py-2.5 rounded-[10px] bg-white shadow font-medium"
            >
              <Building2 className="inline w-4 h-4 mr-2" />
              View Departments
            </button>
          </div>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-5">
              <div className="w-10 h-10 rounded-xl bg-[#5B5FEF]/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-[#5B5FEF]" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-[#6B7280]">{f.description}</p>
            </div>
          ))}
        </div>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* 🔥 RECENT COMPLAINTS */}
        <div className="bg-white rounded-2xl shadow">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold">Recent Complaints (Last 7 Days)</h2>
          </div>

          <table className="w-full">
            <tbody>
              {recentComplaints.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-5 py-4 font-medium">{c.publicId}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{c.department}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{c.date}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.status} label={statusLabel[c.status]} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate(`/complaint/${c.id}`)}
                      className="text-[#5B5FEF] font-medium"
                    >
                      <Eye className="inline w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>
    </DashboardLayout>
  );
}
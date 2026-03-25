import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { supabase } from "../lib/supabase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const [deptStats, setDeptStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const COLORS = [
    "#6367FF",
    "#9B8EC7",
    "#BDA6CE",
    "#B4D3D9",
    "#FFDBFD",
    "#F3E3D0",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("complaints")
      .select(`
        status,
        created_at,
        actual_department:departments!complaints_actual_department_fkey(name)
      `)
      .eq("user_id", user?.id);

    /* SUMMARY */
    const total = data.length;
    const pending = data.filter((c) => c.status === "pending").length;
    const progress = data.filter((c) => c.status === "progress").length;
    const resolved = data.filter((c) => c.status === "resolved").length;

    setSummary({ total, pending, progress, resolved });

    /* DEPT */
    const deptMap = {};
    data.forEach((c) => {
      const d = c.actual_department?.name || "Other";
      deptMap[d] = (deptMap[d] || 0) + 1;
    });

    setDeptStats(
      Object.entries(deptMap).map(([k, v]) => ({
        name: k,
        count: v,
      }))
    );

    /* STATUS */
    const statusMap = {};
    data.forEach((c) => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });

    setStatusStats(
      Object.entries(statusMap).map(([k, v]) => ({
        name: k,
        value: v,
      }))
    );

    /* TREND */
    const trendMap = {};
    data.forEach((c) => {
      const key = new Date(c.created_at).toISOString().split("T")[0];
      trendMap[key] = (trendMap[key] || 0) + 1;
    });

    setTrendData(
      Object.entries(trendMap)
        .map(([k, v]) => ({ date: k, count: v }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    );

    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-[#1F2937]">
          Measurements
        </h1>

        {/* 🔥 TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <Card title="Total Complaints" value={summary.total} color="#6367FF" />
          <Card title="Pending" value={summary.pending} color="#FFB020" />
          <Card title="In Progress" value={summary.progress} color="#9B8EC7" />
          <Card title="Resolved" value={summary.resolved} color="#22C55E" />

        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            {/* PIE */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-semibold mb-4">Status</h3>

              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusStats} dataKey="value" outerRadius={80}>
                    {statusStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* BAR */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-semibold mb-4">Departments</h3>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptStats}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />

                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {deptStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* RIGHT BIG GRAPH */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow">

            <h3 className="font-semibold mb-4">
              Complaints Trend
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6367FF"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

/* 🔥 CARD COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow flex flex-col gap-2">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
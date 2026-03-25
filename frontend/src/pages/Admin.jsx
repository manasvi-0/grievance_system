import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { supabase } from "../lib/supabase";

const STATUS_OPTIONS = ["pending", "progress", "resolved", "closed"];

export default function Admin() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    resolved: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      /* 🔥 STEP 1: GET USER */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      /* 🔥 STEP 2: FIXED QUERY (IMPORTANT 🔥) */
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id,
          public_complaint_id,
          complaint_text,
          status,
          created_at,
          confidence_score,
          actual_department:departments!complaints_actual_department_fkey(name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("FETCH ERROR:", error);
        setLoading(false);
        return;
      }

      console.log("DATA:", data);

      setComplaints(data || []);

      /* 🔥 STATS */
      const total = data.length;
      const pending = data.filter((c) => c.status === "pending").length;
      const progress = data.filter((c) => c.status === "progress").length;
      const resolved = data.filter((c) => c.status === "resolved").length;

      setStats({ total, pending, progress, resolved });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 UPDATE STATUS */
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    /* instant UI update */
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold text-[#6367FF]">
          My Complaints Dashboard
        </h1>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card title="Total" value={stats.total} color="#6367FF" />
          <Card title="Pending" value={stats.pending} color="#FFB020" />
          <Card title="In Progress" value={stats.progress} color="#9B8EC7" />
          <Card title="Resolved" value={stats.resolved} color="#22C55E" />
        </div>

        {/* 🔥 TABLE */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Complaint ID</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && complaints.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">
                    No complaints found
                  </td>
                </tr>
              )}

              {complaints.map((c) => (
                <tr key={c.id} className="border-t">

                  <td className="p-4">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-[#6367FF] font-medium">
                    #{c.public_complaint_id}
                  </td>

                  <td className="p-4 max-w-xs truncate">
                    {c.complaint_text}
                  </td>

                  <td className="p-4">
                    {c.actual_department?.name || "—"}
                  </td>

                  <td className="p-4">
                    <select
                      value={c.status}
                      onChange={(e) =>
                        updateStatus(c.id, e.target.value)
                      }
                      className="px-3 py-1 border rounded-lg"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        navigate(`/complaint/${c.public_complaint_id}`)
                      }
                      className="text-[#6367FF] font-medium"
                    >
                      View →
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

/* 🔹 CARD */
function Card({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
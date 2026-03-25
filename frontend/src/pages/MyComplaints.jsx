import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { Eye } from "lucide-react";
import { supabase } from "../lib/supabase";

const statusLabel = {
  pending: "Pending",
  progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);

    /* 🔥 1. GET CURRENT USER (OPTIONAL) */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    /* 🔥 2. BASE QUERY */
    let query = supabase
      .from("complaints")
      .select(`
        id,
        public_complaint_id,
        complaint_text,
        status,
        created_at,
        departments:actual_department(name)
      `)
      .order("created_at", { ascending: false });

    /* 🔥 3. CONDITIONAL FILTER */
    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.is("user_id", null);
    }

    /* 🔥 4. EXECUTE QUERY */
    const { data, error } = await query;

    if (error) {
      console.error("Fetch error:", error);
      setComplaints([]);
    } else {
      setComplaints(data || []);
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">
            My Complaints
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Track complaints you've submitted
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-[#6B7280]">
            Loading complaints...
          </p>
        )}

        {/* Empty State */}
        {!loading && complaints.length === 0 && (
          <p className="text-sm text-[#6B7280]">
            No complaints submitted yet.
          </p>
        )}

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="
                bg-white rounded-2xl p-5
                shadow-[0_8px_24px_rgba(0,0,0,0.06)]
                hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
                transition-shadow
                flex items-center justify-between
              "
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-[#1F2937]">
                    #{c.public_complaint_id || c.id.slice(0, 8)}
                  </span>

                  <StatusBadge
                    status={c.status}
                    label={statusLabel[c.status]}
                  />
                </div>

                <p className="text-sm text-[#1F2937] truncate">
                  {c.complaint_text}
                </p>

                <p className="text-xs text-[#6B7280] mt-1">
                  {c.departments?.name || "Unassigned"} ·{" "}
                  {new Date(c.created_at).toDateString()}
                </p>
              </div>

              <button
                onClick={() => navigate(`/complaint/${c.id}`)}
                className="
                  ml-4 flex items-center gap-1.5
                  text-sm font-medium
                  text-[#5B5FEF]
                  hover:text-[#4F46E5]
                  transition-colors
                "
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

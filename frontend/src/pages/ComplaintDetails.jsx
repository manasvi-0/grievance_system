import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { supabase } from "../lib/supabase";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          actual_department:departments!complaints_actual_department_fkey(name)
        `);

      const isUUID = id.includes("-") && id.length > 20;

      if (isUUID) {
        query = query.eq("id", id);
      } else {
        query = query.eq("public_complaint_id", id);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error("Fetch error:", error);
        setComplaint(null);
      } else if (data && data.length > 0) {
        setComplaint(data[0]); // ✅ SAFE
      } else {
        setComplaint(null);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  if (!complaint)
    return (
      <DashboardLayout>
        <p className="p-6 text-red-500">Complaint not found</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        <button onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="bg-white p-6 rounded-2xl shadow space-y-4">

          <h1 className="text-xl font-bold">
            {complaint.complaint_text}
          </h1>

          <p><b>ID:</b> {complaint.public_complaint_id}</p>
          <p><b>Department:</b> {complaint.actual_department?.name}</p>
          <p>
            <b>Date:</b>{" "}
            {new Date(complaint.created_at).toLocaleString()}
          </p>
          <p><b>Location:</b> {complaint.location || "—"}</p>

          <p>
            <b>Confidence:</b>{" "}
            {(complaint.confidence_score * 100).toFixed(0)}%
          </p>

          <StatusBadge status={complaint.status} />

        </div>
      </div>
    </DashboardLayout>
  );
}
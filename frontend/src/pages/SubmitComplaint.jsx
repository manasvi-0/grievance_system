import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SubmitComplaint() {
  const navigate = useNavigate();

  const [complaintText, setComplaintText] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const [departmentsMap, setDepartmentsMap] = useState({});
  const [deptLoading, setDeptLoading] = useState(true);

  /* 🔥 LOAD DEPARTMENTS */
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name");

      if (error) {
        console.error(error);
        return;
      }

      const map = {};
      data.forEach((d) => {
        map[d.name.toLowerCase().trim()] = d.id;
      });

      console.log("Departments Loaded:", map);

      setDepartmentsMap(map);
      setDeptLoading(false);
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!complaintText.trim()) return;

    if (deptLoading) {
      alert("System loading, try again...");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /* 🔥 1. ML CALL */
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: complaintText }),
      });

      if (!res.ok) throw new Error("ML server error");

      const result = await res.json();

      console.log("ML RESULT:", result);

      const deptKey = result.department.toLowerCase().trim();
      const deptId = departmentsMap[deptKey];

      console.log("Dept Key:", deptKey);
      console.log("Dept ID:", deptId);

      if (!deptId) {
        throw new Error("Department mapping failed");
      }

      setPrediction({
        department: result.department,
        confidence: result.confidence,
      });

      /* 🔥 2. USER */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user ? user.id : null;

      /* 🔥 3. COUNT */
      const { count } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      /* 🔥 4. PUBLIC ID */
      const username = user?.user_metadata?.username || "USR";
      const prefix = username.slice(0, 3).toUpperCase();

      const publicComplaintId = `${prefix}-${String(
        (count || 0) + 1
      ).padStart(3, "0")}`;

      /* 🔥 5. INSERT (FINAL FIX) */
      const { error: insertError } = await supabase
        .from("complaints")
        .insert({
          user_id: userId,
          public_complaint_id: publicComplaintId,
          complaint_text: complaintText,
          location: location || null,
          predicted_department: deptId,
          actual_department: deptId, // 🔥 CRITICAL
          confidence_score: result.confidence,
          status: "pending",
          priority: "medium",
        });

      if (insertError) throw insertError;

      setTimeout(() => navigate("/complaints"), 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-8 bg-[#F7F8FC]">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-4">Submit Complaint</h1>

        {!prediction ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl">

            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="w-full h-40 p-4 border rounded-xl"
              placeholder="Describe your issue..."
              required
            />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 border rounded-xl"
              placeholder="Location"
            />

            {error && <p className="text-red-500">{error}</p>}

            <button
              disabled={loading || deptLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl"
            >
              {loading ? "Analyzing..." : "Submit"}
            </button>

          </form>
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center">
            <Sparkles className="mx-auto text-green-500 mb-3" size={40} />
            <h2 className="font-bold text-xl">Complaint Submitted</h2>
            <p>Department: {prediction.department}</p>
            <p>Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
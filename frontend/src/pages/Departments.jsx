import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { supabase } from "../lib/supabase";

/* ✅ MASTER UI DEPARTMENTS */
const DEPARTMENTS = [
  "Animal Control",
  "Bank",
  "Electricity",
  "Environment",
  "Food",
  "Garbage",
  "Health",
  "Housing",
  "Other",
  "Police",
  "Public Transport",
  "Roads",
  "Sanitation",
  "Water",
];

export default function Departments() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    init();
  }, []);

  /* 🔥 INIT USER + FETCH DATA */
  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);

    fetchDepartmentStats(user.id);

    /* 🔥 REAL-TIME SUBSCRIPTION */
    const channel = supabase
      .channel("complaints-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchDepartmentStats(user.id); // 🔥 refresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  /* 🔥 FETCH USER-SPECIFIC STATS */
  const fetchDepartmentStats = async (userId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("complaints")
      .select(`
        status,
        created_at,
        actual_department:departments!complaints_actual_department_fkey(name)
      `)
      .eq("user_id", userId); // 🔥 KEY FIX

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const map = {};

    data.forEach((c) => {
      const dept = (c.actual_department?.name || "Other")
        .toLowerCase()
        .trim();

      if (!map[dept]) {
        map[dept] = {
          total: 0,
          pending: 0,
          resolved: 0,
          days: [],
        };
      }

      map[dept].total += 1;

      if (c.status === "pending") map[dept].pending += 1;

      if (c.status === "resolved") {
        map[dept].resolved += 1;

        if (c.resolved_at) {
          const diff =
            (new Date(c.resolved_at) - new Date(c.created_at)) /
            (1000 * 60 * 60 * 24);

          map[dept].days.push(diff);
        }
      }
    });

    Object.keys(map).forEach((k) => {
      const arr = map[k].days;
      map[k].avgDays =
        arr.length > 0
          ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
          : "—";
    });

    console.log("FINAL STATS:", map);

    setStats(map);
    setLoading(false);
  };

  /* 🚨 IF NOT LOGGED IN */
  if (!loading && !user) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="text-lg">Please login to view your departments</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">
          Your Complaint Departments
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Based on your submitted complaints
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept) => {
              const key = dept.toLowerCase().trim();

              const s = stats[key] || {
                total: 0,
                pending: 0,
                resolved: 0,
                avgDays: "—",
              };

              return (
                <div
                  key={dept}
                  onClick={() =>
                    navigate(`/admin/${dept.toLowerCase()}`)
                  }
                  className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer transition"
                >
                  <h2 className="text-lg font-semibold mb-4">
                    {dept}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="text-xl font-bold">{s.total}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Pending</p>
                      <p className="text-xl font-bold text-yellow-500">
                        {s.pending}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Resolved</p>
                      <p className="text-xl font-bold text-green-500">
                        {s.resolved}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Avg Days</p>
                      <p className="text-xl font-bold">
                        {s.avgDays}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
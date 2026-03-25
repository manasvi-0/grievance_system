import complaints from "../data/complaints";

export default function Dashboard() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-zinc-900">
        Welcome to GBL
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Total Complaints", value: complaints.length },
          { label: "Active", value: complaints.filter(c => c.status === "active").length },
          { label: "Pending", value: complaints.filter(c => c.status === "pending").length }
        ].map(card => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

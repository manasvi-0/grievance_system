export default function StatusBadge({ status, label }) {
  const getStatusStyle = () => {
    switch (status) {
      case "pending":
        return "bg-[#FFB020] text-white";
      case "progress":
        return "bg-[#4F46E5] text-white";
      case "resolved":
        return "bg-[#22C55E] text-white";
      case "closed":
        return "bg-[#64748B] text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle()}`}
    >
      {label}
    </span>
  );
}

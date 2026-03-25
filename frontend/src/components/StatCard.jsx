export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.06)]
        p-5
        transition-all
        hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
        hover:-translate-y-0.5
      "
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-[#1F2937] mb-1">
        {value}
      </div>

      {/* Title */}
      <div className="text-sm text-[#6B7280]">
        {title}
      </div>
    </div>
  );
}

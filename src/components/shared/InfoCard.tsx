export default function InfoCard({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`hover:border-brand-500 hover:bg-brand-500/5 hover:dark:border-brand-400 rounded-md border px-3 py-2 text-sm transition-all dark:border-white/10 ${highlight ? "border-brand-500 bg-brand-500/5 dark:border-brand-400" : "border-gray-200"}`}
    >
      <span className="block text-[11px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={`mt-0.5 block break-words font-medium text-gray-800 dark:text-white/90 ${mono ? "font-mono text-[12px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

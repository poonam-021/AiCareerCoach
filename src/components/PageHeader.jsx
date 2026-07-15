export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <div className="text-[22px] font-bold tracking-tight">{title}</div>
        {subtitle && <div className="mt-0.5 text-[13px] text-ink-500">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

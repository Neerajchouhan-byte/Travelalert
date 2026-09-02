export function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem] ${className}`}>
      <div className="h-full rounded-[0.8rem] bg-[#141418] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        {children}
      </div>
    </div>
  );
}
export function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] animate-glow-drift" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] animate-glow-drift-slow" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] animate-glow-drift-fast" />
    </div>
  );
}

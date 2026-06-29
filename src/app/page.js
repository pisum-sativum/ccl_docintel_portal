export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-24 bg-bg-base overflow-hidden relative">
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-bg-surface border border-border-strong text-text-main text-xs font-black tracking-widest uppercase shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          CCL Document Intelligence Portal
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-text-main leading-tight tracking-tight">
            Manage documents with clearer oversight
          </h1>
          <p className="text-base md:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto font-semibold">
            Search uploaded records, review compliance flags, and keep important
            CCL documents easier to find and monitor in one secure workspace.
          </p>
        </div>

        <div className="pt-4 text-sm text-text-muted font-bold">
          Sign in from the top right to continue.
        </div>
      </div>
    </div>
  );
}

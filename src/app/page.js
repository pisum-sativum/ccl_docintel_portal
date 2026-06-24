import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-6 py-24 bg-bg-base overflow-hidden relative">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-bg-surface border border-border-strong text-text-main text-xs font-black tracking-widest uppercase shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
          Enterprise Document Governance Portal
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-text-main leading-tight tracking-tight">
          Intelligent Document <br className="hidden md:block" />
          <span className="text-primary underline decoration-accent decoration-8 underline-offset-8">Management System</span>
        </h1>

        <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto font-semibold">
          Instantly search regulatory frameworks, flag compliance gaps, and query secure corporate datasets across thousands of internal guidelines, tender documents, and audit logs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
          <Link href="/login" className="btn-accent text-base px-10 py-4 shadow-xl">
            Get Started →
          </Link>
          <Link href="/dashboard" className="px-10 py-4 rounded-xl text-base font-black text-text-main border-2 border-border-strong hover:bg-bg-surface transition-colors shadow-sm">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
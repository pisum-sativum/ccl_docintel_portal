"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = saved === 'dark' || (!saved && prefersDark);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="w-10 h-10 rounded-md flex items-center justify-center transition-all bg-white/10 hover:bg-white/20 text-text-inverse border border-white/10"
    >
      {isDark ? (
        <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.636 15.636a1 1 0 010 1.414l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm3.636-3.636a1 1 0 010-1.414l.708-.708a1 1 0 011.414 1.414l-.708.708a1 1 0 01-1.414 0zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-bg-navbar border-b border-border-subtle shadow-sm">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 bg-white rounded-md flex items-center justify-center p-1 shadow-sm">
            <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
              <circle cx="50" cy="60" r="55" fill="none" stroke="#000" strokeWidth="3" />
              <path d="M50 20 L80 60 L50 100 L20 60 Z" fill="#000" />
              <path d="M50 20 L50 100" stroke="#fff" strokeWidth="2" />
              <path d="M20 60 L80 60" stroke="#fff" strokeWidth="2" />
              <path d="M50 20 L20 60 L50 100 L80 60 Z" fill="none" stroke="#000" strokeWidth="4" />
              <text x="50" y="12" textAnchor="middle" fontSize="14" fill="#000" fontWeight="bold" fontFamily="sans-serif">कोल इण्डिया</text>
              <text x="50" y="118" textAnchor="middle" fontSize="14" fill="#000" fontWeight="bold" fontFamily="sans-serif">Coal India</text>
            </svg>
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="font-black text-base text-text-inverse tracking-tight leading-none">Central Coalfields Limited</span>
            <span className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">CCL DocIntel Portal</span>
          </div>
        </Link>

        {/* Right nav */}
        <nav className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-text-inverse text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>{user.username}</span>
                <span className="opacity-50 mx-1">|</span>
                <span className="opacity-80 font-normal">{user.role === 'admin' ? 'Administrator' : 'Viewer'}</span>
              </div>
              <Link
                href="/dashboard"
                className="hidden sm:block px-3 py-1.5 rounded-md text-text-inverse text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); router.push('/login'); }}
                className="px-4 py-1.5 rounded-md text-sm font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            pathname !== '/login' && (
              <Link href="/login" className="btn-accent text-sm px-5 py-2">
                Sign In
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export default function ClientShell({ children }) {
  return (
    <AuthProvider>
      <NavBar />
      <main className="bg-bg-base min-h-[calc(100vh-64px)] transition-colors duration-300">
        {children}
      </main>
    </AuthProvider>
  );
}

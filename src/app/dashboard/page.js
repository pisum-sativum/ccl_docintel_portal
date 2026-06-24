"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '../../components/ChatInterface';
import RiskWidget from '../../components/RiskWidget';
import UploadWidget from '../../components/UploadWidget';
import DocumentLibrary from '../../components/DocumentLibrary';
import { useAuth } from '../../context/AuthContext';

function MetricCard({ label, value, icon }) {
  return (
    <div className="surface-card p-5 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-primary text-primary-text flex items-center justify-center shrink-0 shadow-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-muted font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-text-main tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    vectorizedNodes: '—', activeFlags: '—', complianceIntegrity: '—'
  });

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/analytics/summary');
      if (res.ok) setMetrics(await res.json());
    } catch { /* fail silently */ }
  };

  useEffect(() => {
    if (!user) return;
    fetchMetrics();
    const id = setInterval(fetchMetrics, 5000);
    return () => clearInterval(id);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border-strong border-t-accent rounded-full animate-spin" />
          <p className="text-text-main text-base font-black">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg-base">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">Dashboard</h1>
            <p className="text-text-muted text-base font-bold mt-2">
              Welcome back, <span className="text-text-main">{user.username}</span>
              <span className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-text text-xs font-black shadow-sm">
                {user.role === 'admin' ? '⚡ Admin' : '👁 Viewer'}
              </span>
            </p>
          </div>
          {user.role !== 'admin' && (
            <div className="flex items-center gap-3 bg-bg-surface border-2 border-border-strong rounded-xl px-5 py-3 text-sm text-text-main font-bold shadow-sm">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Read-only mode · Upload restricted
            </div>
          )}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            label="Vectorized Nodes"
            value={metrics.vectorizedNodes}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 11h6M9 15h4" /></svg>}
          />
          <MetricCard
            label="Active Flags"
            value={metrics.activeFlags}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H11.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
          />
          <MetricCard
            label="Compliance Integrity"
            value={metrics.complianceIntegrity}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col h-[calc(100vh-200px)] min-h-[500px] max-h-[900px] xl:h-auto xl:min-h-full">
            <div className="surface-card flex flex-col flex-1 overflow-hidden h-full">
              <ChatInterface />
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
            {user.role === 'admin' && (
              <div className="surface-card overflow-hidden">
                <UploadWidget />
              </div>
            )}
            <div className="surface-card overflow-hidden">
              <RiskWidget />
            </div>
          </div>
        </div>

        {/* Full width library */}
        <div className="surface-card overflow-hidden">
          <DocumentLibrary />
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RISK_CONFIG = {
  High:   { icon: 'bg-red-500 text-white', badge: 'bg-red-100 text-red-700 border-red-300', box: 'border-l-4 border-l-red-500' },
  Medium: { icon: 'bg-orange-400 text-white', badge: 'bg-orange-100 text-orange-800 border-orange-300', box: 'border-l-4 border-l-orange-400' },
  Low:    { icon: 'bg-green-500 text-white', badge: 'bg-green-100 text-green-800 border-green-300', box: 'border-l-4 border-l-green-500' },
};

export default function RiskWidget() {
  const [alerts, setAlerts] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/compliance/alerts", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setAlerts(await res.json());
      } catch { /* fail silently */ }
    };
    fetch_();
    const id = setInterval(fetch_, 1000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-strong pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-error text-white flex items-center justify-center shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-text-main text-lg">Risk Monitor</h3>
            <p className="text-sm font-bold text-text-muted">{alerts.length} active flag{alerts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-error text-white shadow-sm border border-red-700">
            {alerts.filter(a => a.risk === 'High').length} HIGH RISK
          </span>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {alerts.length === 0 ? (
          <div className="text-center py-10 bg-bg-base border-4 border-dashed border-border-strong rounded-3xl">
            <div className="w-14 h-14 bg-bg-surface border-2 border-border-strong rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-black text-text-main">All Clear</p>
            <p className="text-sm font-bold text-text-muted mt-1">No compliance risks detected.</p>
          </div>
        ) : alerts.map((alert) => {
          const cfg = RISK_CONFIG[alert.risk] || RISK_CONFIG.Low;
          return (
            <div key={alert.id} className={`bg-bg-base border-2 border-border-strong rounded-2xl p-5 ${cfg.box} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-sm font-black text-text-main">{alert.doc}</span>
                <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${cfg.badge} shadow-sm`}>
                  {alert.risk}
                </span>
              </div>
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">{alert.type}</p>
              <p className="text-sm text-text-main mt-2 font-semibold leading-relaxed border-l-2 border-border-subtle pl-3 italic">&quot;{alert.desc}&quot;</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
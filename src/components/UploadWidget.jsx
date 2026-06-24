"use client";
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UploadWidget() {
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [similarAlert, setSimilarAlert] = useState(null);
  const [accessLevel, setAccessLevel] = useState('Internal');

  const reset = () => { setFile(null); setStatus(''); setStatusType(''); setAccessLevel('Internal'); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleUpload = async (e, force = false) => {
    if (e) e.preventDefault();
    if (!file) { setStatus('Select a file first.'); setStatusType('error'); return; }

    setUploading(true);
    setStatus('Uploading…');
    setStatusType('info');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("access_level", accessLevel);
    if (force) formData.append("force", "true");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(`✓ "${data.filename}" ingested successfully.`);
        setStatusType('success');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        window.dispatchEvent(new CustomEvent('ccl-document-uploaded'));
      } else if (res.status === 409) {
        if (data.detail?.type === 'similar_content') {
          setSimilarAlert(data.detail);
        } else {
          setDuplicateAlert(data.detail);
        }
        setStatus(''); setStatusType('');
      } else {
        setStatus(`Error: ${data.detail || 'Upload failed.'}`);
        setStatusType('error');
      }
    } catch {
      setStatus("Connection failed. Check backend is running.");
      setStatusType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 border-b border-border-strong pb-4">
        <div className="w-10 h-10 rounded-xl bg-accent text-accent-text flex items-center justify-center shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </div>
        <h3 className="font-black text-text-main text-lg">Data Ingestion</h3>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">
        <label
          htmlFor="file-upload-input"
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          className={`block border-4 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging || file
              ? 'border-accent bg-bg-base scale-[1.02] shadow-md'
              : 'border-border-strong bg-bg-base hover:border-primary'
          }`}
        >
          <input ref={fileInputRef} type="file" id="file-upload-input" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          <div className="space-y-3">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-black text-2xl transition-colors shadow-md ${file ? 'bg-accent text-accent-text' : 'bg-primary text-primary-text'}`}>
              ↑
            </div>
            <p className="text-base font-black text-text-main">
              {file ? file.name : 'Drop a file here, or click to browse'}
            </p>
            {!file && <p className="text-sm font-bold text-text-muted">PDF, Excel, Word, CSV, Images, Logs</p>}
          </div>
        </label>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-text-main">Access Level (RBAC)</label>
          <select 
            value={accessLevel} 
            onChange={e => setAccessLevel(e.target.value)}
            className="w-full bg-bg-base border-2 border-border-strong rounded-xl px-4 py-3 text-sm font-bold text-text-main focus:border-accent focus:outline-none transition-colors"
          >
            <option value="Public">Public (All Viewers)</option>
            <option value="Internal">Internal (Standard Viewers)</option>
            <option value="Confidential">Confidential (Admins Only)</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={uploading || !file} className="flex-1 btn-primary text-base py-3">
            {uploading ? "Uploading..." : "Process Upload"}
          </button>
          {file && (
            <button type="button" onClick={reset} className="px-5 py-3 rounded-xl border-2 border-border-strong text-text-main font-bold hover:bg-bg-base transition-colors shadow-sm">
              Clear
            </button>
          )}
        </div>

        {status && (
          <div className={`flex items-center gap-3 text-sm font-bold px-5 py-4 rounded-xl border-2 shadow-sm ${
            statusType === 'success' ? 'bg-green-100 border-green-500 text-green-800' :
            statusType === 'error'   ? 'bg-red-100 border-red-500 text-red-800' :
                                      'bg-bg-base border-border-strong text-text-main'
          }`}>
            <span className="flex-1">{status}</span>
            <button onClick={reset} className="shrink-0 text-current hover:opacity-70">✕</button>
          </div>
        )}
      </form>

      {/* Modals */}
      {(duplicateAlert || similarAlert) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-bg-base border-2 border-border-strong rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center mx-auto border-2 border-border-strong shadow-md">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-text-main">{duplicateAlert ? "Duplicate File" : "Similar Content"}</h3>
              <p className="text-sm font-semibold text-text-muted">
                {duplicateAlert || `Similar to "${similarAlert.existing_filename}". Keep anyway?`}
              </p>
            </div>
            <div className="flex gap-3">
              {similarAlert ? (
                <>
                  <button onClick={() => setSimilarAlert(null)} className="flex-1 py-3 rounded-xl border-2 border-border-strong text-text-main font-bold hover:bg-bg-surface">Cancel</button>
                  <button onClick={() => { setSimilarAlert(null); handleUpload(null, true); }} className="flex-1 btn-accent py-3">Keep</button>
                </>
              ) : (
                <button onClick={() => setDuplicateAlert(null)} className="w-full btn-primary py-3">Dismiss</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
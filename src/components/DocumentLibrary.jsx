"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DocumentLibrary() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [docText, setDocText] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [modalAlert, setModalAlert] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const limit = 6;
  const isAdmin = user?.role === 'admin';

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/documents?skip=${page * limit}&limit=${limit}&t=${Date.now()}`, {
        method: 'GET',
        headers: { "Authorization": `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.data || []);
        setTotal(data.total || 0);
        setErrorState(null);
      } else {
        const txt = await res.text();
        setErrorState(`API Error: ${res.status} | Token length: ${token ? token.length : 'null'} | ${txt}`);
        setDocuments([]);
        setTotal(0);
      }
    } catch (e) { 
        setErrorState(`Network Error: ${e.message}`);
    }
    finally { setLoading(false); }
  }, [page, token]);

  useEffect(() => {
    fetchDocuments();
    const up = () => fetchDocuments();
    window.addEventListener('ccl-document-uploaded', up);
    return () => window.removeEventListener('ccl-document-uploaded', up);
  }, [fetchDocuments]);

  const handleDelete = async (doc) => {
    setModalAlert({
      title: "Delete Document",
      message: `Delete "${doc.filename}" permanently?`,
      type: "confirm",
      onConfirm: async () => {
        setModalAlert(null);
        setDeleting(doc.id);
        try {
          const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
          if (res.ok) await fetchDocuments();
          else { const e = await res.json(); setModalAlert({ title: "Delete Failed", message: e.detail, type: "error" }); }
        } catch { setModalAlert({ title: "Error", message: "Network error.", type: "error" }); }
        finally { setDeleting(null); }
      }
    });
  };

  const handleView = async (doc, edit = false) => {
    setViewingDoc(doc); setIsEditing(edit); setDocText("Loading…");
    try {
      const res = await fetch(`/api/documents/${doc.id}/text`, { 
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` } 
      });
      if (res.ok) { const d = await res.json(); setDocText(d.extracted_text || ""); }
      else setDocText("Could not load text.");
    } catch { setDocText("Network error."); }
  };

  const handleSave = async () => {
    if (!viewingDoc) return;
    setSaving(true);
    try {
      const fileUrl = viewingDoc ? `/api/documents/${viewingDoc.id}/file?token=${token}` : "";
      const res = await fetch(`/api/documents/${viewingDoc.id}/text`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ text: docText })
      });
      if (res.ok) { setModalAlert({ title: "Success", message: "Saved!", type: "info" }); setViewingDoc(null); fetchDocuments(); }
      else { const e = await res.json(); setModalAlert({ title: "Save Failed", message: e.detail, type: "error" }); }
    } catch { setModalAlert({ title: "Error", message: "Network error.", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/import", { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) { 
        const d = await res.json(); 
        if (d.imported === 0) {
          setModalAlert({ title: "System Synchronized", message: "All documents in your local folder are already securely indexed in the Knowledge Base and actively monitored.", type: "info" });
        } else {
          setModalAlert({ title: "Sync Complete", message: `Successfully synced ${d.imported} new files into the database.`, type: "info" }); 
        }
        fetchDocuments(); 
      }
      else setModalAlert({ title: "Sync Failed", message: "Failed to sync files from backend.", type: "error" });
    } catch { setModalAlert({ title: "Error", message: "Network error.", type: "error" }); }
    finally { setSyncing(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border-strong pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-text flex items-center justify-center shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </div>
          <div>
            <h3 className="font-black text-text-main text-lg">Knowledge Base</h3>
            <p className="text-sm font-bold text-text-muted">{total} document{total !== 1 ? 's' : ''} indexed</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={handleSync} disabled={syncing} className="btn-primary py-2 px-4 text-sm disabled:opacity-50">
            {syncing ? 'Syncing…' : 'Sync Missing Files'}
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 mx-auto border-4 border-border-strong border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-text-main font-bold">Loading documents…</p>
        </div>
      ) : errorState ? (
        <div className="text-center py-16 bg-bg-base border-4 border-dashed border-red-500 rounded-3xl">
          <p className="text-lg font-black text-red-600">Error Loading Documents</p>
          <p className="text-sm font-bold text-text-muted mt-2">{errorState}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-bg-base border-4 border-dashed border-border-strong rounded-3xl">
          <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-border-strong">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-lg font-black text-text-main">No documents found</p>
          <p className="text-sm font-bold text-text-muted mt-2">Upload files using the ingestion widget.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 bg-bg-base border-2 border-border-strong rounded-2xl p-5 hover:border-accent hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center shrink-0 border-2 border-border-subtle shadow-sm">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-text-main truncate">{doc.filename}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-bold text-text-muted">#{doc.id} · {doc.char_count?.toLocaleString()} chars</span>
                  {doc.access_level && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm ${
                      doc.access_level === 'Confidential' ? 'bg-red-100 text-red-800 border border-red-200' :
                      doc.access_level === 'Internal' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {doc.access_level}
                    </span>
                  )}
                  {doc.department && doc.department !== 'Unknown' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-bg-surface border border-border-strong text-text-main shadow-sm">
                      {doc.department}
                    </span>
                  )}
                  {doc.doc_type && doc.doc_type !== 'Unknown' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-bg-surface border border-border-strong text-text-main shadow-sm">
                      {doc.doc_type}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleView(doc, false)} className="px-4 py-2 rounded-xl border-2 border-border-strong text-text-main font-bold hover:bg-bg-surface text-xs transition-colors shadow-sm">
                  View
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => handleView(doc, true)} className="px-4 py-2 rounded-xl bg-primary text-primary-text font-bold hover:brightness-110 text-xs transition-all shadow-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deleting === doc.id}
                      className="px-4 py-2 rounded-xl bg-error/10 text-error font-bold border-2 border-error/20 hover:bg-error/20 text-xs transition-colors disabled:opacity-40 shadow-sm"
                    >
                      {deleting === doc.id ? '…' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-strong">
          <span className="text-sm text-text-main font-black">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-3">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-5 py-2.5 text-sm font-black rounded-xl border-2 border-border-strong text-text-main bg-bg-base hover:bg-bg-surface disabled:opacity-40 shadow-sm transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-5 py-2.5 text-sm font-black rounded-xl border-2 border-border-strong text-text-main bg-bg-base hover:bg-bg-surface disabled:opacity-40 shadow-sm transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`bg-bg-base rounded-3xl shadow-2xl border-2 border-border-strong w-full ${isEditing ? 'max-w-3xl' : 'max-w-6xl'} flex flex-col max-h-[90vh]`}>
            <div className="flex justify-between items-center px-8 py-6 border-b border-border-strong shrink-0 bg-bg-surface rounded-t-3xl">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-text-main text-xl">{isEditing ? 'Edit Document' : 'View Document'}</h3>
                  {!isEditing && viewingDoc.access_level && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm ${
                      viewingDoc.access_level === 'Confidential' ? 'bg-red-100 text-red-800 border border-red-200' :
                      viewingDoc.access_level === 'Internal' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {viewingDoc.access_level}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-text-muted mt-1 truncate max-w-sm">{viewingDoc.filename}</p>
                {!isEditing && viewingDoc.summary && viewingDoc.summary !== "No summary available." && (
                  <p className="text-xs font-semibold text-text-muted mt-2 max-w-xl italic border-l-2 border-border-strong pl-2">
                    {viewingDoc.summary}
                  </p>
                )}
              </div>
              <button onClick={() => setViewingDoc(null)} className="w-10 h-10 rounded-full border-2 border-border-strong flex items-center justify-center text-text-main hover:bg-bg-base transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className={`p-8 flex-1 overflow-hidden flex flex-col ${!isEditing ? 'md:flex-row gap-8' : ''}`}>
              {!isEditing && (
                <div className="w-full md:w-1/2 bg-bg-surface border-2 border-border-strong rounded-3xl overflow-hidden shadow-inner flex flex-col" style={{ minHeight: '300px' }}>
                  {viewingDoc.contentType?.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/documents/${viewingDoc.id}/file?token=${token}`} alt="preview" className="w-full h-full object-contain p-4" />
                  ) : viewingDoc.contentType === 'application/pdf' ? (
                    <iframe src={`/api/documents/${viewingDoc.id}/file?token=${token}`} className="w-full h-full border-0" />
                  ) : viewingDoc.filename?.endsWith('.docx') || viewingDoc.filename?.endsWith('.txt') ? (
                    <div className="flex-1 w-full p-8 overflow-y-auto bg-white text-black max-w-none text-sm leading-relaxed shadow-inner">
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <h1 className="text-2xl font-bold mb-1 font-sans">{viewingDoc.filename}</h1>
                          <p className="text-gray-500 text-xs font-sans uppercase tracking-wider">Text Preview Mode</p>
                        </div>
                        <div className="whitespace-pre-wrap font-serif text-gray-800">
                            {docText || "Loading text content..."}
                        </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center flex-1">
                      <div className="w-16 h-16 rounded-full bg-bg-base border-2 border-border-strong flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-base font-black text-text-main">Preview not available</p>
                    </div>
                  )}
                </div>
              )}
              <div className={`${!isEditing ? 'w-full md:w-1/2' : 'w-full'} flex flex-col`}>
                <label className="text-sm font-black text-text-main uppercase tracking-widest mb-3">Extracted Text Content</label>
                {isEditing ? (
                  <textarea
                    value={docText}
                    onChange={e => setDocText(e.target.value)}
                    className="flex-1 w-full p-6 text-base text-text-main bg-bg-base border-2 border-border-strong focus:border-accent rounded-2xl resize-none focus:outline-none font-medium min-h-[400px] shadow-sm"
                  />
                ) : (
                  <div className="flex-1 w-full p-6 text-sm text-text-main bg-bg-base border-2 border-border-strong rounded-2xl overflow-y-auto whitespace-pre-wrap font-medium leading-relaxed max-h-[500px] shadow-inner">
                    {docText}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 px-8 py-5 border-t border-border-strong shrink-0 bg-bg-surface rounded-b-3xl">
              <button onClick={() => setViewingDoc(null)} className="px-6 py-3 rounded-xl border-2 border-border-strong text-text-main font-black text-sm hover:bg-bg-base transition-colors shadow-sm">
                {isEditing ? 'Cancel' : 'Close'}
              </button>
              {isEditing && (
                <button onClick={handleSave} disabled={saving} className="btn-accent px-6 py-3 text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert/Confirm Modal */}
      {modalAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-bg-base border-2 border-border-strong rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border-2 shadow-md ${
              modalAlert.type === 'error' ? 'bg-red-100 border-red-500 text-red-600' :
              modalAlert.type === 'confirm' ? 'bg-orange-100 border-orange-500 text-orange-600' :
              'bg-green-100 border-green-500 text-green-600'
            }`}>
              {modalAlert.type === 'error' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              {modalAlert.type === 'confirm' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              {modalAlert.type === 'info' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-text-main">{modalAlert.title}</h3>
              <p className="text-sm font-semibold text-text-muted">{modalAlert.message}</p>
            </div>
            <div className="flex gap-3">
              {modalAlert.type === 'confirm' ? (
                <>
                  <button onClick={() => setModalAlert(null)} className="flex-1 py-3 rounded-xl border-2 border-border-strong text-text-main font-bold hover:bg-bg-surface transition-colors shadow-sm">Cancel</button>
                  <button onClick={modalAlert.onConfirm} className="flex-1 bg-error text-white font-bold py-3 rounded-xl border-2 border-error/50 hover:brightness-110 transition-all shadow-sm">Delete</button>
                </>
              ) : (
                <button onClick={() => setModalAlert(null)} className="w-full btn-primary py-3 transition-all shadow-sm">OK</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
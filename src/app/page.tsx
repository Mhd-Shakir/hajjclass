'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ==========================================
   Types
   ========================================== */
interface Contact {
  _id: string;
  serialNumber: number;
  fullName: string;
  phoneNumber: string;
  place?: string;
  createdAt: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
  exiting?: boolean;
}

/* ==========================================
   Utility: initials from name
   ========================================== */
function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/* ==========================================
   Toast Hook
   ========================================== */
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 3500);
  }, []);

  return { toasts, addToast };
}

/* ==========================================
   Confirm Dialog Component
   ========================================== */
function ConfirmDialog({
  onConfirm,
  onCancel,
  contactName,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  contactName: string;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">🗑️</div>
        <div className="modal-title">Delete Contact</div>
        <div className="modal-body">
          Are you sure you want to delete <strong>{contactName}</strong>? This action cannot be undone.
        </div>
        <div className="modal-actions">
          <button id="cancel-delete-btn" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button id="confirm-delete-btn" className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   Main Page Component
   ========================================== */
export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const { toasts, addToast } = useToasts();
  const nameInputRef = useRef<HTMLInputElement>(null);

  /* ---- Fetch Contacts ---- */
  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      if (data.success) setContacts(data.data);
      else addToast('error', 'Failed to load contacts');
    } catch {
      addToast('error', 'Network error while loading contacts');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  /* ---- Add Contact ---- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newName.trim(), phoneNumber: newPhone.trim(), place: newPlace.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => [...prev, data.data]);
        setNewName('');
        setNewPhone('');
        setNewPlace('');
        addToast('success', `Contact "${data.data.fullName}" added!`);
        nameInputRef.current?.focus();
      } else {
        addToast('error', data.message || 'Failed to add contact');
      }
    } catch {
      addToast('error', 'Network error while adding contact');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Start Edit ---- */
  const startEdit = (contact: Contact) => {
    setEditingId(contact._id);
    setEditName(contact.fullName);
    setEditPhone(contact.phoneNumber);
    setEditPlace(contact.place || '');
  };

  /* ---- Save Edit ---- */
  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editPhone.trim()) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: editName.trim(), phoneNumber: editPhone.trim(), place: editPlace.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? data.data : c))
        );
        setEditingId(null);
        addToast('success', 'Contact updated successfully!');
      } else {
        addToast('error', data.message || 'Failed to update');
      }
    } catch {
      addToast('error', 'Network error while updating');
    }
  };

  /* ---- Cancel Edit ---- */
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPhone('');
    setEditPlace('');
  };

  /* ---- Delete Contact ---- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/contacts/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        addToast('success', `"${deleteTarget.fullName}" deleted`);
      } else {
        addToast('error', data.message || 'Failed to delete');
      }
    } catch {
      addToast('error', 'Network error while deleting');
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ---- Print ---- */
  const handlePrint = () => window.print();

  /* ---- Filtered Contacts ---- */
  const filtered = contacts.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search) ||
      (c.place || '').toLowerCase().includes(search.toLowerCase()) ||
      String(c.serialNumber).includes(search)
  );

  /* ---- Format Date ---- */
  const printDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  /* ==========================================
     Render
     ========================================== */
  return (
    <div className="app-wrapper">
      {/* ---- Header ---- */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-brand-icon">📋</div>
            <div className="header-brand-text">
              <span className="header-brand-title">Hajj Darulaman</span>
              <span className="header-brand-subtitle">Contact Management</span>
            </div>
          </div>
          <div className="header-actions">
            <button
              id="print-contacts-btn"
              className="btn btn-print"
              onClick={handlePrint}
              title="Print contact list"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </header>

      {/* ---- Main ---- */}
      <main className="main-content">

        {/* Print-only header */}
        <div className="print-header">
          <h1>Hajj Darulaman — Contact Directory</h1>
          <p>Printed on {printDate} &nbsp;|&nbsp; Total: {contacts.length} contacts</p>
        </div>

        {/* ---- Stats ---- */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon stat-icon--blue">👥</div>
            <div className="stat-info">
              <div className="stat-value">{contacts.length}</div>
              <div className="stat-label">Total Contacts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--cyan">🔍</div>
            <div className="stat-info">
              <div className="stat-value">{filtered.length}</div>
              <div className="stat-label">Shown</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--gold">📞</div>
            <div className="stat-info">
              <div className="stat-value">
                {contacts.length > 0 ? contacts[contacts.length - 1].serialNumber : 0}
              </div>
              <div className="stat-label">Last Serial #</div>
            </div>
          </div>
        </div>

        {/* ---- Add Contact Form ---- */}
        <div className="form-panel">
          <div className="form-panel-header">
            <span className="form-panel-icon">➕</span>
            <span className="form-panel-title">Add New Contact</span>
          </div>
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="new-full-name">Full Name</label>
                <input
                  id="new-full-name"
                  ref={nameInputRef}
                  className="form-input"
                  type="text"
                  placeholder="e.g. Ahmed Al-Rashid"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="new-phone-number">Phone Number</label>
                <input
                  id="new-phone-number"
                  className="form-input"
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="new-place">Place</label>
                <input
                  id="new-place"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Makkah"
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button
                id="add-contact-btn"
                className="btn btn-primary"
                type="submit"
                disabled={submitting || !newName.trim() || !newPhone.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                {submitting ? '⏳' : '➕'} {submitting ? 'Adding…' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>

        {/* ---- Toolbar ---- */}
        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="search-contacts-input"
              className="search-input"
              type="text"
              placeholder="Search by name, phone or serial…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button
              id="clear-search-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => setSearch('')}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ---- Contacts Table ---- */}
        <div className="table-container">
          <div className="table-header-bar">
            <div className="table-title">
              Contact Directory
              <span className="table-count-badge">{filtered.length} records</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                id="refresh-contacts-btn"
                className="btn btn-outline btn-sm"
                onClick={() => { setLoading(true); fetchContacts(); }}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="state-container">
              <div className="spinner" />
              <div className="state-title">Loading contacts…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-container">
              <div className="state-icon">{search ? '🔍' : '📭'}</div>
              <div className="state-title">
                {search ? 'No results found' : 'No contacts yet'}
              </div>
              <div className="state-subtitle">
                {search
                  ? `No contacts match "${search}". Try a different search term.`
                  : 'Add your first contact using the form above.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="contacts-table" id="contacts-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Phone Number</th>
                    <th>Place</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contact) => (
                    <tr key={contact._id} id={`contact-row-${contact._id}`}>
                      {/* Serial */}
                      <td>
                        <span className="serial-badge">{contact.serialNumber}</span>
                      </td>

                      {/* Name */}
                      <td>
                        {editingId === contact._id ? (
                          <input
                            id={`edit-name-${contact._id}`}
                            className="edit-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <div className="name-cell">
                            <div className="name-avatar">{getInitials(contact.fullName)}</div>
                            <span className="name-text">{contact.fullName}</span>
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td>
                        {editingId === contact._id ? (
                          <input
                            id={`edit-phone-${contact._id}`}
                            className="edit-input"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                          />
                        ) : (
                          <a href={`tel:${contact.phoneNumber}`} className="phone-text" style={{ textDecoration: 'none' }}>
                            {contact.phoneNumber}
                          </a>
                        )}
                      </td>

                      {/* Place */}
                      <td>
                        {editingId === contact._id ? (
                          <input
                            id={`edit-place-${contact._id}`}
                            className="edit-input"
                            value={editPlace}
                            onChange={(e) => setEditPlace(e.target.value)}
                          />
                        ) : (
                          <span className="place-text">{contact.place || '-'}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="row-actions">
                          {editingId === contact._id ? (
                            <>
                              <button
                                id={`save-edit-${contact._id}`}
                                className="btn btn-success btn-sm"
                                onClick={() => saveEdit(contact._id)}
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                id={`cancel-edit-${contact._id}`}
                                className="btn btn-outline btn-sm"
                                onClick={cancelEdit}
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                id={`edit-contact-${contact._id}`}
                                className="btn btn-outline btn-sm"
                                onClick={() => startEdit(contact)}
                                title="Edit contact"
                              >
                                ✏️
                              </button>
                              <button
                                id={`delete-contact-${contact._id}`}
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteTarget(contact)}
                                title="Delete contact"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Print-only footer */}
        <div className="print-footer">
          Hajj Darulaman Contact Directory &nbsp;·&nbsp; Generated: {printDate}
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="app-footer">
        Hajj Darulaman &nbsp;·&nbsp; Contact Management System &nbsp;·&nbsp; {new Date().getFullYear()}
      </footer>

      {/* ---- Delete Confirm Modal ---- */}
      {deleteTarget && (
        <ConfirmDialog
          contactName={deleteTarget.fullName}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ---- Toast Notifications ---- */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.type} ${t.exiting ? 'toast--exiting' : ''}`}
            role="alert"
          >
            <span>{t.type === 'success' ? '✅' : '❌'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

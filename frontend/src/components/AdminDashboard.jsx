import { useState } from 'react';
import {
  updateComplaintStatus,
  assignComplaint,
  addNoteToComplaint,
  getComplaintsByStatus,
} from '../firebaseConfig.js';

function AdminDashboard({ complaints, user }) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [noteText, setNoteText] = useState({});
  const [loading, setLoading] = useState({});

  const statuses = ['Submitted', 'In Progress', 'Resolved', 'Rejected'];

  const filtered =
    filter === 'all'
      ? complaints
      : complaints.filter((c) => c.status === filter);

  async function handleStatusChange(complaintId, newStatus) {
    setLoading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      await updateComplaintStatus(complaintId, newStatus);
      alert(`Status updated to ${newStatus}`);
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
    setLoading((prev) => ({ ...prev, [complaintId]: false }));
  }

  async function handleAddNote(complaintId) {
    if (!noteText[complaintId]?.trim()) {
      alert('Please enter a note');
      return;
    }

    setLoading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      await addNoteToComplaint(
        complaintId,
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        noteText[complaintId]
      );
      setNoteText((prev) => ({ ...prev, [complaintId]: '' }));
      alert('Note added');
      window.location.reload();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
    setLoading((prev) => ({ ...prev, [complaintId]: false }));
  }

  return (
    <section className="admin-dashboard">
      <h2>Authority Dashboard</h2>

      <div className="filter-bar">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All ({complaints.length})
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={filter === status ? 'active' : ''}
          >
            {status} ({complaints.filter((c) => c.status === status).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No complaints found.</div>
      ) : (
        <div className="complaints-grid">
          {filtered.map((complaint) => (
            <article
              key={complaint.id}
              className="complaint-card admin-card"
            >
              <div className="card-header">
                <div>
                  <span className="issue-type">{complaint.issueType}</span>
                  <span className="status-tag">{complaint.status}</span>
                </div>
                <button
                  className="expand-btn"
                  onClick={() =>
                    setExpandedId(
                      expandedId === complaint.id ? null : complaint.id
                    )
                  }
                >
                  {expandedId === complaint.id ? '▼' : '▶'}
                </button>
              </div>

              <p className="description">{complaint.description}</p>
              <p className="location">
                📍 {complaint.location?.lat?.toFixed(5)},{' '}
                {complaint.location?.lng?.toFixed(5)}
              </p>

              {complaint.imageUrl && (
                <a href={complaint.imageUrl} target="_blank" rel="noreferrer">
                  📷 View image
                </a>
              )}

              {expandedId === complaint.id && (
                <div className="expanded-content">
                  <div className="section">
                    <h4>Complaint Letter</h4>
                    <p>{complaint.complaintLetter}</p>
                  </div>

                  <div className="section">
                    <label>
                      Change Status
                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          handleStatusChange(complaint.id, e.target.value)
                        }
                        disabled={loading[complaint.id]}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="section">
                    <h4>Notes ({complaint.notes?.length || 0})</h4>
                    {complaint.notes?.map((note, idx) => (
                      <div key={idx} className="note">
                        <strong>{note.authorName}</strong>
                        <time>{new Date(note.createdAt).toLocaleString()}</time>
                        <p>{note.text}</p>
                      </div>
                    ))}

                    <div className="add-note">
                      <textarea
                        placeholder="Add a note..."
                        value={noteText[complaint.id] || ''}
                        onChange={(e) =>
                          setNoteText((prev) => ({
                            ...prev,
                            [complaint.id]: e.target.value,
                          }))
                        }
                        disabled={loading[complaint.id]}
                      />
                      <button
                        onClick={() => handleAddNote(complaint.id)}
                        disabled={loading[complaint.id]}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  <div className="section">
                    <p>
                      <strong>Reporter:</strong> {complaint.userId}
                    </p>
                    <p>
                      <strong>Assigned to:</strong>{' '}
                      {complaint.assignedTo || 'Unassigned'}
                    </p>
                    <p>
                      <strong>Created:</strong>{' '}
                      {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                    {complaint.resolvedAt && (
                      <p>
                        <strong>Resolved:</strong>{' '}
                        {new Date(complaint.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;


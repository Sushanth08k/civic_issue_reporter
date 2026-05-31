import { formatLocationLabel } from '../utils/locationUtils.js';

function ComplaintList({ complaints }) {
  if (!complaints?.length) {
    return <div className="empty-state">No complaints found yet.</div>;
  }

  return (
    <section className="complaint-list">
      <h2>My Complaint History</h2>
      {complaints.map((complaint) => (
        <article key={complaint.id} className="complaint-card">
          <div className="top-row">
            <span className="issue-type">{complaint.issueType}</span>
            <span className="status-tag">{complaint.status}</span>
          </div>
          <p>{complaint.description}</p>
          <p>
            Location: {formatLocationLabel(complaint.location)}
          </p>
          <a href={complaint.imageUrl} target="_blank" rel="noreferrer">
            View image
          </a>
        </article>
      ))}
    </section>
  );
}

export default ComplaintList;

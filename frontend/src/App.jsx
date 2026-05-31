import { useEffect, useState } from 'react';
import UploadForm from './components/UploadForm.jsx';
import ComplaintList from './components/ComplaintList.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { initFirebase, auth, signInAnonymously, getComplaints, getAdminStatus } from './firebaseConfig.js';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('report');
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    initFirebase();
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await getAdminStatus(currentUser.uid);
        setIsAdmin(adminStatus);
        const complaintData = await getComplaints();
        setComplaints(complaintData);
      }
    });

    if (!auth.currentUser) {
      signInAnonymously();
    }

    return unsubscribe;
  }, []);

  return (
    <div className="app-shell enhanced">
      <header className="app-header">
        <div className="brand">
          <div className="logo">📣</div>
          <div>
            <h1>Civic Issue Reporter</h1>
            <p className="tagline">Report, track and resolve civic issues — fast and clearly.</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-info">{user ? `User: ${user.uid.slice(0,6)}...` : 'Not signed in'}</div>
          <nav className="top-nav">
            <button className={view === 'report' ? 'active' : ''} onClick={() => setView('report')}>Report</button>
            <button className={view === 'track' ? 'active' : ''} onClick={() => setView('track')}>My Complaints</button>
            {isAdmin && <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>Admin</button>}
          </nav>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="stats">
            <div className="stat">
              <div className="stat-value">{complaints.length}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat">
              <div className="stat-value">{complaints.filter(c => c.status === 'Resolved').length}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="about">
            <h4>How it works</h4>
            <ol>
              <li>Attach a photo</li>
              <li>Capture or enter location</li>
              <li>Auto-classify & generate letter</li>
            </ol>
          </div>
        </aside>

        <main className="main-content">
          <section className="hero">
            <div>
              <h2>Make your neighbourhood better</h2>
              <p>Quickly report civic issues with an image — our AI suggests the issue and drafts a formal complaint for you.</p>
              <div className="hero-ctas">
                <button onClick={() => setView('report')}>Report an Issue</button>
                <button className="ghost" onClick={() => setView('track')}>View My Reports</button>
              </div>
            </div>
            <div className="hero-graphic">🗺️</div>
          </section>

          <section className="content-area">
            {view === 'report' && <UploadForm user={user} />}
            {view === 'track' && <ComplaintList complaints={complaints} />}
            {view === 'admin' && isAdmin && <AdminDashboard complaints={complaints} user={user} />}
          </section>
        </main>
      </div>

      <footer className="app-footer">Built with care • Civic Issue Reporter</footer>
    </div>
  );
}

export default App;


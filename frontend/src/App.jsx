import { useEffect, useState } from 'react';
import UploadForm from './components/UploadForm.jsx';
import ComplaintList from './components/ComplaintList.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import FeatureHighlights from './components/FeatureHighlights.jsx';
import {
  initFirebase,
  auth,
  signInAnonymously,
  signUpUser,
  signInUser,
  signOutUser,
  getComplaints,
  getComplaintsByUser,
  getAdminStatus,
  getUserRole,
} from './firebaseConfig.js';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('report');
  const [complaints, setComplaints] = useState([]);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    initFirebase();
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.isAnonymous) {
          setIsAdmin(false);
          setComplaints([]);
          return;
        }

        const adminStatus = await getAdminStatus(currentUser.uid);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          const complaintData = await getComplaints();
          setComplaints(complaintData);
        } else {
          const myComplaints = await getComplaintsByUser(currentUser.uid);
          setComplaints(myComplaints);
        }
      }
    });

    if (!auth.currentUser) {
      signInAnonymously();
    }

    return unsubscribe;
  }, []);

  async function handleUserSignUp(email, password) {
    try {
      setAuthError('');
      await signUpUser(email, password);
      setView('track');
    } catch (error) {
      setAuthError(error.message || 'Failed to sign up');
    }
  }

  async function handleUserSignIn(email, password) {
    try {
      setAuthError('');
      const signedInUser = await signInUser(email, password);
      const role = await getUserRole(signedInUser.uid);
      if (role === 'admin') {
        await signOutUser();
        setAuthError('Admin must sign in through the admin login form.');
        return;
      }
      setView('track');
    } catch (error) {
      setAuthError(error.message || 'Failed to sign in');
    }
  }

  async function handleAdminSignIn(email, password) {
    try {
      setAuthError('');
      const signedInUser = await signInUser(email, password);
      const role = await getUserRole(signedInUser.uid);
      if (role !== 'admin') {
        await signOutUser();
        setAuthError('Only admin users can sign in here.');
        return;
      }
      setView('admin');
    } catch (error) {
      setAuthError(error.message || 'Failed to sign in');
    }
  }

  async function handleSignOut() {
    try {
      await signOutUser();
      setView('report');
      setAuthError('');
      signInAnonymously();
    } catch (error) {
      setAuthError(error.message || 'Sign out failed');
    }
  }

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
          <div className="user-info">
            {user?.email
              ? `Signed in: ${user.email}`
              : user?.uid
              ? `Guest: ${user.uid.slice(0, 6)}...`
              : 'Not signed in'}
          </div>
          <nav className="top-nav">
            <button className={view === 'report' ? 'active' : ''} onClick={() => setView('report')}>Report</button>
            <button className={view === 'track' ? 'active' : ''} onClick={() => setView('track')}>My Complaints</button>
            {isAdmin && <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>Admin</button>}
            {!user?.email && (
              <button className={view === 'auth' ? 'active' : ''} onClick={() => setView('auth')}>Login / Signup</button>
            )}
            {user?.email && (
              <button className="ghost" onClick={handleSignOut}>Logout</button>
            )}
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
              <div className="stat-value">{complaints.filter((c) => c.status === 'Resolved').length}</div>
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

          <FeatureHighlights />

          <section className="content-area">
            {view === 'report' && <UploadForm user={user} />}
            {view === 'track' && <ComplaintList complaints={complaints} />}
            {view === 'auth' && (
              <AuthPanel
                user={user}
                authError={authError}
                onUserSignUp={handleUserSignUp}
                onUserSignIn={handleUserSignIn}
                onAdminSignIn={handleAdminSignIn}
              />
            )}
            {view === 'admin' && isAdmin && <AdminDashboard complaints={complaints} user={user} />}
          </section>
        </main>
      </div>

      <footer className="app-footer">Built with care • Civic Issue Reporter</footer>
    </div>
  );
}

export default App;


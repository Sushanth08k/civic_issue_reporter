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
    <div className="app-shell">
      <header>
        <h1>Civic Issue Reporter</h1>
        <nav>
          <button onClick={() => setView('report')}>Report</button>
          <button onClick={() => setView('track')}>My Complaints</button>
          {isAdmin && <button onClick={() => setView('admin')}>Admin</button>}
        </nav>
      </header>

      <main>
        {view === 'report' && <UploadForm user={user} />}
        {view === 'track' && <ComplaintList complaints={complaints} />}
        {view === 'admin' && isAdmin && <AdminDashboard complaints={complaints} user={user} />}
      </main>
    </div>
  );
}

export default App;


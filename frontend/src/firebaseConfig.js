import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously as firebaseSignInAnonymously,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBzJOAs7pnD7pUKY0j56W2jFei70d6GFGA',
  authDomain: 'civic-issue-c4538.firebaseapp.com',
  projectId: 'civic-issue-c4538',
  storageBucket: 'civic-issue-c4538.firebasestorage.app',
  messagingSenderId: '742272167414',
  appId: '1:742272167414:web:dfc4b142687e6d41bc6bd7'
};

let app;
let db;
export let auth;

export function initFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export async function signInAnonymously() {
  try {
    await firebaseSignInAnonymously(getAuth());
  } catch (error) {
    console.error('Firebase anonymous auth failed', error);
  }
}

export async function saveComplaint(complaint) {
  const complaintsRef = collection(db, 'complaints');
  const docRef = await addDoc(complaintsRef, complaint);
  return docRef.id;
}

export async function updateComplaint(complaintId, data) {
  const complaintDoc = doc(db, 'complaints', complaintId);
  await updateDoc(complaintDoc, data);
}

export async function getComplaints() {
  const complaintsRef = collection(db, 'complaints');
  const q = query(complaintsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getComplaintsByStatus(status) {
  const complaintsRef = collection(db, 'complaints');
  const q = query(
    complaintsRef,
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getAdminStatus(userId) {
  if (!userId) return false;
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data()?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function updateComplaintStatus(complaintId, newStatus) {
  const complaintDoc = doc(db, 'complaints', complaintId);
  const updateData = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  if (newStatus === 'Resolved') {
    updateData.resolvedAt = new Date().toISOString();
  }
  await updateDoc(complaintDoc, updateData);
}

export async function assignComplaint(complaintId, adminId, adminName) {
  const complaintDoc = doc(db, 'complaints', complaintId);
  await updateDoc(complaintDoc, {
    assignedTo: adminId,
    updatedAt: new Date().toISOString(),
  });
}

export async function addNoteToComplaint(complaintId, authorId, authorName, text) {
  const complaintDoc = doc(db, 'complaints', complaintId);
  const newNote = {
    authorId,
    authorName,
    text,
    createdAt: new Date().toISOString(),
  };
  await updateDoc(complaintDoc, {
    notes: arrayUnion(newNote),
    updatedAt: new Date().toISOString(),
  });
}


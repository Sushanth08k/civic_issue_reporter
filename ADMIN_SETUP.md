# Admin Setup & User Management Guide

This guide explains how to set up admin users and manage roles in Firebase for the civic issue reporting system.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "civic-issue-reporter")
4. Enable Google Analytics (optional)
5. Click **"Create project"** and wait ~1 minute

---

## Step 2: Set Up Firebase Authentication

1. In Firebase console, go to **Authentication** → **Sign-in method**
2. Enable **Anonymous**:
   - Click "Anonymous"
   - Toggle **Enable**
   - Click **Save**

3. (Optional) Enable **Google** sign-in for easier user identification:
   - Click "Google"
   - Toggle **Enable**
   - Add a support email
   - Click **Save**

---

## Step 3: Set Up Firestore Database

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **Start in production mode**
4. Select a region (pick one closest to your users)
5. Click **"Create"**

---

## Step 4: Add Firebase Config to Frontend

1. In Firebase console, go to **Project Settings** (⚙️ icon, top-left)
2. Scroll to **"Your apps"** section
3. Click **"</>** (Web)" if not already created
4. Copy the Firebase config object
5. In `frontend/src/firebaseConfig.js`, replace:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
```

with your actual config values.

---

## Step 5: Create the `users` Collection

1. In Firestore, click **"+ Start collection"**
2. Name it `users`
3. Click **"Next"**
4. Click **"Auto ID"** to auto-generate the document ID
5. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `uid` | string | `test-admin-001` |
| `email` | string | `admin@municipality.gov` |
| `displayName` | string | `Jane Smith` |
| `role` | string | `admin` |
| `createdAt` | string | `2025-01-15T10:00:00Z` |

6. Click **"Save"**

You now have one admin user.

---

## Step 6: Enable Firebase Storage

1. Go to **Storage**
2. Click **"Get started"**
3. Accept the default security rules
4. Choose region
5. Click **"Done"**

---

## Step 7: Set Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anonymous users to read/write their own user docs
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Citizens can create complaints
    // Admins can read/update all complaints
    match /complaints/{complaintId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Allow anonymous users to upload images
    match /complaint-images/{imageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 8: Making a User an Admin

### Option A: Through Firebase Console (Quickest)

1. Go to **Firestore** → **users** collection
2. Find the user document you want to make admin
3. Edit the `role` field: change from `citizen` to `admin`
4. Click **Save**

The user will see the **Admin** tab on their next page refresh.

### Option B: Using Firebase CLI (For automation)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Set the role via Firestore
firebase firestore:query users --project YOUR_PROJECT_ID
```

---

## Step 9: Test Admin Access

1. **Create a test citizen user:**
   - Open your app in a browser
   - Report a complaint
   - Copy your Firebase UID from the browser console: `console.log(auth.currentUser.uid)`

2. **Manually create a citizen user document in Firestore:**
   - Collection: `users`
   - Document ID: `<copied-uid>`
   - Fields:
     ```
     uid: <copied-uid>
     email: citizen@example.com
     displayName: Test Citizen
     role: citizen
     createdAt: 2025-01-20T00:00:00Z
     ```

3. **Test the admin dashboard:**
   - Create another test user and set their role to `admin`
   - Sign in with the admin user
   - Verify the **Admin** tab appears
   - Try updating complaint status and adding notes

---

## Common Issues & Debugging

### Issue: Admin tab doesn't appear even after setting role to `admin`

**Solution:**
1. Force refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check Firestore console: verify `role: admin` is exactly set
3. Check browser console for errors: `F12` → **Console** tab
4. Verify the user ID in Firestore matches `auth.currentUser.uid`

### Issue: "Permission denied" when updating complaint status

**Solution:**
1. Check security rules are published correctly (Firestore → Rules tab)
2. Verify the user's `role` field is exactly `admin` (case-sensitive)
3. Check complaint `status` field exists and is a valid status

### Issue: Notes don't appear after adding them

**Solution:**
1. Check that `notes` array exists in the complaint document
2. If it doesn't exist, create it manually:
   - Edit the complaint document
   - Add field: `notes` (array type)
   - Leave empty
   - Click Save

---

## Production Considerations

### Security

- **Do NOT** expose admin role in client-side code
- Always validate roles in **Firestore security rules** (server-side)
- Use **Firebase Custom Claims** for production (sets `admin: true` on user token)

### Custom Claims Setup (Advanced)

```javascript
// Run this in Firebase Cloud Functions or Admin SDK
const admin = require('firebase-admin');

admin.auth().setCustomUserClaims(uid, { admin: true });
```

Then verify in security rules:

```javascript
allow update: if request.auth.token.admin == true;
```

### Audit Logging

Add a `auditLog` collection to track who updated what:

```javascript
{
  complaintId: "complaint-123",
  adminId: "admin-456",
  action: "status_updated",
  oldStatus: "Submitted",
  newStatus: "In Progress",
  timestamp: "2025-01-20T14:30:00Z"
}
```

---

## Interview Questions on Admin Setup

### Q: "How do you prevent unauthorized users from accessing the admin dashboard?"

**Answer:**
- Frontend: Check `role: admin` before showing the admin tab
- Backend: Firestore security rules enforce that only admins can update complaints
- Best practice: Use Firebase Custom Claims for token-level verification

### Q: "What's the difference between frontend and backend authorization?"

**Answer:**
- **Frontend:** User-experience layer. Hide admin tab from citizens. Can be bypassed by malicious users.
- **Backend:** Security layer. Firestore rules reject unauthorized writes. Cannot be bypassed.
- **Why both?** Frontend makes the app feel right; backend makes it secure.

### Q: "How would you scale this to 1000+ admins across multiple departments?"

**Answer:**
- Add an `authorities` collection: Roads Dept, Lighting Dept, etc.
- Add a `department` field to admins
- Add a `jurisdiction` field to complaints
- Filter complaints by department in Firestore rules
- Create role hierarchy: `admin.roads`, `admin.lighting`, `super_admin`

### Q: "How do you track which admin made which change?"

**Answer:**
- Add `updatedBy` field when admin updates status
- Log each action to an `auditLog` collection
- Example:
  ```javascript
  {
    complaintId: "123",
    action: "status_changed",
    oldStatus: "Submitted",
    newStatus: "In Progress",
    adminId: "admin-456",
    adminName: "Jane Smith",
    timestamp: "2025-01-20T14:30:00Z"
  }
  ```
- Query: Find all actions by an admin, changes to a specific complaint, etc.

---

## Next Steps

1. Follow steps 1-8 above to set up Firebase
2. Create 2-3 test admin users
3. Report a few test complaints
4. Test the admin dashboard: update statuses, add notes
5. Document what you learned in `/memories/session/`

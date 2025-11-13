# Firebase Integration Guide

## Overview
This document details how GETMY.MORTGAGE integrates with Firebase services including Authentication, Firestore database, and Storage. It provides patterns, best practices, and examples for all Firebase operations used in the application.

---

## Firebase Setup

### Configuration

**Location:** `src/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAzp560ybsCr0NI0ZaNGpsWwFcRvzdQ7uM",
  authDomain: "get-my-mortgage-5a5c3.firebaseapp.com",
  projectId: "get-my-mortgage-5a5c3",
  storageBucket: "get-my-mortgage-5a5c3.firebasestorage.app",
  messagingSenderId: "72109758153",
  appId: "1:72109758153:web:a4eb01dd268d483c4d5f18",
  measurementId: "G-F1M6F6K5Y2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

### Service Imports

Throughout the app, import services like this:

```javascript
import { auth, db, storage } from '../firebase';
```

---

## Firebase Authentication

### Authentication Patterns Used

The application uses Firebase Authentication with email/password sign-in method. All protected routes check authentication state before rendering.

### Auth State Listener Pattern

**Used in:** Portal.js, FactFind.js, SourcingResults.js, DocumentUpload.js

```javascript
import { auth } from '../firebase';

const Component = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // User is signed in
        setUser(currentUser);
        // Load user-specific data
      } else {
        // User is signed out - redirect to login
        navigate('/login');
      }
    });
    
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [navigate]);
  
  return (/* ... */);
};
```

### Sign Up

```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const handleSignUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    console.log('User created:', user.uid);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      createdAt: new Date(),
      quoteData: initialQuoteData // If coming from quote form
    });
    
    // Navigate to portal
    navigate('/portal');
    
  } catch (error) {
    console.error('Sign up error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/email-already-in-use') {
      alert('This email is already registered. Please log in.');
    } else if (error.code === 'auth/weak-password') {
      alert('Password should be at least 6 characters.');
    } else {
      alert('Sign up failed. Please try again.');
    }
  }
};
```

### Log In

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    const user = userCredential.user;
    console.log('User logged in:', user.uid);
    
    // Navigate to portal
    navigate('/portal');
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/user-not-found') {
      alert('No account found with this email.');
    } else if (error.code === 'auth/wrong-password') {
      alert('Incorrect password.');
    } else {
      alert('Login failed. Please try again.');
    }
  }
};
```

### Log Out

```javascript
import { signOut } from 'firebase/auth';

const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    navigate('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

### Get Current User

```javascript
// Synchronous - may be null if auth not loaded
const user = auth.currentUser;
if (user) {
  console.log('Current user:', user.uid);
  console.log('Email:', user.email);
}

// Asynchronous - wait for auth state
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

const user = await getCurrentUser();
```

---

## Firestore Database Operations

### Collections Used

1. **users** - User profiles and quote data
2. **factFinds** - Comprehensive mortgage applications
3. **lenderProducts** - Lender product information for matching
4. **propertyNews** - Market news and rate updates
5. **users/{uid}/mortgageMatches** - Subcollection for saved matches

### Import Statements

```javascript
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
```

---

## Read Operations

### Get Single Document

**Pattern:** Load user profile in Portal

```javascript
import { doc, getDoc } from 'firebase/firestore';

const loadUserData = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('User data:', data);
      return data;
    } else {
      console.log('No user document found');
      return null;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
};

// Usage in component
useEffect(() => {
  if (user) {
    loadUserData(user.uid).then(setUserData);
  }
}, [user]);
```

### Query Collection

**Pattern:** Load most recent fact-find in FactFind.js

```javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const loadExistingApplication = async (userId) => {
  try {
    const q = query(
      collection(db, 'factFinds'),
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get first (most recent) document
      const doc = querySnapshot.docs[0];
      console.log('Found existing application:', doc.id);
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      console.log('No existing application');
      return null;
    }
  } catch (error) {
    console.error('Error loading application:', error);
    throw error;
  }
};
```

### Get All Documents in Collection

**Pattern:** Load all lender products in SourcingResults.js

```javascript
import { collection, getDocs } from 'firebase/firestore';

const loadAllLenders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'lenderProducts'));
    
    const lenders = [];
    querySnapshot.forEach((doc) => {
      lenders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Loaded ${lenders.length} lender products`);
    return lenders;
    
  } catch (error) {
    console.error('Error loading lenders:', error);
    throw error;
  }
};
```

### Complex Query Example

**Pattern:** Find completed applications with CCJs

```javascript
const findApplicationsWithCCJs = async (userId) => {
  try {
    const q = query(
      collection(db, 'factFinds'),
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      where('hasCCJs', '==', 'yes'),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const applications = [];
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return applications;
    
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};
```

---

## Write Operations

### Create New Document (Auto-Generated ID)

**Pattern:** Create new fact-find in FactFind.js

```javascript
import { collection, addDoc } from 'firebase/firestore';

const createNewApplication = async (userId, formData) => {
  try {
    const docRef = await addDoc(collection(db, 'factFinds'), {
      userId: userId,
      ...formData,
      status: 'in-progress',
      createdAt: new Date(),
      lastUpdated: new Date()
    });
    
    console.log('Created application:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

// Usage
const handleFirstSave = async () => {
  const appId = await createNewApplication(user.uid, formData);
  setApplicationId(appId);
};
```

### Set Document (Create or Replace)

**Pattern:** Create user profile on sign up

```javascript
import { doc, setDoc } from 'firebase/firestore';

const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      email: userData.email,
      createdAt: new Date(),
      quoteData: userData.quoteData,
      preferences: {}
    });
    
    console.log('User profile created');
    
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};
```

### Update Existing Document

**Pattern:** Auto-save in FactFind.js

```javascript
import { doc, updateDoc } from 'firebase/firestore';

const saveFactFind = async (applicationId, formData) => {
  try {
    await updateDoc(doc(db, 'factFinds', applicationId), {
      ...formData,
      lastUpdated: new Date()
    });
    
    console.log('Application updated');
    
  } catch (error) {
    console.error('Save error:', error);
    
    if (error.code === 'not-found') {
      console.log('Document not found - creating new one');
      // Fall back to creating new document
      const newId = await createNewApplication(user.uid, formData);
      return newId;
    }
    
    throw error;
  }
};

// Usage with auto-save on step change
const nextStep = async () => {
  setSaving(true);
  try {
    await saveFactFind(applicationId, formData);
    setCurrentStep(prev => prev + 1);
  } finally {
    setSaving(false);
  }
};
```

### Update Specific Fields

```javascript
const updateApplicationStatus = async (applicationId, status) => {
  try {
    await updateDoc(doc(db, 'factFinds', applicationId), {
      status: status,
      [`${status}At`]: new Date() // e.g., completedAt, submittedAt
    });
  } catch (error) {
    console.error('Status update error:', error);
  }
};
```

### Save to Subcollection

**Pattern:** Save lender matches in SourcingResults.js

```javascript
const saveMatches = async (userId, matches, userData) => {
  try {
    await setDoc(
      doc(db, 'users', userId, 'mortgageMatches', 'latest'),
      {
        matches: matches.slice(0, 20), // Top 20
        matchedAt: new Date(),
        userData: userData
      }
    );
    
    console.log('Matches saved to subcollection');
    
  } catch (error) {
    console.error('Error saving matches:', error);
  }
};
```

---

## Delete Operations

```javascript
import { doc, deleteDoc } from 'firebase/firestore';

const deleteApplication = async (applicationId) => {
  try {
    await deleteDoc(doc(db, 'factFinds', applicationId));
    console.log('Application deleted');
  } catch (error) {
    console.error('Delete error:', error);
  }
};
```

---

## Firebase Storage (Future Use)

### Upload Document

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadDocument = async (file, userId) => {
  try {
    // Create reference
    const timestamp = new Date().getTime();
    const storageRef = ref(
      storage,
      `users/${userId}/documents/${timestamp}_${file.name}`
    );
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Usage in DocumentUpload component
const handleFileUpload = async (file) => {
  try {
    const url = await uploadDocument(file, user.uid);
    
    // Save URL to Firestore
    await updateDoc(doc(db, 'users', user.uid), {
      documents: arrayUnion({
        name: file.name,
        url: url,
        uploadedAt: new Date()
      })
    });
    
    alert('Document uploaded successfully');
  } catch (error) {
    alert('Upload failed');
  }
};
```

---

## Error Handling Patterns

### Comprehensive Error Handler

```javascript
const handleFirestoreError = (error, context) => {
  console.error(`${context} error:`, error);
  
  switch(error.code) {
    case 'permission-denied':
      return 'You don\'t have permission to access this data';
      
    case 'not-found':
      return 'Document not found';
      
    case 'unavailable':
      return 'Service temporarily unavailable. Please check your connection';
      
    case 'deadline-exceeded':
      return 'Request timed out. Please try again';
      
    case 'already-exists':
      return 'This document already exists';
      
    default:
      return 'An error occurred. Please try again';
  }
};

// Usage
try {
  await saveFactFind(appId, formData);
} catch (error) {
  const message = handleFirestoreError(error, 'Save');
  setError(message);
}
```

### Retry Logic

```javascript
const saveWithRetry = async (saveFunction, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await saveFunction();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error);
      
      // Don't retry on permission errors
      if (error.code === 'permission-denied') {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      }
    }
  }
  
  throw lastError;
};

// Usage
try {
  await saveWithRetry(() => 
    updateDoc(doc(db, 'factFinds', appId), formData)
  );
} catch (error) {
  alert('Failed to save after multiple attempts');
}
```

---

## Performance Optimization

### Batch Operations

```javascript
import { writeBatch } from 'firebase/firestore';

const batchUpdateApplications = async (updates) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(update => {
      const docRef = doc(db, 'factFinds', update.id);
      batch.update(docRef, update.data);
    });
    
    await batch.commit();
    console.log('Batch update completed');
    
  } catch (error) {
    console.error('Batch error:', error);
  }
};
```

### Query Limits

```javascript
// Always limit queries to prevent massive reads
const q = query(
  collection(db, 'factFinds'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10) // ALWAYS USE LIMIT
);
```

### Firestore Indexing

**Required Composite Indexes:**

```
// In Firebase Console → Firestore → Indexes

Collection: factFinds
Fields:
  - userId (Ascending)
  - status (Ascending)
  - lastUpdated (Descending)

Collection: factFinds
Fields:
  - userId (Ascending)
  - status (Ascending)
  - completedAt (Descending)
```

---

## Security Best Practices

### Never Expose Sensitive Data

```javascript
// ❌ BAD - Don't log sensitive data
console.log('User data:', userData);

// ✅ GOOD - Log only IDs
console.log('Loaded user:', userId);
```

### Validate Before Write

```javascript
const saveFactFind = async (data) => {
  // Validate data before sending to Firebase
  if (!data.userId) {
    throw new Error('Missing userId');
  }
  
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email');
  }
  
  // Sanitize inputs
  const sanitized = {
    ...data,
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim()
  };
  
  await updateDoc(doc(db, 'factFinds', appId), sanitized);
};
```

### Check Authentication

```javascript
const saveData = async (data) => {
  // Always check auth before operations
  if (!auth.currentUser) {
    throw new Error('Not authenticated');
  }
  
  // Verify user owns the data
  if (data.userId !== auth.currentUser.uid) {
    throw new Error('Unauthorized');
  }
  
  await updateDoc(doc(db, 'factFinds', data.id), data);
};
```

---

## Real-Time Listeners (Future Use)

### Listen to Document Changes

```javascript
import { onSnapshot } from 'firebase/firestore';

useEffect(() => {
  if (!applicationId) return;
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(
    doc(db, 'factFinds', applicationId),
    (doc) => {
      if (doc.exists()) {
        console.log('Document updated:', doc.data());
        setFormData(doc.data());
      }
    },
    (error) => {
      console.error('Listener error:', error);
    }
  );
  
  // Cleanup listener
  return () => unsubscribe();
}, [applicationId]);
```

---

## Testing Firebase Operations

### Test Data Creation

```javascript
// Create test user
const createTestUser = async () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpass123';
  
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    testEmail,
    testPassword
  );
  
  return userCredential.user;
};

// Create test fact-find
const createTestFactFind = async (userId) => {
  const docRef = await addDoc(collection(db, 'factFinds'), {
    userId: userId,
    fullName: 'Test User',
    email: 'test@example.com',
    propertyValue: 300000,
    depositAmount: 60000,
    status: 'in-progress',
    createdAt: new Date()
  });
  
  return docRef.id;
};
```

### Cleanup Test Data

```javascript
const cleanupTestData = async (userId) => {
  // Delete user's fact-finds
  const q = query(
    collection(db, 'factFinds'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  const deletePromises = snapshot.docs.map(doc =>
    deleteDoc(doc.ref)
  );
  
  await Promise.all(deletePromises);
  
  // Delete user document
  await deleteDoc(doc(db, 'users', userId));
  
  // Delete auth user
  await auth.currentUser.delete();
};
```

---

## Common Patterns by Page

### Portal.js Firebase Operations

```javascript
// 1. Load user profile
const userDoc = await getDoc(doc(db, 'users', userId));
const userData = userDoc.data();

// 2. Check fact-find completion
const q = query(
  collection(db, 'factFinds'),
  where('userId', '==', userId),
  where('status', '==', 'completed'),
  limit(1)
);
const snapshot = await getDocs(q);
const factFindComplete = !snapshot.empty;

// 3. Load property news
const newsDoc = await getDoc(doc(db, 'propertyNews', 'latest'));
const news = newsDoc.data();
```

### FactFind.js Firebase Operations

```javascript
// 1. Load existing application
const q = query(
  collection(db, 'factFinds'),
  where('userId', '==', userId),
  orderBy('lastUpdated', 'desc'),
  limit(1)
);
const snapshot = await getDocs(q);

// 2. Create new application
const docRef = await addDoc(collection(db, 'factFinds'), {
  userId: userId,
  ...formData,
  createdAt: new Date()
});

// 3. Update on step change
await updateDoc(doc(db, 'factFinds', appId), {
  ...formData,
  currentStep: step,
  lastUpdated: new Date()
});

// 4. Mark complete on submit
await updateDoc(doc(db, 'factFinds', appId), {
  status: 'completed',
  completedAt: new Date()
});
```

### SourcingResults.js Firebase Operations

```javascript
// 1. Load client data (if not passed in state)
const q = query(
  collection(db, 'factFinds'),
  where('userId', '==', userId),
  where('status', '==', 'completed'),
  orderBy('completedAt', 'desc'),
  limit(1)
);
const snapshot = await getDocs(q);
const clientData = snapshot.docs[0].data();

// 2. Load lender products
const lendersSnapshot = await getDocs(collection(db, 'lenderProducts'));
const lenders = lendersSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// 3. Save matches
await setDoc(
  doc(db, 'users', userId, 'mortgageMatches', 'latest'),
  {
    matches: topMatches,
    matchedAt: new Date()
  }
);
```

---

## Firestore Rules (Implementation Needed)

### Recommended Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if false; // Prevent deletion
      
      // Mortgage matches subcollection
      match /mortgageMatches/{matchId} {
        allow read: if isSignedIn() && isOwner(userId);
        allow write: if isSignedIn() && isOwner(userId);
      }
    }
    
    // Fact-finds collection
    match /factFinds/{docId} {
      allow read: if isSignedIn() && 
                     isOwner(resource.data.userId);
      allow create: if isSignedIn() && 
                       isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && 
                       isOwner(resource.data.userId);
      allow delete: if false; // Prevent deletion
    }
    
    // Lender products (read-only for clients)
    match /lenderProducts/{docId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin only via backend
    }
    
    // Property news (read-only)
    match /propertyNews/{docId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin only via backend
    }
  }
}
```

---

## Monitoring & Analytics

### Log Important Events

```javascript
const logUserAction = async (action, metadata) => {
  try {
    await addDoc(collection(db, 'analytics'), {
      userId: auth.currentUser?.uid,
      action: action,
      metadata: metadata,
      timestamp: new Date(),
      page: window.location.pathname
    });
  } catch (error) {
    // Silently fail - don't block user flow
    console.error('Analytics error:', error);
  }
};

// Usage
logUserAction('fact_find_completed', {
  applicationId: appId,
  steps: 11
});

logUserAction('lender_match_viewed', {
  matchCount: matches.length,
  topMatch: matches[0].lenderName
});
```

---

## Related Documentation

- See `firebase-structure.md` for complete database schema
- See `application-architecture.md` for how Firebase fits into overall architecture
- See `fact-find-implementation.md` for fact-find-specific Firebase operations
- See `development-guidelines.md` for coding standards

---

## Version History

**Version 1.0** (November 2024)
- Firebase Authentication implementation
- Firestore CRUD operations
- Error handling patterns
- Security best practices
- Real-time listener patterns (documented, not yet implemented)
- Firebase Storage patterns (documented, not yet implemented)

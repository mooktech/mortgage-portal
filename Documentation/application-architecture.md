# Application Architecture Documentation

## Overview
GETMY.MORTGAGE is a React-based single-page application (SPA) built with Firebase backend services. The application provides mortgage matching, client portal, document analysis, and marketplace features for adverse credit mortgage applicants.

---

## Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first CSS framework (styling visible in components)

### Backend
- **Firebase Authentication** - User authentication and authorization
- **Cloud Firestore** - NoSQL database for all application data
- **Firebase Storage** - Document and file storage
- **Firebase Hosting** (via Netlify) - Static site hosting with CDN

### Development & Deployment
- **Netlify** - Hosting and continuous deployment
- **Git** - Version control

---

## Application Structure

### Directory Organization

```
/src
  /pages                    # Page-level components (route targets)
    LandingPage.js         # Public homepage
    QuickQuote.js          # Initial quote form
    SignUp.js              # New user registration
    Login.js               # User authentication
    Portal.js              # Client dashboard (iOS-style widgets)
    FactFind.js            # 11-step comprehensive application
    SourcingResults.js     # Lender matching results display
    DocumentUpload.js      # AI document analysis
    Solicitors.js          # Solicitor marketplace
    Removals.js            # Removal services marketplace
    AdminTest.js           # Admin testing page
  
  firebase.js              # Firebase configuration and initialization
  
  App.js                   # Root component with routing
  index.js                 # Application entry point
```

---

## Routing Architecture

### Route Definition (App.js)

```javascript
<Router>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/quote" element={<QuickQuote />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/login" element={<Login />} />
    
    {/* Protected Routes (require authentication) */}
    <Route path="/portal" element={<Portal />} />
    <Route path="/factfind" element={<FactFind />} />
    <Route path="/sourcing-results" element={<SourcingResults />} />
    <Route path="/documents" element={<DocumentUpload />} />
    <Route path="/solicitors" element={<Solicitors />} />
    <Route path="/removals" element={<Removals />} />
    
    {/* Admin Routes */}
    <Route path="/admin-test" element={<AdminTest />} />
  </Routes>
</Router>
```

### Route Protection Pattern

All protected routes implement authentication checking:

```javascript
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      // User authenticated - load their data
      setUserId(user.uid);
    } else {
      // Not authenticated - redirect to login
      navigate('/login');
    }
  });
  return () => unsubscribe();
}, [navigate]);
```

---

## Core User Flows

### 1. New User Registration Flow

```
Landing Page → /
  ↓ Click "Get Started"
Quick Quote → /quote
  ↓ Submit initial details (property value, deposit, income)
Sign Up → /signup
  ↓ Create account with email/password
Portal Dashboard → /portal
  ↓ View quote details and next steps
```

### 2. Application Flow

```
Portal → /portal
  ↓ Click "Start Application"
Fact-Find → /factfind
  ↓ Complete 11-step form (auto-saves progress)
  ↓ Submit completed application
Sourcing Results → /sourcing-results
  ↓ View AI-matched lenders
  ↓ Select lender options
Book Consultation / Submit Documents
```

### 3. Document Upload Flow

```
Portal → /portal
  ↓ Click "Upload Documents"
Document Upload → /documents
  ↓ Upload payslip/bank statement
  ↓ AI extracts data automatically
  ↓ Review and confirm extracted data
  ↓ Save to profile
Portal → /portal
  ↓ Updated with new data
```

---

## Firebase Integration

### Firebase Services Initialization

**Location:** `src/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "get-my-mortgage-5a5c3",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

const app = initializeApp(firebaseConfig);

// Export services for use throughout app
export const auth = getAuth(app);     // Authentication
export const db = getFirestore(app);   // Database
export const storage = getStorage(app); // File storage

export default app;
```

### Service Usage Patterns

**Authentication:**
```javascript
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Login
await signInWithEmailAndPassword(auth, email, password);

// Sign up
await createUserWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);

// Listen for auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User signed in
  } else {
    // User signed out
  }
});
```

**Firestore Reads:**
```javascript
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Get single document
const docRef = doc(db, 'users', userId);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  const data = docSnap.data();
}

// Query collection
const q = query(
  collection(db, 'factFinds'),
  where('userId', '==', userId),
  where('status', '==', 'completed')
);
const querySnapshot = await getDocs(q);
```

**Firestore Writes:**
```javascript
import { addDoc, setDoc, updateDoc } from 'firebase/firestore';

// Create new document (auto-generated ID)
const docRef = await addDoc(collection(db, 'factFinds'), {
  userId: user.uid,
  status: 'in-progress',
  createdAt: new Date()
});

// Update existing document
await updateDoc(doc(db, 'factFinds', docId), {
  currentStep: 5,
  lastUpdated: new Date()
});

// Set document (create or replace)
await setDoc(doc(db, 'users', userId), {
  email: email,
  createdAt: new Date()
});
```

---

## State Management

### Application State Approach

GETMY.MORTGAGE uses **React's built-in state management** (useState, useEffect) rather than external libraries like Redux. This decision was made because:

1. Application state is mostly page-specific
2. Firebase handles persistent state
3. Simpler architecture for current scale
4. Faster development iteration

### Common State Patterns

**Component-Level State:**
```javascript
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

**User Authentication State:**
```javascript
const [user, setUser] = useState(null);
const [userData, setUserData] = useState(null);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      // Load additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      setUserData(userDoc.data());
    }
  });
  return () => unsubscribe();
}, []);
```

**Form Data Persistence:**
```javascript
// Auto-save form data as user types
useEffect(() => {
  const saveTimer = setTimeout(async () => {
    if (applicationId && userId) {
      await updateDoc(doc(db, 'factFinds', applicationId), {
        ...formData,
        lastUpdated: new Date()
      });
    }
  }, 2000); // Debounce saves by 2 seconds
  
  return () => clearTimeout(saveTimer);
}, [formData]);
```

**Navigation State:**
```javascript
// Pass data between routes using location state
navigate('/sourcing-results', {
  state: { clientData: formData }
});

// Receive in target component
const location = useLocation();
const clientData = location.state?.clientData;
```

---

## Component Architecture

### Page Components

**Purpose:** Handle routing, authentication, data loading, and overall page structure

**Pattern:**
```javascript
const PageComponent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // 1. Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login');
    });
    return () => unsubscribe();
  }, []);
  
  // 2. Data loading
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Render
  return (
    <div className="min-h-screen">
      {/* Page content */}
    </div>
  );
};
```

### UI Patterns

**Loading States:**
```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}
```

**Error States:**
```javascript
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
    <AlertCircle className="text-red-600" size={20} />
    <p className="text-red-800">{error}</p>
  </div>
)}
```

**Empty States:**
```javascript
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500">No items found</p>
    <button onClick={loadItems} className="mt-4 text-blue-600">
      Try again
    </button>
  </div>
)}
```

---

## Key Features Implementation

### 1. Portal Dashboard (iOS-Style Widgets)

**Location:** `src/pages/Portal.js`

**Architecture:**
- Grid-based layout of interactive "tiles"
- Each tile opens a "Mission Control" modal with detailed content
- Real-time data from Firebase
- Conditional rendering based on application status

**Widget Types:**
1. **Application Progress** - Shows current step in journey
2. **Next Steps** - Action items for user
3. **Market Alerts** - Property news and rate updates
4. **Document Upload** - Quick access to AI document analysis
5. **Services Marketplace** - Solicitors, removals, utilities
6. **Lender Matching** - AI-powered lender matching status
7. **Matched Lenders** - View results (only after fact-find complete)

**Data Sources:**
- `users/{userId}` - User profile and quote data
- `factFinds/{applicationId}` - Application progress
- `propertyNews/latest` - Market news and rate updates
- `users/{userId}/mortgageMatches/latest` - Lender matches

### 2. Fact-Find Form (11-Step Application)

**Location:** `src/pages/FactFind.js`

**Architecture:**
- Multi-step form with progress tracking
- Auto-save functionality (saves every step change)
- Resume capability (loads most recent incomplete application)
- Field validation and conditional logic
- Dynamic sections based on user inputs

**11 Steps:**
1. Personal Details
2. Address History
3. Employment & Income
4. Property Details
5. Financial Commitments
6. Adverse Credit
7. Assets & Savings
8. Mortgage Preferences
9. Protection & Insurance
10. Goals & Concerns
11. Declaration & Consent

**Data Flow:**
```
User Input → formData state
  ↓ (on step change)
Save to Firebase → factFinds/{applicationId}
  ↓ (on completion)
Navigate to Sourcing Results
  ↓ (with client data)
Run Matching Engine
```

### 3. Lender Matching Engine

**Location:** `src/pages/SourcingResults.js`

**Algorithm Overview:**
```
1. Load client data (from FactFind)
2. Fetch all lender products from Firebase
3. For each lender:
   a. Check basic eligibility (LTV, income, loan amount)
   b. Check adverse credit acceptance
   c. Evaluate specific criteria (CCJ age, default values, etc.)
   d. Calculate match score (0-100)
   e. Generate match reasons
4. Sort by match score
5. Display top matches
6. Save results to user's profile
```

**Matching Criteria:**
- LTV (Loan-to-Value) limits
- Income requirements
- Employment status
- Adverse credit history:
  - CCJs (count, value, age, satisfied status)
  - Defaults (count, value, age)
  - Bankruptcy
  - IVAs
  - DMPs
  - Missed payments

**Match Score Calculation:**
```javascript
let score = 100;

// LTV penalty
if (ltv > lender.maxLTV) score -= 50;

// Adverse credit penalties
if (ccjs.length > lender.maxCCJs) score -= 20;
if (totalCCJValue > lender.maxCCJValue) score -= 15;
if (monthsSinceCCJ < lender.minMonthsSinceCCJ) score -= 25;

// Income bonus
if (income > lender.minIncome * 1.5) score += 5;

return Math.max(0, Math.min(100, score));
```

### 4. Document Upload & AI Analysis

**Location:** `src/pages/DocumentUpload.js`

**Features:**
- Drag-and-drop file upload
- PDF and image support
- Mock AI extraction (ready for OpenAI Vision API)
- Data review and confirmation
- Save to user profile

**Current Implementation:**
- Mock data extraction (simulated 3-second delay)
- Planned: OpenAI Vision API integration
- Document types: Payslips, Bank Statements

**AI Integration Path:**
```javascript
// Future implementation
const analyzeDocument = async (file) => {
  const base64Image = await fileToBase64(file);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Extract payslip data from this document' },
          { type: 'image_url', image_url: { url: base64Image }}
        ]
      }]
    })
  });
  
  return await response.json();
};
```

---

## Data Flow Diagrams

### Authentication Flow

```
┌─────────────┐
│ User Opens  │
│  App        │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ onAuthStateChanged │
│ listener fires   │
└──────┬──────────┘
       │
   ┌───┴───┐
   │ User? │
   └───┬───┘
       │
   ┌───┴───────────┐
   │ Yes    │ No   │
   ▼        ▼      │
┌──────┐ ┌────────┤
│Portal│ │ Login  │
└──────┘ └────────┘
```

### Fact-Find Save Flow

```
User edits field
       ↓
onChange handler
       ↓
Update formData state
       ↓
useEffect detects change
       ↓
Start 2-second timer
       ↓
Timer completes
       ↓
Check if applicationId exists
   ├── Yes → updateDoc() existing
   └── No → addDoc() create new
       ↓
Save to Firebase
       ↓
Set applicationId if new
       ↓
Show "Saving..." indicator
```

### Matching Engine Flow

```
Completed Fact-Find
       ↓
Navigate to /sourcing-results
       ↓
loadAndMatchLenders()
       ↓
Get user auth
       ↓
Load client data from:
  - Location state (if just submitted)
  - OR Firebase (if returning)
       ↓
Load all lenders from Firebase
  collection: 'lenderProducts'
       ↓
evaluateLenders()
  ├─ For each lender:
  │  ├─ Check basic eligibility
  │  ├─ Check adverse credit
  │  ├─ Calculate match score
  │  └─ Generate match reasons
  └─ Return matches array
       ↓
Sort by match score (high to low)
       ↓
Display top matches
       ↓
Save to Firebase:
  users/{uid}/mortgageMatches/latest
```

---

## Performance Considerations

### Current Optimizations

1. **Debounced Auto-Save** - Form saves 2 seconds after last edit (prevents excessive writes)
2. **Conditional Rendering** - Only active step content is rendered in fact-find
3. **Lazy Data Loading** - Portal widgets load data only when needed
4. **Firebase Queries** - Limited to necessary fields and document counts
5. **Loading States** - Immediate UI feedback while data loads

### Future Optimizations

1. **Code Splitting** - Lazy load routes for faster initial load
2. **Image Optimization** - Compress and optimize uploaded documents
3. **Caching** - Cache lender data to reduce Firebase reads
4. **Pagination** - Implement for large result sets
5. **Service Worker** - Add PWA support for offline capability

---

## Security Architecture

### Authentication Security

**Current Implementation:**
- Firebase Authentication handles all auth logic
- Email/password authentication
- Secure token-based sessions
- Auto token refresh

**Protection Patterns:**
```javascript
// Every protected route checks auth
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Proceed with authenticated operations
  });
  return () => unsubscribe();
}, []);
```

### Data Security

**Firestore Security Rules (planned):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can only read/write their own fact-finds
    match /factFinds/{docId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Lender products are read-only for clients
    match /lenderProducts/{docId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
  }
}
```

### Input Validation

**Client-Side:**
- Required field validation
- Format validation (email, phone, dates)
- Range validation (LTV 0-100, income > 0)
- Conditional validation (if X selected, Y required)

**Server-Side (planned):**
- Firebase Functions to validate data before writes
- Sanitize inputs to prevent injection attacks
- Rate limiting on writes

---

## Error Handling Strategy

### Error Handling Patterns

**Firebase Errors:**
```javascript
try {
  await updateDoc(doc(db, 'factFinds', appId), data);
} catch (error) {
  console.error('Save error:', error);
  
  // Show user-friendly message
  if (error.code === 'permission-denied') {
    setError('You don\'t have permission to edit this application');
  } else if (error.code === 'unavailable') {
    setError('Connection lost. Please check your internet and try again');
  } else {
    setError('Failed to save. Please try again');
  }
  
  // Log for debugging
  logError({
    function: 'saveFactFind',
    error: error.message,
    userId: user?.uid,
    timestamp: new Date()
  });
}
```

**Network Errors:**
```javascript
const [retryCount, setRetryCount] = useState(0);

const fetchWithRetry = async (fetchFunction, maxRetries = 3) => {
  try {
    return await fetchFunction();
  } catch (error) {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      return fetchWithRetry(fetchFunction, maxRetries);
    }
    throw error;
  }
};
```

---

## Deployment Architecture

### Build Process

```bash
# Development
npm start              # Local dev server
npm run build          # Production build

# Deployment
git push origin main   # Push to GitHub
   ↓
Netlify detects push
   ↓
Runs build command
   ↓
Deploys to CDN
   ↓
Live at getmy.mortgage
```

### Environment Variables

**Required Environment Variables:**
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

**Management:**
- Development: `.env.local` (not committed to git)
- Production: Netlify dashboard environment variables

---

## Testing Strategy

### Current Testing

**Manual Testing:**
- User flow testing on staging
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile responsive testing
- Authentication flow testing
- Data persistence testing

### Planned Testing

**Unit Tests:**
- Matching engine algorithm
- Date calculations
- LTV calculations
- Form validation functions

**Integration Tests:**
- Fact-find save/load cycle
- Authentication flows
- Firebase read/write operations

**End-to-End Tests:**
- Complete user journey
- Form submission to results
- Document upload process

---

## Monitoring & Analytics

### Planned Implementation

**Firebase Analytics:**
- Page views
- User engagement
- Conversion funnels
- Error tracking

**Custom Logging:**
```javascript
const logUserAction = async (action, metadata) => {
  await addDoc(collection(db, 'analytics'), {
    userId: auth.currentUser?.uid,
    action: action,
    metadata: metadata,
    timestamp: new Date(),
    userAgent: navigator.userAgent
  });
};
```

---

## Future Architecture Considerations

### Scalability

**Current Limits:**
- ~1000 concurrent users (Firebase free tier)
- ~50k document reads/day
- ~20k document writes/day

**Scaling Strategy:**
1. Upgrade Firebase plan as needed
2. Implement caching layer
3. Optimize queries and indexes
4. Consider Cloud Functions for heavy computations

### Feature Additions

**Planned Features:**
1. Real-time chat with advisers
2. Video consultation booking
3. Credit score integration
4. Automated decision in principle
5. API integrations with lenders
6. Mobile app (React Native)

### Architecture Evolution

**Potential Changes:**
1. **Move to Next.js** - Server-side rendering, better SEO
2. **Add Redux** - If state management becomes complex
3. **Microservices** - Separate matching engine as independent service
4. **GraphQL** - For more efficient data fetching
5. **WebSockets** - For real-time updates

---

## Related Documentation

- See `fact-find-implementation.md` for detailed fact-find documentation
- See `firebase-integration.md` for Firebase patterns and best practices
- See `firebase-structure.md` for complete database schema
- See `matching-engine-docs.md` for matching algorithm details
- See `development-guidelines.md` for coding standards

---

## Maintenance Notes

**Regular Tasks:**
- Monitor Firebase usage and costs
- Review error logs weekly
- Update dependencies monthly
- Test all user flows after Firebase updates
- Review and optimize slow queries

**Version History:**

**Version 1.0** (November 2024)
- Initial application architecture
- 11-step fact-find implementation
- Lender matching engine
- Portal dashboard with iOS-style widgets
- Document upload (mock AI)
- Services marketplace integration

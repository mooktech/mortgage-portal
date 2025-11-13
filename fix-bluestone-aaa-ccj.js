// fix-bluestone-aaa-ccj.js
// Updates Bluestone AAA to accept 1 satisfied CCJ in 36 months (instead of 0)

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzp560ybsCr0NI0ZaNGpsWwFcRvzdQ7uM",
  authDomain: "get-my-mortgage-5a5c3.firebaseapp.com",
  projectId: "get-my-mortgage-5a5c3",
  storageBucket: "get-my-mortgage-5a5c3.firebasestorage.app",
  messagingSenderId: "72109758153",
  appId: "1:72109758153:web:a4eb01dd268d483c4d5f18",
  measurementId: "G-F1M6F6K5Y2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixBluestoneAAA() {
  try {
    console.log('🔍 Searching for Bluestone AAA product...');
    
    // Get all lender products
    const querySnapshot = await getDocs(collection(db, "lenderProducts"));
    
    let found = false;
    
    // Find Bluestone AAA
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      if (data.lenderName === "Bluestone Mortgages" && data.tierName === "AAA") {
        console.log('✅ Found Bluestone AAA:', docSnap.id);
        console.log('📊 Current CCJ criteria:', data.tierCriteria?.ccjs);
        
        // Update the CCJ criteria
        const docRef = doc(db, "lenderProducts", docSnap.id);
        await updateDoc(docRef, {
          "tierCriteria.ccjs.maxInPeriod": 1,
          "tierCriteria.ccjs.satisfiedOnly": true,
          "tierCriteria.ccjs.notes": "1 (satisfied) in 36 months. <£500 ignored if telecom/utilities"
        });
        
        console.log('✅ Updated AAA CCJ criteria to:');
        console.log('   - maxInPeriod: 1 (was 0)');
        console.log('   - satisfiedOnly: true (new field)');
        console.log('   - notes updated to match criteria table');
        
        found = true;
      }
    }
    
    if (!found) {
      console.log('❌ Bluestone AAA product not found in database');
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixBluestoneAAA();
// importLenders.js - Run this to import lender data to Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query } from "firebase/firestore";

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

// PEPPER MONEY TIER 1
const pepperTier1 = {
  lenderName: "Pepper Money",
  lenderType: "Adverse Credit Specialist",
  tierName: "Pepper48 Light Limited Edition - Residential",
  description: "Suitable for customers that haven't had a Default in the last 48 months and who have never had a CCJ",
  maxLTV: 75,
  maxLoan: 1000000,
  minLoan: 25001,
  rates: {
    "75ltv_5yr_free_legals": 5.14,
    "75ltv_5yr_cashback": 5.14,
    "75ltv_5yr_free_legals_free_val": 5.29,
    "75ltv_5yr_cashback_free_val": 5.29,
    "75ltv_5yr_free_legals_free_val_no_comp_fee": 5.44,
    "75ltv_5yr_cashback_free_val_no_comp_fee": 5.44
  },
  incentives: [
    {
      type: "Free Legals",
      rate: 5.14,
      compFee: 1495,
      ltv: 75
    },
    {
      type: "Cashback",
      rate: 5.14,
      compFee: 1495,
      ltv: 75
    },
    {
      type: "Free Legals + Free Valuation",
      rate: 5.29,
      compFee: 795,
      ltv: 75
    },
    {
      type: "Cashback + Free Valuation",
      rate: 5.29,
      compFee: 795,
      ltv: 75
    },
    {
      type: "Free Legals + Free Valuation (No Comp Fee)",
      rate: 5.44,
      compFee: 0,
      ltv: 75
    },
    {
      type: "Cashback + Free Valuation (No Comp Fee)",
      rate: 5.44,
      compFee: 0,
      ltv: 75
    }
  ],
  erc: "4%, 4%, 3%, 3%, 2%",
  applicationFee: 150,
  freeValuationUpTo: 500000,
  cashbackOrLegals: "£350 Cashback or Free Legals as standard",
  pepperFlex: "Customers who fall just outside of our standard criteria can pay an additional Flex completion fee of between £1,000 and £2,500",
  tierCriteria: {
    ccjs: {
      acceptsClients: false,
      maxEver: 0,
      maxInPeriod: null,
      periodMonths: null,
      notes: "Never had a CCJ"
    },
    defaults: {
      acceptsClients: true,
      maxInPeriod: 0,
      periodMonths: 48,
      notes: "None or 0 registered in 48 months (older defaults OK)"
    },
    securedMissedPayments: {
      acceptsClients: true,
      maxInPeriod: 0,
      periodMonths: 48,
      noArrearsBalanceInLastMonths: 6,
      notes: "0 in 48 months (No arrears balance in last 6 months)"
    },
    bankruptcy: {
      acceptsClients: true,
      minYearsSinceDischarge: 6,
      notes: "Discharged > 6 years ago"
    },
    iva: {
      acceptsClients: true,
      minYearsSinceDischarge: 6,
      notes: "Discharged > 6 years ago"
    },
    repossession: {
      acceptsClients: true,
      maxInPeriod: 0,
      periodYears: 6,
      notes: "None in last 6 years (older repossessions OK if 6+ years ago)"
    },
    dmp: {
      acceptsClients: true,
      mustBeSatisfied: true,
      minMonthsSinceSatisfied: 12,
      notes: "Considered if satisfied over 12 months ago"
    }
  }
};

// Function to import tier
async function importTier(tierData) {
  try {
    const docRef = await addDoc(collection(db, "lenderProducts"), tierData);
    console.log("✅ Tier imported successfully! Document ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error importing tier:", error);
    throw error;
  }
}

// Function to check what's already in the database
async function checkDatabase() {
  try {
    const q = query(collection(db, "lenderProducts"));
    const querySnapshot = await getDocs(q);
    
    console.log(`\n📊 Current database has ${querySnapshot.size} products:\n`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.lenderName}: ${data.tierName}`);
    });
    
    return querySnapshot.size;
  } catch (error) {
    console.error("❌ Error checking database:", error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log("🔥 Starting Pepper Money Tier 1 import...\n");
  
  // Check current database
  await checkDatabase();
  
  // Import tier 1
  console.log("\n📤 Importing Pepper48 Light Limited Edition...");
  await importTier(pepperTier1);
  
  // Check database again
  console.log("\n✅ Import complete! New database contents:");
  await checkDatabase();
  
  console.log("\n🎉 SUCCESS! Tier 1 is now in Firebase!");
  process.exit(0);
}

main();
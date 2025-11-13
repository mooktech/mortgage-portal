// importTandem_T3.js - Tandem Three (T3) - Heavy adverse, 80% LTV
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

const tandemT3 = {
  lenderName: "Tandem Bank",
  lenderType: "Adverse Credit Specialist",
  tierName: "Tandem Three (T3)",
  description: "80% LTV - 3 CCJs, 3 defaults, 3 missed payments (with 0 in last 3 months)",
  maxLTV: 80,
  maxLoan: 500000,
  minLoan: 75000,
  incentives: [
    // 2 Year Fixed
    { type: "2-year fixed", term: "2yr", rate: 6.99, compFee: 0, ltv: 70, appFee: 0, ttFee: 0, valuation: 0 },
    { type: "2-year fixed", term: "2yr", rate: 6.99, compFee: 0, ltv: 75, appFee: 0, ttFee: 0, valuation: 0 },
    { type: "2-year fixed", term: "2yr", rate: 6.99, compFee: 0, ltv: 80, appFee: 0, ttFee: 0, valuation: 0 },
    
    // 5 Year Fixed
    { type: "5-year fixed", term: "5yr", rate: 6.99, compFee: 0, ltv: 70, appFee: 0, ttFee: 0, valuation: 0 },
    { type: "5-year fixed", term: "5yr", rate: 7.39, compFee: 0, ltv: 75, appFee: 0, ttFee: 0, valuation: 0 },
    { type: "5-year fixed", term: "5yr", rate: 7.59, compFee: 0, ltv: 80, appFee: 0, ttFee: 0, valuation: 0 }
  ],
  erc_2yr: "4%/3%",
  erc_5yr: "4%/4%/3%/2%/1%",
  revertRate: "Current rate + lender base rate (currently 0.50%)",
  tierCriteria: {
    ccjs: {
      acceptsClients: true,
      maxInPeriod: 3,
      periodMonths: 24,
      recentMax: 0,
      recentPeriodMonths: 3,
      notes: "3 in 24 months with 0 in 3 months. <£350 utilities/communications ignored"
    },
    defaults: {
      acceptsClients: true,
      maxInPeriod: 3,
      periodMonths: 24,
      recentMax: 0,
      recentPeriodMonths: 3,
      notes: "3 in 24 months with 0 in 3 months. <£350 utilities/communications ignored"
    },
    securedArrears: {
      acceptsClients: true,
      notes: "0-6 months = 0, 7-24 months = 3, current status = 1"
    },
    unsecuredArrears: {
      acceptsClients: true,
      notes: "Highest status: 0-6 months = 2, 7-24 months = 3, current status = 2"
    },
    bankruptcy: {
      acceptsClients: true,
      minMonthsSinceDischarge: 36,
      notes: ">36 months discharged on IVA & Bankruptcy"
    },
    iva: {
      acceptsClients: true,
      minMonthsSinceDischarge: 36,
      notes: ">36 months discharged on IVA & Bankruptcy"
    },
    dmp: {
      acceptsClients: true,
      notes: "Accepted subject to completed satisfactorily >12 months ago"
    },
    paydayLoans: {
      acceptsClients: true,
      maxInPeriod: 3,
      periodMonths: 12,
      maxCurrentlyActive: 1,
      notes: "Max 3 in last 12 months. Max 1 currently active"
    }
  },
  loanAmounts: {
    minimum: 75000,
    maximum: 500000
  },
  notes: "Free valuation up to £700k. Broker fee £1,495 can be added to loan. EPC A-rated: 0.30% discount, B-rated: 0.20% discount"
};

async function importProduct() {
  try {
    const docRef = await addDoc(collection(db, "lenderProducts"), tandemT3);
    console.log("✅ Tandem T3 imported! ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

importProduct();
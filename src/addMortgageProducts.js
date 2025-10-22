// This is a ONE-TIME script to populate mortgage products
// Run it once, then delete it or comment it out

import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const mortgageProducts = [
  {
    id: "nationwide-5yr-fixed-90ltv",
    lender: "Nationwide",
    productName: "5 Year Fixed Rate",
    rate: 4.64,
    apr: 5.1,
    productFee: 999,
    productType: "Fixed",
    term: 5,
    maxLTV: 90,
    minDeposit: 10,
    features: ["Free valuation", "No early repayment charges after 5 years"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "hsbc-2yr-fixed-85ltv",
    lender: "HSBC",
    productName: "2 Year Fixed Rate",
    rate: 4.89,
    apr: 5.2,
    productFee: 999,
    productType: "Fixed",
    term: 2,
    maxLTV: 85,
    minDeposit: 15,
    features: ["Free standard valuation", "Early repayment charges apply"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "santander-3yr-fixed-80ltv",
    lender: "Santander",
    productName: "3 Year Fixed Rate",
    rate: 4.75,
    apr: 5.15,
    productFee: 1495,
    productType: "Fixed",
    term: 3,
    maxLTV: 80,
    minDeposit: 20,
    features: ["Free valuation up to £670", "Unlimited overpayments"],
    eligibility: {
      minIncome: 25000,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "barclays-tracker-90ltv",
    lender: "Barclays",
    productName: "Variable Tracker Rate",
    rate: 5.12,
    apr: 5.3,
    productFee: 0,
    productType: "Tracker",
    term: 2,
    maxLTV: 90,
    minDeposit: 10,
    features: ["No product fee", "Track Bank of England base rate"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "natwest-2yr-fixed-90ltv",
    lender: "NatWest",
    productName: "2 Year Fixed Rate",
    rate: 4.92,
    apr: 5.18,
    productFee: 995,
    productType: "Fixed",
    term: 2,
    maxLTV: 90,
    minDeposit: 10,
    features: ["Free standard valuation", "Overpayments up to 10%"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "halifax-5yr-fixed-75ltv",
    lender: "Halifax",
    productName: "5 Year Fixed Rate",
    rate: 4.54,
    apr: 4.95,
    productFee: 999,
    productType: "Fixed",
    term: 5,
    maxLTV: 75,
    minDeposit: 25,
    features: ["Free standard valuation", "Early repayment charges apply"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "lloyds-2yr-fixed-95ltv",
    lender: "Lloyds Bank",
    productName: "2 Year Fixed Rate - 95% LTV",
    rate: 5.45,
    apr: 5.8,
    productFee: 999,
    productType: "Fixed",
    term: 2,
    maxLTV: 95,
    minDeposit: 5,
    features: ["Help to Buy eligible", "Free valuation"],
    eligibility: {
      minIncome: 0,
      selfEmployed: false,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "tsb-3yr-fixed-85ltv",
    lender: "TSB",
    productName: "3 Year Fixed Rate",
    rate: 4.79,
    apr: 5.12,
    productFee: 995,
    productType: "Fixed",
    term: 3,
    maxLTV: 85,
    minDeposit: 15,
    features: ["Free standard valuation", "No early repayment in final year"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "virgin-5yr-fixed-90ltv",
    lender: "Virgin Money",
    productName: "5 Year Fixed Rate",
    rate: 4.69,
    apr: 5.05,
    productFee: 995,
    productType: "Fixed",
    term: 5,
    maxLTV: 90,
    minDeposit: 10,
    features: ["Free valuation", "10% overpayments allowed"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "nationwide-2yr-fixed-95ltv",
    lender: "Nationwide",
    productName: "2 Year Fixed Rate - 95% LTV",
    rate: 5.34,
    apr: 5.65,
    productFee: 999,
    productType: "Fixed",
    term: 2,
    maxLTV: 95,
    minDeposit: 5,
    features: ["First time buyer eligible", "Free valuation"],
    eligibility: {
      minIncome: 0,
      selfEmployed: false,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "santander-5yr-fixed-60ltv",
    lender: "Santander",
    productName: "5 Year Fixed Rate - Low LTV",
    rate: 4.29,
    apr: 4.75,
    productFee: 999,
    productType: "Fixed",
    term: 5,
    maxLTV: 60,
    minDeposit: 40,
    features: ["Best rate for large deposits", "Free valuation"],
    eligibility: {
      minIncome: 30000,
      selfEmployed: true,
      firstTimeBuyer: false
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "hsbc-5yr-fixed-75ltv",
    lender: "HSBC",
    productName: "5 Year Fixed Rate",
    rate: 4.59,
    apr: 4.98,
    productFee: 999,
    productType: "Fixed",
    term: 5,
    maxLTV: 75,
    minDeposit: 25,
    features: ["Free standard valuation", "Cashback available"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "barclays-2yr-fixed-80ltv",
    lender: "Barclays",
    productName: "2 Year Fixed Rate",
    rate: 4.84,
    apr: 5.15,
    productFee: 999,
    productType: "Fixed",
    term: 2,
    maxLTV: 80,
    minDeposit: 20,
    features: ["Free valuation", "10% overpayments"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "natwest-5yr-fixed-85ltv",
    lender: "NatWest",
    productName: "5 Year Fixed Rate",
    rate: 4.67,
    apr: 5.03,
    productFee: 1495,
    productType: "Fixed",
    term: 5,
    maxLTV: 85,
    minDeposit: 15,
    features: ["Free standard valuation", "Overpayments up to 10%"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "coventry-3yr-fixed-90ltv",
    lender: "Coventry Building Society",
    productName: "3 Year Fixed Rate",
    rate: 4.82,
    apr: 5.14,
    productFee: 999,
    productType: "Fixed",
    term: 3,
    maxLTV: 90,
    minDeposit: 10,
    features: ["Free valuation", "10% overpayments"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "yorkshire-5yr-fixed-75ltv",
    lender: "Yorkshire Building Society",
    productName: "5 Year Fixed Rate",
    rate: 4.56,
    apr: 4.96,
    productFee: 995,
    productType: "Fixed",
    term: 5,
    maxLTV: 75,
    minDeposit: 25,
    features: ["Free standard valuation", "No early repayment final year"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "skipton-2yr-fixed-90ltv",
    lender: "Skipton Building Society",
    productName: "2 Year Fixed Rate",
    rate: 4.94,
    apr: 5.21,
    productFee: 995,
    productType: "Fixed",
    term: 2,
    maxLTV: 90,
    minDeposit: 10,
    features: ["Free valuation up to £670", "Track record mortgage available"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "metro-5yr-fixed-85ltv",
    lender: "Metro Bank",
    productName: "5 Year Fixed Rate",
    rate: 4.72,
    apr: 5.08,
    productFee: 999,
    productType: "Fixed",
    term: 5,
    maxLTV: 85,
    minDeposit: 15,
    features: ["7-day mortgage promise", "Free valuation"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "accord-3yr-fixed-75ltv",
    lender: "Accord Mortgages",
    productName: "3 Year Fixed Rate",
    rate: 4.71,
    apr: 5.05,
    productFee: 995,
    productType: "Fixed",
    term: 3,
    maxLTV: 75,
    minDeposit: 25,
    features: ["Free standard valuation", "Intermediary only"],
    eligibility: {
      minIncome: 0,
      selfEmployed: true,
      firstTimeBuyer: true
    },
    lastUpdated: "2024-10-21",
    status: "active"
  },
  {
    id: "platform-5yr-fixed-60ltv",
    lender: "Platform",
    productName: "5 Year Fixed Rate - Premium",
    rate: 4.24,
    apr: 4.68,
    productFee: 999,
    productType: "Fixed",
    term: 5,
    maxLTV: 60,
    minDeposit: 40,
    features: ["Best rate in market", "Free valuation", "Cashback £500"],
    eligibility: {
      minIncome: 35000,
      selfEmployed: true,
      firstTimeBuyer: false
    },
    lastUpdated: "2024-10-21",
    status: "active"
  }
];

export const addMortgageProducts = async () => {
  console.log('Starting to add mortgage products...');
  
  try {
    for (const product of mortgageProducts) {
      await addDoc(collection(db, 'mortgageProducts'), product);
      console.log(`Added: ${product.lender} - ${product.productName}`);
    }
    console.log('✅ All products added successfully!');
  } catch (error) {
    console.error('Error adding products:', error);
  }
};
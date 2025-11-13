import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ChevronRight,
  Home,
  Briefcase,
  DollarSign,
  FileText,
  User,
  Brain,
  RefreshCw,
  ArrowLeft,
  Star,
  TrendingDown,
  Award
} from 'lucide-react';

const SourcingResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [lenderMatches, setLenderMatches] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedLender, setSelectedLender] = useState(null);

  useEffect(() => {
    loadAndMatchLenders();
  }, []);

  const loadAndMatchLenders = async () => {
    try {
      setLoading(true);
      setMatchingProgress(10);

      // Get user data from location state (passed from FactFind)
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      setMatchingProgress(20);

      // Get client data from navigation state or fetch from Firebase
      let userApplicationData;
      if (location.state?.clientData) {
        userApplicationData = location.state.clientData;
      } else {
        // If no data in state, fetch the most recent fact-find from Firebase
        const q = query(
          collection(db, 'factFinds'),
          where('userId', '==', user.uid),
          where('status', '==', 'completed'),
          orderBy('completedAt', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userApplicationData = querySnapshot.docs[0].data();
        }
      }

      if (!userApplicationData) {
        console.error('No user application data found');
        navigate('/factfind');
        return;
      }

      setUserData(userApplicationData);
      setMatchingProgress(40);

      // Load all lenders from Firebase
      console.log('📊 Loading lenders from Firebase...');
      const lendersSnapshot = await getDocs(collection(db, 'lenderProducts'));
      const allLenders = [];
      
      lendersSnapshot.forEach((doc) => {
        const data = doc.data();
        allLenders.push({
          id: doc.id,
          ...data
        });
      });

      console.log(`✅ Found ${allLenders.length} lender products in database`);
      setMatchingProgress(60);

      // Run matching algorithm
      const matches = evaluateLenders(userApplicationData, allLenders);
      
      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);
      
      console.log(`🎯 Matched ${matches.length} lenders for this client`);
      setMatchingProgress(90);
      setLenderMatches(matches);

      // Save matches to Firebase
      if (user && matches.length > 0) {
        await setDoc(doc(db, 'users', user.uid, 'mortgageMatches', 'latest'), {
          matches: matches.slice(0, 20), // Save top 20 matches
          matchedAt: new Date().toISOString(),
          userData: userApplicationData
        });
      }

      setMatchingProgress(100);
    } catch (error) {
      console.error('Error matching lenders:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const evaluateLenders = (userData, lenders) => {
    const matches = [];
    let debugText = '=== BLUESTONE MATCHING DEBUG LOG ===\n\n';
    
    const addLog = (message, data = null) => {
      debugText += `${message}\n`;
      if (data) {
        debugText += JSON.stringify(data, null, 2) + '\n';
      }
      debugText += '\n';
      console.log(message, data || '');
    };
    
    // Calculate LTV from form data
    const propertyValue = parseFloat(userData.propertyValue) || 0;
    const depositAmount = parseFloat(userData.depositAmount) || 0;
    const loanAmount = propertyValue - depositAmount;
    const ltv = propertyValue > 0 ? ((loanAmount / propertyValue) * 100) : 75;
    
    // Extract user criteria
    const income = parseFloat(userData.basicSalary) || 0;
    const bonus = parseFloat(userData.bonus) || 0;
    const totalIncome = income + bonus;
    const employmentStatus = userData.employmentStatus || 'employed';
    const propertyType = userData.propertyType || 'house';
    const mortgageTerm = parseInt(userData.mortgageTerm) || 25;
    
    // Adverse credit data
    const ccjs = userData.ccjs || [];
    const defaults = userData.defaults || [];
    const missedPayments = parseInt(userData.creditCardMissedPayments) || 0;
    const bankruptcyDate = userData.bankruptcyDate;
    const ivaDate = userData.ivaDate;
    const dmpActive = userData.dmpActive === 'yes';
    const paydayLoans = parseInt(userData.paydayLoans) || 0;

    // Calculate months since adverse events
    const now = new Date();
    const monthsSinceCCJ = ccjs.length > 0 ? 
      Math.min(...ccjs.map(ccj => {
        if (!ccj.dateRegistered) return 999;
        const ccjDate = new Date(ccj.dateRegistered);
        return Math.floor((now - ccjDate) / (1000 * 60 * 60 * 24 * 30.44));
      })) : 999;
    
    const monthsSinceDefault = defaults.length > 0 ?
      Math.min(...defaults.map(def => {
        if (!def.dateRegistered) return 999;
        const defDate = new Date(def.dateRegistered);
        return Math.floor((now - defDate) / (1000 * 60 * 60 * 24 * 30.44));
      })) : 999;

    const monthsSinceBankruptcy = bankruptcyDate ?
      Math.floor((now - new Date(bankruptcyDate)) / (1000 * 60 * 60 * 24 * 30.44)) : 999;

    const monthsSinceIVA = ivaDate ?
      Math.floor((now - new Date(ivaDate)) / (1000 * 60 * 60 * 24 * 30.44)) : 999;

    // Total adverse credit value
    const totalCCJValue = ccjs.reduce((sum, ccj) => sum + (parseFloat(ccj.amount) || 0), 0);
    const totalDefaultValue = defaults.reduce((sum, def) => sum + (parseFloat(def.amount) || 0), 0);

    addLog('🔍 Client Profile:', {
      ltv: ltv.toFixed(1) + '%',
      loanAmount: '£' + loanAmount.toLocaleString(),
      income: '£' + totalIncome.toLocaleString(),
      ccjs: ccjs.length,
      defaults: defaults.length,
      monthsSinceCCJ,
      monthsSinceDefault
    });

    // Evaluate each lender
    lenders.forEach(lender => {
      // DEBUG: Log Bluestone AAA evaluation
      if (lender.lenderName === "Bluestone Mortgages" && lender.tierName === "AAA") {
        addLog('🔍 Evaluating Bluestone AAA:', {
          tierName: lender.tierName,
          maxLTV: lender.maxLTV,
          minLTV: lender.minLTV,
          maxLoan: lender.maxLoan,
          minLoan: lender.minLoan,
          tierCriteria: lender.tierCriteria,
          clientLTV: ltv.toFixed(1) + '%',
          clientLoan: '£' + loanAmount.toLocaleString()
        });
      }

      let matchScore = 100;
      const matchReasons = [];
      const rejectionReasons = [];
      
      // Check basic lending criteria
      if (lender.maxLTV && ltv > lender.maxLTV) {
        matchScore = 0;
        rejectionReasons.push(`LTV ${ltv.toFixed(1)}% exceeds max ${lender.maxLTV}%`);
        
        // DEBUG: Log Bluestone rejections
        if (lender.lenderName === "Bluestone Mortgages") {
          addLog(`❌ ${lender.tierName} rejected: LTV too high`);
        }
        return;
      }
      
      // Check minimum LTV (for products like Deposit Unlock that require high LTV)
      if (lender.minLTV && ltv < lender.minLTV) {
        matchScore = 0;
        rejectionReasons.push(`LTV ${ltv.toFixed(1)}% below min ${lender.minLTV}%`);
        
        // DEBUG: Log Bluestone rejections
        if (lender.lenderName === "Bluestone Mortgages") {
          addLog(`❌ ${lender.tierName} rejected: LTV too low (needs ${lender.minLTV}%+)`);
        }
        return;
      }

      // HARDCODED: Bluestone Deposit Unlock requires 90%+ LTV
      if (lender.lenderName === "Bluestone Mortgages" && 
          lender.tierName && lender.tierName.includes("Deposit Unlock") && 
          ltv < 90) {
        matchScore = 0;
        rejectionReasons.push(`Deposit Unlock requires 90%+ LTV (you have ${ltv.toFixed(1)}%)`);
        addLog(`❌ ${lender.tierName} rejected: Hardcoded LTV check - needs 90%+, client has ${ltv.toFixed(1)}%`);
        return;
      }

      if (lender.minLoan && loanAmount < lender.minLoan) {
        matchScore = 0;
        rejectionReasons.push(`Loan £${loanAmount.toLocaleString()} below min £${lender.minLoan.toLocaleString()}`);
        
        // DEBUG: Log Bluestone rejections
        if (lender.lenderName === "Bluestone Mortgages") {
          addLog(`❌ ${lender.tierName} rejected: Loan amount too low`);
        }
        return;
      }

      if (lender.maxLoan && loanAmount > lender.maxLoan) {
        matchScore = 0;
        rejectionReasons.push(`Loan £${loanAmount.toLocaleString()} exceeds max £${lender.maxLoan.toLocaleString()}`);
        
        // DEBUG: Log Bluestone rejections
        if (lender.lenderName === "Bluestone Mortgages") {
          addLog(`❌ ${lender.tierName} rejected: Loan amount too high`);
        }
        return;
      }

      // Check adverse credit criteria from tierCriteria (not adverseCredit)
      const criteria = lender.tierCriteria || {};
      
      // CCJs - using exact logic from working HTML
      if (ccjs.length > 0) {
        const ccjCriteria = criteria.ccjs || criteria.satisfiedCCJs || criteria.unsatisfiedCCJs || {};
        
        // First check: does lender accept CCJs at all?
        if (ccjCriteria.acceptsClients === false) {
          matchScore = 0;
          rejectionReasons.push(`Does not accept any CCJs (you have ${ccjs.length})`);
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Does not accept CCJs`);
          }
          return;
        }
        
        // West One: Check for satisfied CCJs with minBalance threshold
        // West One uses satisfiedCCJs.minBalance field (e.g., 500 means reject if any CCJ >= £500)
        if (lender.lenderName === "West One") {
          const satisfiedCCJsCriteria = criteria.satisfiedCCJs || {};
          const minBalance = satisfiedCCJsCriteria.minBalance || 0;
          
          if (minBalance > 0) {
            // Count how many CCJs are >= minBalance threshold
            const ccjsOverThreshold = ccjs.filter(ccj => {
              const amount = parseFloat(ccj.amount) || 0;
              return amount >= minBalance;
            });
            
            // If ANY CCJs are >= minBalance, check against maxInPeriod
            if (ccjsOverThreshold.length > 0) {
              const maxAllowed = satisfiedCCJsCriteria.maxInPeriod !== undefined ? satisfiedCCJsCriteria.maxInPeriod : 999;
              const periodMonths = satisfiedCCJsCriteria.periodMonths || 12;
              
              // Count CCJs >= minBalance within the lookback period
              const recentLargeCCJs = ccjsOverThreshold.filter(ccj => {
                if (!ccj.dateRegistered) return false;
                const ccjDate = new Date(ccj.dateRegistered);
                const monthsAgo = Math.floor((now - ccjDate) / (1000 * 60 * 60 * 24 * 30.44));
                return monthsAgo < periodMonths;
              });
              
              if (recentLargeCCJs.length > maxAllowed) {
                matchScore = 0;
                rejectionReasons.push(`Too many CCJs ≥£${minBalance}: ${recentLargeCCJs.length} in last ${periodMonths} months (max ${maxAllowed})`);
                
                // DEBUG: Log West One rejections
                addLog(`❌ ${lender.tierName} rejected: Has ${recentLargeCCJs.length} CCJs ≥£${minBalance} (max ${maxAllowed})`);
                return;
              }
            }
          }
        }
        
        // Count CCJs within the lookback period
        const recentCCJs = ccjs.filter(ccj => {
          if (!ccj.dateRegistered) return false;
          const ccjDate = new Date(ccj.dateRegistered);
          const monthsAgo = Math.floor((now - ccjDate) / (1000 * 60 * 60 * 24 * 30.44));
          return monthsAgo < (ccjCriteria.periodMonths || 12);
        });
        
        // Check if too many recent CCJs
        const maxAllowed = ccjCriteria.maxInPeriod !== undefined ? ccjCriteria.maxInPeriod : 999;
        if (recentCCJs.length > maxAllowed) {
          matchScore = 0;
          rejectionReasons.push(`Too many CCJs: ${recentCCJs.length} in last ${ccjCriteria.periodMonths} months (max ${maxAllowed})`);
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Too many CCJs (${recentCCJs.length}/${maxAllowed})`);
          }
          return;
        }
        
        // Score reduction for CCJs
        matchScore -= Math.min(20, ccjs.length * 5);
        matchReasons.push(`✓ Accepts CCJs (${ccjs.length} total, ${recentCCJs.length} recent)`);
      }

      // Defaults - using exact logic from working HTML  
      if (defaults.length > 0) {
        const defaultCriteria = criteria.defaults || {};
        
        // Filter out utility/telecom defaults based on lender-specific rules
        let defaultsToCount = [...defaults];
        
        // Bluestone: ignores utility/telecom defaults under £500
        if (lender.lenderName === "Bluestone Mortgages") {
          defaultsToCount = defaults.filter(def => {
            const isUtilityTelecom = def.type && (
              def.type.toLowerCase().includes('utilit') || 
              def.type.toLowerCase().includes('telecom') ||
              def.type.toLowerCase().includes('communications')
            );
            const amount = parseFloat(def.amount) || 0;
            // Keep this default if it's NOT utility/telecom OR if it's £500 or more
            return !isUtilityTelecom || amount >= 500;
          });
          
          // DEBUG: Log what Bluestone is filtering
          if (lender.tierName === "AAA") {
            addLog(`🔍 Bluestone AAA Default Filtering:`, {
              totalDefaults: defaults.length,
              afterFiltering: defaultsToCount.length,
              filtered: defaults.map(d => ({
                type: d.type,
                amount: d.amount,
                kept: defaultsToCount.includes(d)
              }))
            });
          }
        }
        
        // TML: ignores ALL utility defaults regardless of amount
        if (lender.lenderName === "The Mortgage Lender") {
          defaultsToCount = defaults.filter(def => {
            const isUtility = def.type && def.type.toLowerCase().includes('utilit');
            return !isUtility;
          });
        }
        
        // West One: Check for satisfied defaults with minBalance threshold
        // West One uses satisfiedDefaults.minBalance field (e.g., 500 means reject if any default >= £500)
        if (lender.lenderName === "West One") {
          const satisfiedDefaultsCriteria = criteria.satisfiedDefaults || {};
          const minBalance = satisfiedDefaultsCriteria.minBalance || 0;
          
          if (minBalance > 0) {
            // Count how many defaults are >= minBalance threshold
            const defaultsOverThreshold = defaults.filter(def => {
              const amount = parseFloat(def.amount) || 0;
              return amount >= minBalance;
            });
            
            // If ANY defaults are >= minBalance, check against maxInPeriod
            if (defaultsOverThreshold.length > 0) {
              const maxAllowed = satisfiedDefaultsCriteria.maxInPeriod !== undefined ? satisfiedDefaultsCriteria.maxInPeriod : 999;
              const periodMonths = satisfiedDefaultsCriteria.periodMonths || 12;
              
              // Count defaults >= minBalance within the lookback period
              const recentLargeDefaults = defaultsOverThreshold.filter(def => {
                if (!def.dateRegistered) return false;
                const defDate = new Date(def.dateRegistered);
                const monthsAgo = Math.floor((now - defDate) / (1000 * 60 * 60 * 24 * 30.44));
                return monthsAgo < periodMonths;
              });
              
              if (recentLargeDefaults.length > maxAllowed) {
                matchScore = 0;
                rejectionReasons.push(`Too many defaults ≥£${minBalance}: ${recentLargeDefaults.length} in last ${periodMonths} months (max ${maxAllowed})`);
                
                // DEBUG: Log West One rejections
                addLog(`❌ ${lender.tierName} rejected: Has ${recentLargeDefaults.length} defaults ≥£${minBalance} (max ${maxAllowed})`);
                return;
              }
            }
          }
        }
        
        // Count defaults within the lookback period (using filtered list)
        const recentDefaults = defaultsToCount.filter(def => {
          if (!def.dateRegistered) return false;
          const defDate = new Date(def.dateRegistered);
          const monthsAgo = Math.floor((now - defDate) / (1000 * 60 * 60 * 24 * 30.44));
          return monthsAgo < (defaultCriteria.periodMonths || 12);
        });
        
        // Check if too many recent defaults
        const maxAllowed = defaultCriteria.maxInPeriod !== undefined ? defaultCriteria.maxInPeriod : 999;
        if (recentDefaults.length > maxAllowed) {
          matchScore = 0;
          rejectionReasons.push(`Too many defaults: ${recentDefaults.length} in last ${defaultCriteria.periodMonths} months (max ${maxAllowed})`);
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Too many defaults (${recentDefaults.length}/${maxAllowed} in ${defaultCriteria.periodMonths} months)`);
          }
          return;
        }
        
        // Score reduction for defaults (based on filtered count)
        matchScore -= Math.min(20, defaultsToCount.length * 5);
        const ignoredCount = defaults.length - defaultsToCount.length;
        if (ignoredCount > 0) {
          matchReasons.push(`✓ Accepts defaults (${defaultsToCount.length} count, ${ignoredCount} utility/telecom ignored)`);
        } else {
          matchReasons.push(`✓ Accepts defaults (${defaults.length} total, ${recentDefaults.length} recent)`);
        }
      }

      // Bankruptcy
      if (bankruptcyDate) {
        if (criteria.bankruptcyAccepted === false) {
          matchScore = 0;
          rejectionReasons.push('Does not accept bankruptcy');
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Does not accept bankruptcy`);
          }
          return;
        }
        
        if (criteria.bankruptcyMinMonths && monthsSinceBankruptcy < criteria.bankruptcyMinMonths) {
          matchScore = 0;
          rejectionReasons.push(`Bankruptcy too recent (needs ${criteria.bankruptcyMinMonths}+ months)`);
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Bankruptcy too recent`);
          }
          return;
        }
        
        matchScore -= 15;
        matchReasons.push(`✓ Accepts discharged bankruptcy (${monthsSinceBankruptcy} months ago)`);
      }

      // IVA
      if (ivaDate) {
        if (criteria.ivaAccepted === false) {
          matchScore = 0;
          rejectionReasons.push('Does not accept IVAs');
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Does not accept IVAs`);
          }
          return;
        }
        
        if (criteria.ivaMinMonths && monthsSinceIVA < criteria.ivaMinMonths) {
          matchScore = 0;
          rejectionReasons.push(`IVA too recent (needs ${criteria.ivaMinMonths}+ months)`);
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: IVA too recent`);
          }
          return;
        }
        
        matchScore -= 10;
        matchReasons.push(`✓ Accepts IVAs (${monthsSinceIVA} months ago)`);
      }

      // DMP
      if (dmpActive) {
        if (criteria.dmpAccepted === false) {
          matchScore = 0;
          rejectionReasons.push('Does not accept active DMPs');
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Does not accept active DMPs`);
          }
          return;
        }
        matchScore -= 10;
        matchReasons.push('✓ Accepts active DMPs');
      }

      // Payday loans
      if (paydayLoans > 0) {
        if (criteria.paydayLoansAccepted === false) {
          matchScore = 0;
          rejectionReasons.push('Does not accept payday loan history');
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Does not accept payday loans`);
          }
          return;
        }
        matchScore -= (paydayLoans * 3);
        matchReasons.push(`✓ Accepts payday loan history`);
      }

      // Employment adjustments
      if (employmentStatus === 'self_employed') {
        if (criteria.selfEmployedAccepted === false) {
          matchScore = 0;
          rejectionReasons.push('Does not accept self-employed');
          
          // DEBUG: Log Bluestone rejections
          if (lender.lenderName === "Bluestone Mortgages") {
            addLog(`❌ ${lender.tierName} rejected: Does not accept self-employed`);
          }
          return;
        }
        matchScore -= 5;
        matchReasons.push('✓ Accepts self-employed');
      }

      // Clean credit bonus
      if (ccjs.length === 0 && defaults.length === 0 && !bankruptcyDate && !ivaDate && missedPayments === 0) {
        matchScore = Math.min(100, matchScore + 10);
        matchReasons.push('✓ Clean credit profile bonus');
      }

      // Get estimated rate based on LTV and incentives
      let estimatedRate = 5.99; // Default rate
      let selectedProduct = null;
      
      if (lender.incentives && Array.isArray(lender.incentives)) {
        // Find best matching rate for client's LTV
        const eligibleIncentives = lender.incentives.filter(inc => {
          const maxLTV = inc.maxLTV || 95;
          return ltv <= maxLTV;
        });
        
        if (eligibleIncentives.length > 0) {
          // Sort by rate to find the best one
          eligibleIncentives.sort((a, b) => (a.rate || 999) - (b.rate || 999));
          selectedProduct = eligibleIncentives[0];
          estimatedRate = selectedProduct.rate || 5.99;
        }
      }

      // Add match if score > 0
      if (matchScore > 0) {
        // DEBUG: Log Bluestone matches
        if (lender.lenderName === "Bluestone Mortgages") {
          addLog(`✅ ${lender.tierName} MATCHED with score ${matchScore}%`);
        }
        
        matches.push({
          lenderName: lender.lenderName,
          tierName: lender.tierName || lender.productName || 'Standard',
          matchScore: Math.max(0, Math.min(100, matchScore)),
          estimatedRate: estimatedRate.toFixed(2),
          maxLTV: lender.maxLTV || 95,
          maxLoan: lender.maxLoan || 1000000,
          minLoan: lender.minLoan || 25000,
          matchReasons,
          rejectionReasons,
          fees: selectedProduct?.productFee || lender.fees || {},
          productTerm: selectedProduct?.term || '2yr',
          monthlyPayment: calculateMonthlyPayment(loanAmount, estimatedRate, mortgageTerm),
          productId: lender.id,
          criteria
        });
      } else {
        // DEBUG: Log all Bluestone rejections with reasons
        if (lender.lenderName === "Bluestone Mortgages") {
          console.log(`❌ ${lender.tierName} final rejection:`, rejectionReasons);
        }
      }
    });

    // Save debug log as downloadable file
    if (debugText.includes('Bluestone')) {
      const blob = new Blob([debugText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bluestone-debug-log.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    return matches;
  };

  const calculateMonthlyPayment = (loanAmount, rate, years = 25) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return loanAmount / numPayments;
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
            <div 
              className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"
              style={{
                animationDuration: '2s'
              }}
            ></div>
            <Brain className="absolute inset-0 m-auto text-blue-600" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Application</h2>
          <p className="text-gray-600 mb-4">Matching you with specialist lenders...</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${matchingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{matchingProgress}% Complete</p>
        </div>
      </div>
    );
  }

  const propertyValue = parseFloat(userData?.propertyValue) || 0;
  const depositAmount = parseFloat(userData?.depositAmount) || 0;
  const loanAmount = propertyValue - depositAmount;
  const ltv = propertyValue > 0 ? ((loanAmount / propertyValue) * 100) : 75;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Mortgage Matches</h1>
              <p className="text-gray-600 mt-1">
                Found {lenderMatches.length} specialist lenders for your profile
              </p>
            </div>
            <button
              onClick={() => loadAndMatchLenders()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh Matches
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {lenderMatches.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any lenders that match your current criteria.
                  This might be due to your credit profile or loan requirements.
                </p>
                <button
                  onClick={() => navigate('/factfind')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Update Your Application
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {lenderMatches.map((lender, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-sm transition-all cursor-pointer border-2
                      ${selectedLender === lender ? 
                        'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                    onClick={() => setSelectedLender(lender)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{lender.lenderName}</h3>
                          <p className="text-sm text-gray-600">{lender.tierName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <Star size={12} />
                              Best Match
                            </div>
                          )}
                          <div className={`px-3 py-1 rounded-full text-sm font-bold
                            ${lender.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                              lender.matchScore >= 75 ? 'bg-blue-100 text-blue-700' :
                              lender.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-orange-100 text-orange-700'}`}
                          >
                            {lender.matchScore}% Match
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Initial Rate</p>
                          <p className="text-lg font-bold text-green-600">{lender.estimatedRate}%</p>
                          <p className="text-xs text-gray-400">{lender.productTerm} fixed</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Monthly Payment</p>
                          <p className="text-lg font-bold text-gray-900">
                            £{lender.monthlyPayment.toFixed(0)}
                          </p>
                          <p className="text-xs text-gray-400">Over {userData?.mortgageTerm || 25} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Max LTV</p>
                          <p className="text-lg font-bold text-gray-900">{lender.maxLTV}%</p>
                          <p className="text-xs text-gray-400">
                            {ltv <= lender.maxLTV ? '✓ Eligible' : '✗ Over limit'}
                          </p>
                        </div>
                      </div>

                      {lender.matchReasons.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                          <p className="text-xs font-semibold text-green-700 mb-2">Why this lender matches:</p>
                          <div className="flex flex-wrap gap-2">
                            {lender.matchReasons.slice(0, 4).map((reason, idx) => (
                              <span key={idx} className="text-xs bg-white text-green-700 px-2 py-1 rounded border border-green-200">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          Request Full Details
                        </button>
                        <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Profile Summary */}
            {userData && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Profile Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Value</span>
                    <span className="font-semibold">£{(propertyValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-semibold">£{(depositAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employment</span>
                    <span className="font-semibold capitalize">{userData.employmentStatus?.replace('_', ' ') || 'Employed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income</span>
                    <span className="font-semibold">
                      £{(parseFloat(userData.basicSalary || 0) + parseFloat(userData.bonus || 0)).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Adverse Credit Summary */}
                  {(userData.ccjs?.length > 0 || userData.defaults?.length > 0) && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Adverse Credit:</p>
                        {userData.ccjs?.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">CCJs</span>
                            <span className="font-medium text-orange-600">{userData.ccjs.length}</span>
                          </div>
                        )}
                        {userData.defaults?.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Defaults</span>
                            <span className="font-medium text-orange-600">{userData.defaults.length}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => navigate('/factfind')}
                  className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Update Application
                </button>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded mt-0.5">
                    <CheckCircle className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Review Matches</p>
                    <p className="text-sm text-gray-600">Compare rates and terms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-100 rounded mt-0.5">
                    <Clock className="text-gray-400" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Book Consultation</p>
                    <p className="text-sm text-gray-600">Speak with our advisor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-100 rounded mt-0.5">
                    <FileText className="text-gray-400" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Submit Documents</p>
                    <p className="text-sm text-gray-600">Upload required paperwork</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <Brain className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">AI-Powered Matching</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our system analyzed your profile against our panel of specialist adverse credit lenders.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                    Book Free Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcingResults;
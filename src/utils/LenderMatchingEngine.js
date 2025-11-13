// Lender Matching Engine
// Takes client data from fact-find and matches against lender criteria

import lenderDatabase from '../lender-database.json';

/**
 * Main matching function - returns array of matched lenders with scores
 * @param {Object} clientData - The completed fact-find data
 * @returns {Array} - Array of matched lenders with match scores and details
 */
export const matchLenders = (clientData) => {
  const matches = [];
  
  // Calculate key metrics from client data
  const ltv = parseFloat(clientData.calculatedLTV) || 0;
  const loanAmount = parseFloat(clientData.loanAmount) || 0;
  const propertyValue = parseFloat(clientData.propertyValue) || 0;
  
  console.log('🎯 MATCHING LENDERS:', {
    ltv,
    loanAmount,
    propertyValue,
    fixedRatePeriod: clientData.fixedRatePeriod,
    ratePreference: clientData.ratePreference
  });
  
  // Process each lender
  lenderDatabase.lenders.forEach(lender => {
    console.log(`\n🏦 Checking: ${lender.lenderName}`);
    const matchResult = checkLenderMatch(lender, clientData, ltv, loanAmount, propertyValue);
    
    if (matchResult.matches) {
      console.log(`  ✅ ${lender.lenderName} MATCHED! Best rate: ${matchResult.bestRate}%`);
      matches.push({
        lenderName: lender.lenderName,
        lenderType: lender.lenderType,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons,
        excludeReasons: matchResult.excludeReasons,
        bestRate: matchResult.bestRate,
        bestTier: matchResult.bestTier,
        allMatchingTiers: matchResult.matchingTiers,
        maxLTV: matchResult.maxLTV,
        maxLoan: matchResult.maxLoan,
        specialFeatures: matchResult.specialFeatures,
        fees: lender.fees
      });
    } else {
      console.log(`  ❌ ${lender.lenderName} NO MATCH - Reasons:`, matchResult.excludeReasons);
    }
  });
  
  // Sort by best rate
  matches.sort((a, b) => a.bestRate - b.bestRate);
  
  return matches;
};

/**
 * Check if a specific lender matches client criteria
 */
const checkLenderMatch = (lender, client, ltv, loanAmount, propertyValue) => {
  const result = {
    matches: false,
    score: 0,
    reasons: [],
    excludeReasons: [],
    matchingTiers: [],
    bestRate: null,
    bestTier: null,
    maxLTV: 0,
    maxLoan: 0,
    specialFeatures: []
  };
  
  // Check each product tier
  lender.productTiers.forEach(tier => {
    const tierMatch = checkTierMatch(tier, lender, client, ltv, loanAmount, propertyValue);
    
    if (tierMatch.matches) {
      result.matchingTiers.push({
        tierName: tier.tierName,
        description: tier.description,
        rate: tierMatch.bestRate,
        maxLTV: tier.maxLTV,
        reasons: tierMatch.reasons
      });
      
      // Track best rate (skip null rates)
      if (tierMatch.bestRate !== null && (!result.bestRate || tierMatch.bestRate < result.bestRate)) {
        result.bestRate = tierMatch.bestRate;
        result.bestTier = tier.tierName;
      }
      
      // Track max LTV and loan
      if (tier.maxLTV > result.maxLTV) result.maxLTV = tier.maxLTV;
      if (tier.maxLoan && tier.maxLoan > result.maxLoan) result.maxLoan = tier.maxLoan;
    } else {
      result.excludeReasons.push(...tierMatch.excludeReasons);
    }
  });
  
  // If any tier matches, lender matches
  if (result.matchingTiers.length > 0) {
    result.matches = true;
    result.score = calculateMatchScore(result, client);
    result.reasons = extractCommonReasons(result.matchingTiers);
    result.specialFeatures = extractSpecialFeatures(lender, client);
  }
  
  return result;
};

/**
 * Check if a specific tier matches
 */
const checkTierMatch = (tier, lender, client, ltv, loanAmount, propertyValue) => {
  const result = {
    matches: true,
    excludeReasons: [],
    reasons: [],
    bestRate: null
  };
  
  // 1. Check LTV
  if (ltv > tier.maxLTV) {
    result.matches = false;
    result.excludeReasons.push(`LTV ${ltv.toFixed(1)}% exceeds maximum ${tier.maxLTV}%`);
  } else {
    result.reasons.push(`✓ LTV ${ltv.toFixed(1)}% within limit`);
  }
  
  // 2. Check loan amount
  if (tier.minLoan && loanAmount < tier.minLoan) {
    result.matches = false;
    result.excludeReasons.push(`Loan £${loanAmount.toLocaleString()} below minimum £${tier.minLoan.toLocaleString()}`);
  }
  
  if (tier.maxLoan && loanAmount > tier.maxLoan) {
    result.matches = false;
    result.excludeReasons.push(`Loan £${loanAmount.toLocaleString()} exceeds maximum £${tier.maxLoan.toLocaleString()}`);
  }
  
  // 3. Check property value
  const minPropertyValue = lender.propertyRequirements?.minimumValue;
  if (minPropertyValue && propertyValue < minPropertyValue) {
    result.matches = false;
    result.excludeReasons.push(`Property value £${propertyValue.toLocaleString()} below minimum £${minPropertyValue.toLocaleString()}`);
  }
  
  // 4. Check adverse credit
  const adverseCheck = checkAdverseCredit(lender, tier, client);
  if (!adverseCheck.passes) {
    result.matches = false;
    result.excludeReasons.push(...adverseCheck.reasons);
  } else {
    result.reasons.push(...adverseCheck.reasons);
  }
  
  // 5. Get best rate for this tier
  if (result.matches) {
    result.bestRate = getBestRateForLTV(tier.rates, ltv, client);
  }
  
  return result;
};

/**
 * Check adverse credit criteria
 */
const checkAdverseCredit = (lender, tier, client) => {
  const result = {
    passes: true,
    reasons: []
  };
  
  // Get the appropriate adverse credit criteria based on lender structure
  let criteria = null;
  const tierName = tier.tierName?.toLowerCase() || '';
  
  // Handle different lender structures
  if (lender.lenderName === 'Pepper Money') {
    // Pepper Money has time-based criteria in tier names
    criteria = getTierCriteriaFromName(tierName, lender.adverseCreditCriteria);
  } else if (lender.lenderName === 'Precise Mortgages') {
    // Precise has tier-specific criteria
    criteria = lender.adverseCreditCriteria[`tier${tier.tierName.match(/\d+/)?.[0] || '1'}`];
  } else if (lender.lenderName === 'Kent Reliance') {
    // Kent Reliance has range-specific criteria
    if (tierName.includes('flexibility with income')) {
      criteria = lender.adverseCreditCriteria.flexibilityWithIncomeMultiples;
    } else if (tierName.includes('extra flexibility')) {
      criteria = lender.adverseCreditCriteria.extraFlexibilityRange;
    } else if (tierName.includes('shared ownership')) {
      criteria = lender.adverseCreditCriteria.sharedOwnership;
    } else {
      criteria = lender.adverseCreditCriteria.coreResidentialRange;
    }
  } else {
    // Standard criteria structure
    criteria = lender.adverseCreditCriteria;
  }
  
  if (!criteria) return result;
  
  // Check CCJs
  if (client.hasCCJs === 'yes' && client.ccjs && client.ccjs.length > 0) {
    const ccjCheck = checkCCJs(criteria.ccjs, client.ccjs);
    if (!ccjCheck.passes) {
      result.passes = false;
      result.reasons.push(...ccjCheck.reasons);
    } else {
      result.reasons.push('✓ CCJs acceptable');
    }
  }
  
  // Check Defaults
  if (client.hasDefaults === 'yes' && client.defaults && client.defaults.length > 0) {
    const defaultCheck = checkDefaults(criteria.defaults, client.defaults);
    if (!defaultCheck.passes) {
      result.passes = false;
      result.reasons.push(...defaultCheck.reasons);
    } else {
      result.reasons.push('✓ Defaults acceptable');
    }
  }
  
  // Check Mortgage Arrears
  if (client.hasMortgageArrears === 'yes') {
    const arrearsCheck = checkMortgageArrears(criteria.mortgageArrears, client);
    if (!arrearsCheck.passes) {
      result.passes = false;
      result.reasons.push(...arrearsCheck.reasons);
    } else {
      result.reasons.push('✓ Mortgage arrears acceptable');
    }
  }
  
  // Check Debt Management Plans
  if (client.hasDebtManagement === 'yes') {
    const dmpCheck = checkDMP(criteria.debtManagementPlan || criteria.dmp, client);
    if (!dmpCheck.passes) {
      result.passes = false;
      result.reasons.push(...dmpCheck.reasons);
    } else {
      result.reasons.push('✓ DMP acceptable');
    }
  }
  
  // Check IVA
  if (client.hasIVA === 'yes') {
    const ivaCheck = checkIVA(criteria.iva, client);
    if (!ivaCheck.passes) {
      result.passes = false;
      result.reasons.push(...ivaCheck.reasons);
    } else {
      result.reasons.push('✓ IVA acceptable');
    }
  }
  
  // Check Bankruptcy
  if (client.hasBankruptcy === 'yes') {
    const bankruptcyCheck = checkBankruptcy(criteria.bankruptcy, client);
    if (!bankruptcyCheck.passes) {
      result.passes = false;
      result.reasons.push(...bankruptcyCheck.reasons);
    } else {
      result.reasons.push('✓ Bankruptcy acceptable');
    }
  }
  
  // Check Repossession
  if (client.hasRepossession === 'yes') {
    const repoCheck = checkRepossession(criteria.repossessions, client);
    if (!repoCheck.passes) {
      result.passes = false;
      result.reasons.push(...repoCheck.reasons);
    } else {
      result.reasons.push('✓ Repossession acceptable');
    }
  }
  
  return result;
};

/**
 * Check CCJ criteria
 */
const checkCCJs = (criteria, ccjs) => {
  if (!criteria || !ccjs) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  // Check if CCJs are allowed at all
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('CCJs not accepted by this lender');
    return result;
  }
  
  // Check number of CCJs
  if (criteria.maxNumber !== undefined && ccjs.length > criteria.maxNumber) {
    result.passes = false;
    result.reasons.push(`Too many CCJs: ${ccjs.length} (max ${criteria.maxNumber})`);
    return result;
  }
  
  // Check time periods and values
  const now = new Date();
  let recentCount = 0;
  let totalValue = 0;
  
  ccjs.forEach(ccj => {
    const ccjDate = new Date(ccj.date);
    const monthsAgo = monthsDifference(ccjDate, now);
    
    totalValue += parseFloat(ccj.amount) || 0;
    
    // Check if within restricted time period
    if (criteria.timePeriod) {
      // Handle if timePeriod is an object (like {80ltv: "...", 85ltv: "..."})
      let timePeriodString = criteria.timePeriod;
      if (typeof timePeriodString === 'object') {
        // Skip complex time period objects for now
        // Could be enhanced to check LTV-specific criteria
        return result;
      }
      
      if (typeof timePeriodString === 'string') {
        const matches = timePeriodString.match(/(\d+)\s+in\s+(\d+)\s+months/);
        if (matches) {
          const maxAllowed = parseInt(matches[1]);
          const withinMonths = parseInt(matches[2]);
          
          if (monthsAgo < withinMonths) {
            recentCount++;
            if (recentCount > maxAllowed) {
              result.passes = false;
              result.reasons.push(`Too many recent CCJs: ${recentCount} in ${withinMonths} months (max ${maxAllowed})`);
            }
          }
        }
      }
    }
    
    // Check if satisfied
    if (criteria.mustBeSatisfied && ccj.status !== 'satisfied') {
      result.passes = false;
      result.reasons.push('CCJ must be satisfied');
    }
  });
  
  // Check max value
  if (criteria.maxValue && totalValue > parseMaxValue(criteria.maxValue)) {
    result.passes = false;
    result.reasons.push(`CCJ value £${totalValue} exceeds limit`);
  }
  
  return result;
};

/**
 * Check defaults criteria
 */
const checkDefaults = (criteria, defaults) => {
  if (!criteria || !defaults) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  // Similar logic to CCJs
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('Defaults not accepted');
    return result;
  }
  
  if (criteria.maxNumber !== undefined && defaults.length > criteria.maxNumber) {
    result.passes = false;
    result.reasons.push(`Too many defaults: ${defaults.length} (max ${criteria.maxNumber})`);
  }
  
  return result;
};

/**
 * Check mortgage arrears
 */
const checkMortgageArrears = (criteria, client) => {
  if (!criteria) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('Mortgage arrears not accepted');
    return result;
  }
  
  // Check if currently in arrears
  if (client.currentlyInArrears === 'yes' && criteria.currentlyUpToDate) {
    result.passes = false;
    result.reasons.push('Must be currently up to date');
  }
  
  return result;
};

/**
 * Check DMP criteria
 */
const checkDMP = (criteria, client) => {
  if (!criteria) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('DMPs not accepted');
    return result;
  }
  
  // Check minimum months active
  if (criteria.minMonthsActive && client.debtManagementMonthsActive) {
    const monthsActive = parseInt(client.debtManagementMonthsActive);
    if (monthsActive < criteria.minMonthsActive) {
      result.passes = false;
      result.reasons.push(`DMP must be active for ${criteria.minMonthsActive} months (current: ${monthsActive})`);
    }
  }
  
  return result;
};

/**
 * Check IVA criteria
 */
const checkIVA = (criteria, client) => {
  if (!criteria) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('IVAs not accepted');
    return result;
  }
  
  // Check years since discharge
  if (criteria.minYearsSinceDischarge && client.ivaDischargeDate) {
    const yearsAgo = yearsSince(new Date(client.ivaDischargeDate));
    if (yearsAgo < criteria.minYearsSinceDischarge) {
      result.passes = false;
      result.reasons.push(`IVA must be discharged ${criteria.minYearsSinceDischarge} years ago (current: ${yearsAgo.toFixed(1)})`);
    }
  }
  
  return result;
};

/**
 * Check bankruptcy criteria
 */
const checkBankruptcy = (criteria, client) => {
  if (!criteria) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('Bankruptcy not accepted');
    return result;
  }
  
  // Check years since discharge
  if (criteria.minYearsSinceDischarge && client.bankruptcyDischargeDate) {
    const yearsAgo = yearsSince(new Date(client.bankruptcyDischargeDate));
    if (yearsAgo < criteria.minYearsSinceDischarge) {
      result.passes = false;
      result.reasons.push(`Bankruptcy must be discharged ${criteria.minYearsSinceDischarge} years ago (current: ${yearsAgo.toFixed(1)})`);
    }
  }
  
  return result;
};

/**
 * Check repossession criteria
 */
const checkRepossession = (criteria, client) => {
  if (!criteria) return { passes: true, reasons: [] };
  
  const result = { passes: true, reasons: [] };
  
  if (criteria.allowed === false) {
    result.passes = false;
    result.reasons.push('Repossessions not accepted');
    return result;
  }
  
  return result;
};

/**
 * Get best rate for client's LTV
 */
const getBestRateForLTV = (rates, ltv, client) => {
  if (!rates) {
    console.log('❌ No rates object');
    return null;
  }
  
  console.log('🔍 Getting rate for LTV:', ltv, 'Available rates:', Object.keys(rates));
  
  // Determine term preference - default to 5yr
  let term = client.fixedRatePeriod || client.ratePreference || '5yr';
  
  console.log('🔍 Using term:', term);
  
  // Handle different formats
  if (term.toLowerCase().includes('fixed') || term.toLowerCase().includes('variable')) {
    // If just says "fixed" or "variable", default to 5yr
    term = '5yr';
    console.log('  → Converted to:', term);
  } else if (!term.includes('yr')) {
    // Convert "5 year" to "5yr"
    term = term.replace(/\s+year.*/i, 'yr').replace(/^(\d+).*/, '$1yr');
    console.log('  → Converted to:', term);
  }
  
  // Find the lowest LTV band that covers the client's LTV
  let bestRate = null;
  let bestLTVBand = 999;
  
  Object.keys(rates).forEach(key => {
    console.log('  Checking rate key:', key);
    if (key.includes(term)) {
      const ltvMatch = key.match(/(\d+)ltv/);
      if (ltvMatch) {
        const bandLTV = parseInt(ltvMatch[1]);
        console.log('    Band LTV:', bandLTV, 'Client LTV:', ltv);
        
        // This band covers the client if band >= client LTV
        if (bandLTV >= ltv && bandLTV < bestLTVBand) {
          bestLTVBand = bandLTV;
          bestRate = rates[key];
          console.log('    ✅ BEST SO FAR:', bestRate, 'at', bandLTV + '%');
        }
      }
    }
  });
  
  console.log('📊 Final best rate:', bestRate);
  return bestRate;
};

/**
 * Calculate match score (0-100)
 */
const calculateMatchScore = (matchResult, client) => {
  let score = 50; // Base score
  
  // Better rate = higher score
  if (matchResult.bestRate) {
    score += (10 - matchResult.bestRate) * 2; // Lower rates get higher scores
  }
  
  // More matching tiers = higher score
  score += matchResult.matchingTiers.length * 5;
  
  // Higher max LTV = higher score
  score += (matchResult.maxLTV - 75) / 5;
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Extract special features relevant to client
 */
const extractSpecialFeatures = (lender, client) => {
  const features = [];
  
  if (lender.specialFeatures) {
    // Check for Right to Buy
    if (client.propertyPurpose === 'rightToBuy' && lender.specialFeatures.rightToBuy?.available) {
      features.push('Right to Buy available');
    }
    
    // Check for Help to Buy
    if (client.propertyPurpose === 'helpToBuy' && lender.specialFeatures.helpToBuy) {
      features.push('Help to Buy available');
    }
    
    // Check for green features
    if (lender.specialFeatures.greenMortgage || lender.specialFeatures.epcDiscount) {
      features.push('Green mortgage incentives');
    }
    
    // Check for debt consolidation
    if (lender.specialFeatures.debtConsolidation?.allowed) {
      features.push('Debt consolidation available');
    }
  }
  
  return features;
};

/**
 * Helper functions
 */
const monthsDifference = (date1, date2) => {
  return (date2.getFullYear() - date1.getFullYear()) * 12 + 
         (date2.getMonth() - date1.getMonth());
};

const yearsSince = (date) => {
  const now = new Date();
  return (now - date) / (365.25 * 24 * 60 * 60 * 1000);
};

const parseMaxValue = (valueString) => {
  // Handle non-string values
  if (!valueString) return Infinity;
  if (typeof valueString === 'number') return valueString;
  if (typeof valueString !== 'string') return Infinity;
  
  const match = valueString.match(/£?([\d,]+)/);
  return match ? parseFloat(match[1].replace(/,/g, '')) : Infinity;
};

const getTierCriteriaFromName = (tierName, criteria) => {
  // Helper to extract criteria based on tier naming
  // For Pepper Money's time-based tiers
  return criteria; // Simplified for now
};

const extractCommonReasons = (tiers) => {
  // Extract reasons that appear in all matching tiers
  if (tiers.length === 0) return [];
  
  const allReasons = tiers.flatMap(t => t.reasons);
  return [...new Set(allReasons)].slice(0, 5); // Top 5 unique reasons
};

export default matchLenders;
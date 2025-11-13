# Credit Improvement Roadmap Feature

## Overview
The Credit Improvement Roadmap is a unique feature that shows clients how their mortgage rates will improve as their adverse credit ages, providing a clear timeline and motivation for credit repair. This document covers the feature concept, implementation approach, regulatory considerations, and technical details.

---

## Feature Concept

### What It Does

The roadmap shows clients:
1. **Current situation:** Products they qualify for now with current rates
2. **Future opportunities:** Better products/rates they'll qualify for as time passes
3. **Timeline:** Specific dates when they'll reach each milestone
4. **Rate improvements:** Concrete savings at each stage
5. **Actions needed:** Steps to ensure improvement (e.g., satisfying CCJs)

### Example Scenario

**Client Profile:**
- 2 CCJs totaling £1,500
- Most recent CCJ: June 2023 (18 months ago)
- CCJs satisfied: Yes
- Current matches: Pepper Money Tier C products @ 6.2%

**Roadmap Shows:**
```
┌─────────────────────────────────────────────────────────┐
│ Your Credit Improvement Timeline                        │
├─────────────────────────────────────────────────────────┤
│ TODAY (Nov 2024)                                        │
│ ✓ Current best rate: 6.20% (Pepper C)                  │
│   Monthly payment: £1,450                               │
│                                                         │
│ JUNE 2026 (18 months)                                   │
│ ⟹ CCJs will be 36 months old                           │
│ ⟹ Qualify for: Pepper B @ 5.65%                        │
│   Monthly payment: £1,385 (save £65/month)             │
│   You save: £1,170 over 18 months                      │
│                                                         │
│ JUNE 2027 (30 months)                                   │
│ ⟹ CCJs will be 48 months old                           │
│ ⟹ Qualify for: Pepper AA @ 4.89%                       │
│   Monthly payment: £1,298 (save £152/month)            │
│   You save: £2,736 over next year                      │
│                                                         │
│ JUNE 2029 (60 months)                                   │
│ ⟹ CCJs will be 72 months old (6 years)                 │
│ ⟹ Qualify for: Mainstream lenders @ 4.2%               │
│   Monthly payment: £1,235 (save £215/month)            │
│   You save: £2,580 over next year                      │
└─────────────────────────────────────────────────────────┘
```

### Value Propositions

**For Clients:**
- Clear understanding of credit improvement path
- Motivation to maintain good financial behavior
- Concrete timelines and savings targets
- Transparency about why certain rates apply
- Hope and control over financial future

**For Platform:**
- Unique competitive differentiator
- Re-engagement mechanism (clients return at milestones)
- Educational content builds trust
- Demonstrates sophistication to lenders
- Positions platform as long-term partner

**For Lenders:**
- Shows platform understands their criteria deeply
- Educated clients more likely to complete applications
- Reduces wasted time on unqualified applications
- Demonstrates platform's commitment to responsible lending

---

## Technical Implementation

### Data Requirements

**From Client:**
- All adverse credit types, counts, values, dates
- Current property requirements (LTV, loan amount)
- Income and employment status
- Age (for age-related criteria)

**From Product Database:**
- Current products and criteria
- All product tiers from each lender
- Rate cards with date-based criteria (monthsSinceMostRecent)
- Future products (if lenders provide forward guidance)

### Algorithm Overview

```javascript
function generateCreditRoadmap(client) {
  // 1. Identify current matches
  const currentMatches = runMatchingEngine(client, today);
  const currentBestRate = Math.min(...currentMatches.map(p => p.rate));
  
  // 2. Simulate future dates (check every 6 months for next 6 years)
  const milestones = [];
  for (let monthsAhead = 6; monthsAhead <= 72; monthsAhead += 6) {
    const futureDate = addMonths(today, monthsAhead);
    
    // Age the adverse credit
    const futureClient = {
      ...client,
      ccjDate: client.ccjDate, // Date doesn't change
      defaultDate: client.defaultDate, // Date doesn't change
      // But calculations will use futureDate as "today"
    };
    
    // 3. Run matching with future date context
    const futureMatches = runMatchingEngine(futureClient, futureDate);
    const futureBestRate = Math.min(...futureMatches.map(p => p.rate));
    
    // 4. If rate improves, add milestone
    if (futureBestRate < currentBestRate) {
      milestones.push({
        date: futureDate,
        monthsFromNow: monthsAhead,
        bestProduct: futureMatches[0],
        rateImprovement: currentBestRate - futureBestRate,
        monthlySavings: calculateMonthlySavings(
          client.loanAmount, 
          currentBestRate, 
          futureBestRate
        ),
        qualificationReason: explainQualification(client, futureMatches[0])
      });
    }
  }
  
  return {
    current: {
      bestRate: currentBestRate,
      bestProduct: currentMatches[0],
      allMatches: currentMatches
    },
    roadmap: milestones
  };
}
```

### Date Calculation Adjustment

The matching engine must accept a reference date parameter:

```javascript
function runMatchingEngine(client, referenceDate = new Date()) {
  // When calculating "months since CCJ":
  const monthsSinceCCJ = calculateMonthsBetween(
    client.ccjDate, 
    referenceDate  // Use this instead of new Date()
  );
  
  // Compare against product criteria as normal
  if (monthsSinceCCJ >= product.adverseCriteria.ccjs.monthsSinceMostRecent) {
    // Client qualifies
  }
}
```

### Milestone Explanation Generation

For each milestone, explain why the client now qualifies:

```javascript
function explainQualification(client, product) {
  const reasons = [];
  
  if (client.hasCCJs) {
    const monthsElapsed = calculateMonthsBetween(client.ccjDate, product.futureDate);
    reasons.push(
      `Your CCJs will be ${monthsElapsed} months old ` +
      `(${product.adverseCriteria.ccjs.monthsSinceMostRecent} months required)`
    );
  }
  
  if (client.hasDefaults) {
    const monthsElapsed = calculateMonthsBetween(client.defaultDate, product.futureDate);
    reasons.push(
      `Your defaults will be ${monthsElapsed} months old ` +
      `(${product.adverseCriteria.defaults.monthsSinceMostRecent} months required)`
    );
  }
  
  return reasons.join(' and ');
}
```

### Savings Calculation

```javascript
function calculateMonthlySavings(loanAmount, currentRate, futureRate, termYears = 25) {
  const monthlyRate1 = currentRate / 12;
  const monthlyRate2 = futureRate / 12;
  const numPayments = termYears * 12;
  
  const currentPayment = loanAmount * 
    (monthlyRate1 * Math.pow(1 + monthlyRate1, numPayments)) /
    (Math.pow(1 + monthlyRate1, numPayments) - 1);
  
  const futurePayment = loanAmount *
    (monthlyRate2 * Math.pow(1 + monthlyRate2, numPayments)) /
    (Math.pow(1 + monthlyRate2, numPayments) - 1);
  
  return currentPayment - futurePayment;
}
```

---

## User Interface Design

### Roadmap Display

**Visual Timeline:**
- Horizontal timeline with milestone markers
- Current position clearly marked
- Color-coded stages (red → amber → green as rates improve)
- Interactive: click milestone for details

**Milestone Cards:**
```
┌──────────────────────────────────────┐
│ 🎯 June 2026 (18 months)             │
├──────────────────────────────────────┤
│ Your CCJs will be 36 months old      │
│                                      │
│ NEW RATE: 5.65% (was 6.20%)         │
│ ↓ Save £65 per month                │
│                                      │
│ New options available:               │
│ • Pepper Money B                     │
│ • West One Tier 3                    │
│                                      │
│ Total saved by then: £1,170          │
│                                      │
│ [Remind me] [View products]          │
└──────────────────────────────────────┘
```

**Summary Statistics:**
- Total potential savings over 6 years
- Number of rate improvement opportunities
- Fastest path to mainstream rates
- Recommended actions to maximize improvement

### Mobile Considerations

- Vertical timeline on mobile devices
- Swipeable milestone cards
- Simplified charts and graphics
- Progressive disclosure (summary → details)

---

## Regulatory Considerations

### Key Concerns

1. **Not Financial Advice**
   - Must be clearly labeled as "illustrative scenario"
   - Cannot be personalized financial advice unless client is formally advised
   - Must include disclaimers about rate changes, circumstances, etc.

2. **Rate Accuracy**
   - Rates shown are current rates, may change
   - Disclaimer: "Rates shown are for illustration and may change"
   - Cannot guarantee future rate availability

3. **Client Circumstances**
   - Assumes client's circumstances don't worsen
   - Must caveat that new adverse credit resets the timeline
   - Assumes current property requirements remain stable

4. **Responsible Lending**
   - Should not encourage waiting if client needs mortgage urgently
   - Must not discourage applications that are actually suitable now
   - Cannot be seen as delaying access to housing

### Required Disclaimers

**Primary Disclaimer (always visible):**
```
This roadmap is for illustration only and does not constitute 
financial advice. Rates shown are current rates and may change. 
Future qualification depends on maintaining your current financial 
situation and lender criteria remaining similar. This should not 
be used as the sole basis for delaying a mortgage application if 
you need one now.
```

**Additional Context:**
- "Speak with an adviser to discuss your specific circumstances"
- "Rates and criteria can change at any time"
- "This assumes no new adverse credit events"
- "Your personal situation may affect these projections"

### FCA Compliance Requirements

1. **Clear and Fair Communication**
   - Not misleading or deceptive
   - Doesn't overstate benefits
   - Includes material qualifications

2. **Treating Customers Fairly (TCF)**
   - Helps client make informed decisions
   - Doesn't create unrealistic expectations
   - Supports client's best interests

3. **Record Keeping**
   - Log when roadmaps are generated
   - Store disclaimers shown
   - Track if clients act on roadmap advice

### Legal Review Needed

Before launch, seek legal/compliance review on:
- All disclaimer wording
- Feature positioning and marketing
- Terms of service updates
- Client communications about the feature

---

## Lender Permission Strategy

### Why Permission Matters

1. **Rate Card Licensing**
   - Some lenders' materials are "for intermediaries only"
   - Displaying rates to clients may require permission
   - Want to respect lender relationships

2. **Criteria Accuracy**
   - Showing future scenarios depends on criteria staying similar
   - Lenders may object to projections based on current criteria
   - Want lenders' blessing for this use case

3. **Competitive Positioning**
   - This feature showcases lender flexibility
   - Some lenders may see this as positive marketing
   - Others may prefer not to be in timeline comparisons

### Permission Request Approach

**Initial Contact Template:**

```
Subject: GETMY.MORTGAGE Platform - Permission to Display Rate Improvement Timeline

Dear [Lender BDM],

I'm reaching out regarding GETMY.MORTGAGE, our adverse credit 
mortgage platform currently in development.

We're implementing a unique "Credit Improvement Roadmap" feature 
that shows clients how their rates improve as adverse credit ages. 
For example, showing that someone's rate could improve from 6.2% 
to 5.6% when their CCJs reach 36 months old.

This would display:
- Current rates for their situation
- Future rates as they qualify for better tiers
- Timeline to each improvement milestone
- Clear disclaimers about rates subject to change

This feature:
✓ Educates clients about credit repair
✓ Shows your lending criteria flexibility
✓ Motivates clients to maintain good finances
✓ Creates realistic expectations

However, since this displays your current rate information in a 
forward-looking context, I want to ensure you're comfortable with 
this use before launching the feature.

Questions:
1. Do you have concerns about displaying rates in this context?
2. Are there any specific disclaimers you'd want included?
3. Would you like to review the feature before we launch?

I'm happy to demonstrate the feature and discuss any concerns.

Best regards,
[Your name]
GETMY.MORTGAGE
FCA Registered Mortgage Intermediary
```

### Potential Lender Concerns and Responses

**Concern: "Rates might change, making timeline inaccurate"**
Response: "Absolutely - we include prominent disclaimers that rates shown are illustrative and subject to change. The feature helps clients understand the general principle of credit aging, not guarantee specific future rates."

**Concern: "Criteria might change"**
Response: "Agreed - we'll monitor criteria changes and update the system. The roadmap shows possibilities based on current criteria, with disclaimers. It's educational, not a commitment."

**Concern: "Might discourage immediate applications"**
Response: "We actually include messaging about speaking with an adviser if they need a mortgage now. The feature is for clients who have flexibility in timing, not those with urgent housing needs."

**Concern: "Don't want to be compared directly to competitors"**
Response: "The roadmap shows progression within your own product tiers, highlighting your flexibility. We can avoid direct rate comparisons between lenders if you prefer."

### Permission Tracking

Maintain record of lender permissions:

```javascript
lenderPermissions: {
  'pepper-money': {
    creditRoadmapApproved: true,
    dateApproved: '2024-11-15',
    contactPerson: 'John Smith',
    conditions: ['Include standard rate disclaimers'],
    reviewDate: '2025-11-15' // Annual review
  },
  'west-one': {
    creditRoadmapApproved: false,
    dateDeclined: '2024-11-20',
    reason: 'Prefer not to show forward projections',
    alternativeAgreed: 'Can show general improvement principles without specific rates'
  }
}
```

---

## Implementation Phases

### Phase 1: Core Algorithm (Months 1-2)
- Modify matching engine to accept reference date parameter
- Build roadmap generation algorithm
- Test with known client scenarios
- Validate savings calculations
- Create comprehensive test suite

**Deliverables:**
- Working roadmap generation function
- Test coverage >90%
- Documentation of algorithm logic

### Phase 2: UI/UX (Months 2-3)
- Design timeline visualization
- Build interactive milestone cards
- Create mobile-responsive layout
- Add disclaimer components
- Implement data visualization

**Deliverables:**
- Fully functional roadmap display
- Mobile and desktop versions
- Accessibility compliance (WCAG 2.1)

### Phase 3: Lender Permissions (Months 3-4)
- Contact all current lenders
- Request permissions
- Address concerns
- Modify feature based on feedback
- Update terms of service

**Deliverables:**
- Permission status for all lenders
- Any required feature modifications
- Updated legal documentation

### Phase 4: Beta Testing (Month 4)
- Internal testing with team
- Controlled testing with select clients
- Gather feedback
- Refine disclaimers and messaging
- Fix bugs and edge cases

**Deliverables:**
- Beta test report
- Refined feature based on feedback
- Final disclaimer wording

### Phase 5: Public Launch (Month 5)
- Deploy to production
- Monitor usage and feedback
- Track engagement metrics
- Iterate based on user behavior

**Deliverables:**
- Live feature
- Usage analytics dashboard
- User feedback collection system

---

## Success Metrics

### Engagement Metrics
- % of clients viewing roadmap
- Time spent on roadmap page
- % clicking on milestone details
- % setting reminders for milestones
- Return visits at milestone dates

### Business Metrics
- Re-engagement rate (clients returning at milestones)
- Conversion rate improvement
- Client satisfaction scores
- Differentiation in competitive analysis
- Lender feedback and partnership quality

### Educational Metrics
- Client understanding of credit improvement (survey)
- Reduced support queries about "why this rate?"
- Improved application quality (fewer unqualified apps)

---

## Risk Mitigation

### Technical Risks

**Risk: Algorithm produces incorrect projections**
- Mitigation: Extensive testing, peer review of calculations
- Fallback: Conservative disclaimers, "illustrative only" framing

**Risk: Performance issues with complex calculations**
- Mitigation: Cache results, optimize algorithm, use service workers
- Fallback: Generate roadmap server-side if needed

**Risk: Data synchronization issues**
- Mitigation: Validate data consistency, implement error handling
- Fallback: Display error message, offer manual adviser consultation

### Legal/Regulatory Risks

**Risk: Deemed to be providing financial advice**
- Mitigation: Clear disclaimers, legal review, position as educational
- Fallback: Require formal advice consultation before showing roadmap

**Risk: Misleading clients about future rates**
- Mitigation: Prominent disclaimers, caveats, realistic framing
- Fallback: Remove specific rates, show only tier progression

**Risk: FCA challenges feature as inappropriate**
- Mitigation: Pre-launch legal review, conservative implementation
- Fallback: Modify or remove feature based on regulator feedback

### Business Risks

**Risk: Lenders refuse permission**
- Mitigation: Early engagement, address concerns, offer modifications
- Fallback: Generic improvement advice without lender-specific rates

**Risk: Feature confuses rather than clarifies**
- Mitigation: User testing, clear design, progressive disclosure
- Fallback: Simplify to just next milestone, not full 6-year roadmap

**Risk: Clients delay urgently needed mortgages**
- Mitigation: Prominent messaging about consulting adviser
- Fallback: Only show roadmap after adviser consultation

---

## Future Enhancements

### Phase 2 Features

1. **Reminders and Notifications**
   - Email reminders approaching milestones
   - SMS notifications when rates improve
   - In-app notifications for relevant changes

2. **Action Items**
   - Checklist of actions to ensure improvement
   - Progress tracking (e.g., "CCJ satisfied? ✓")
   - Document collection for future applications

3. **What-If Scenarios**
   - "What if I satisfy my CCJs now vs in 6 months?"
   - "What if I increase my deposit to 20%?"
   - "What if I take on a new CCJ?"

4. **Comparison Tool**
   - "Apply now vs wait 12 months"
   - Total cost comparison over mortgage term
   - Break-even analysis

5. **Personalized Recommendations**
   - "Based on your timeline, we recommend..."
   - Prioritized action items
   - Custom credit improvement strategies

### Advanced Features

1. **Credit Score Integration**
   - Import credit report data
   - Show predicted score improvements
   - Link adverse events to credit score impact

2. **Market Rate Tracking**
   - Show how base rates affect roadmap
   - Historical rate trends
   - "Your roadmap has improved/worsened based on market"

3. **Multi-Factor Improvement**
   - Track income increases
   - Model deposit growth (savings plans)
   - LTV improvement over time

4. **AI-Powered Insights**
   - Predict optimal application timing
   - Personalized improvement strategies
   - Risk assessment for waiting vs applying now

---

## Related Documentation

- See `matching-engine-docs.md` for core algorithm details
- See `strategic-decisions.md` (SD-009) for decision rationale
- See `firebase-structure.md` for data requirements
- See compliance documentation for regulatory framework

---

## Appendix: Example Calculations

### Example 1: CCJ Aging Timeline

**Client:**
- 1 CCJ, £800, June 2023
- Currently: November 2024 (17 months old)
- Loan: £200,000 at 75% LTV

**Current Match:**
- Pepper Money Tier C: 6.2% (requires 12+ months since CCJ)

**Future Milestones:**

**January 2026 (31 months since CCJ):**
- Now qualifies for: Pepper Money Tier B (requires 30 months)
- New rate: 5.8%
- Monthly saving: £45
- Total saved by then: £630 (14 months × £45)

**June 2026 (36 months since CCJ):**
- Now qualifies for: Pepper Money Tier A (requires 36 months)
- New rate: 5.3%
- Monthly saving: £58 (vs current rate)
- Additional saving: £29 (vs Tier B)
- Total saved since Tier B: £145 (5 months × £29)

**June 2029 (72 months since CCJ):**
- Now qualifies for: Mainstream lenders (requires 6 years)
- New rate: 4.5%
- Monthly saving: £135 (vs current rate)
- Cumulative savings over journey: ~£8,000+

---

## Version History

**Version 1.0** (November 2024)
- Initial feature documentation
- Core algorithm defined
- Implementation phases planned
- Regulatory considerations documented
- Lender permission strategy outlined

**Planned Updates:**
- Implementation progress tracking
- Lender permission outcomes
- Beta test results
- Launch metrics
- Feature iterations based on feedback

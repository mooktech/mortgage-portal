# Strategic Decisions Log

## Overview
This document records major architectural, technical, and business decisions made during the development of GETMY.MORTGAGE. Each entry includes the decision, rationale, alternatives considered, and implications for future development.

---

## Decision Log

### SD-001: Firebase as Primary Database
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Use Firebase (Firestore) as the primary database for the platform.

**Rationale:**
- Real-time synchronization enables instant updates across devices
- Built-in authentication and security rules
- Scalability without infrastructure management
- Well-documented API and strong developer ecosystem
- Cost-effective for expected user volume
- Netlify hosting integrates seamlessly with Firebase

**Alternatives Considered:**
1. **PostgreSQL on AWS RDS**
   - Pros: Relational structure, SQL familiarity, robust for complex queries
   - Cons: Requires infrastructure management, less real-time capability, higher complexity
   
2. **MongoDB Atlas**
   - Pros: NoSQL flexibility, good scaling, familiar to many developers
   - Cons: Less integrated tooling, more manual security setup, cost comparable to Firebase

3. **Supabase**
   - Pros: PostgreSQL-based, real-time subscriptions, open-source
   - Cons: Newer platform, smaller ecosystem, less mature tooling

**Implications:**
- NoSQL document structure influences data modeling (see SD-002)
- Security rules must be carefully designed
- Real-time listeners enable live dashboard updates
- May need additional tools for complex analytical queries
- Future migration would require significant refactoring

**Trade-offs:**
- Gained: Development speed, real-time features, easier deployment
- Lost: Complex relational queries, full SQL flexibility

---

### SD-002: Lenders/Products Subcollection Structure
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Store products as subcollections under lender documents: `lenders/{lenderId}/products/{productId}`

**Rationale:**
- Logical organization mirrors business structure
- Easy to query all products for a specific lender
- Simpler to manage lender-level metadata
- Product additions/updates don't affect other lenders
- Security rules can be applied at lender level

**Alternatives Considered:**
1. **Flat products collection with lender reference**
   ```
   products/{productId}
     lenderId: "pepper-money"
   ```
   - Pros: Easier to query across all products
   - Cons: Less organized, harder to manage per-lender updates

2. **Embedded products in lender documents**
   ```
   lenders/{lenderId}
     products: [array of product objects]
   ```
   - Pros: Single document read for all lender products
   - Cons: Document size limits, harder to update individual products, poor performance

**Implications:**
- Matching engine must iterate through each lender's subcollection
- Cannot directly query products across all lenders (must use collection group)
- Adding new lender requires creating lender doc + subcollection
- Lender-specific product filters are simple and efficient

**Trade-offs:**
- Gained: Better organization, lender-scoped operations, cleaner data model
- Lost: Direct cross-lender product queries require collection group queries

---

### SD-003: Manual Product Import vs API Integration
**Date:** October 2024  
**Status:** Implemented (Manual), API integration planned

**Decision:**
Use manual import scripts to populate product database, with API integration as future enhancement.

**Rationale:**
- Most adverse credit lenders don't offer APIs
- Manual import gives full control over data quality
- Rate cards are stable (quarterly updates typical)
- Allows immediate platform development without API dependencies
- Can add API integrations incrementally as they become available

**Alternatives Considered:**
1. **Wait for API access before launching**
   - Pros: Automated updates, real-time rate changes
   - Cons: Significant delay to market, most lenders don't offer APIs
   
2. **Web scraping lender websites**
   - Pros: Automated data collection
   - Cons: Legal concerns, fragile to website changes, unreliable, poor data quality

**Implications:**
- 34 import scripts must be maintained (see import-scripts-inventory.md)
- Quarterly manual updates required
- Product data may be slightly behind lender changes
- Each import script must be thoroughly tested
- Future API integrations will supplement, not replace, manual imports

**Trade-offs:**
- Gained: Immediate launch capability, full data control, lender relationship building
- Lost: Real-time rate updates, some automation potential

---

### SD-004: Client-Side Matching Engine
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Run matching algorithm client-side in browser rather than server-side.

**Rationale:**
- Instant results without server round-trip
- Reduced Firebase function costs
- Simpler debugging in browser console
- Lower latency for better user experience
- Easier to add interactive filtering/sorting
- Product count (<100) makes client-side feasible

**Alternatives Considered:**
1. **Firebase Cloud Function matching**
   - Pros: Centralized logic, easier to update, keeps criteria secret
   - Cons: Higher latency, function costs, debugging harder, slower iteration
   
2. **Hybrid approach (pre-filter server, match client)**
   - Pros: Balance of speed and security
   - Cons: Added complexity, two codebases to maintain

**Implications:**
- Matching logic is visible in browser (criteria not truly secret)
- Must ensure consistent matching across different browsers
- Large product databases would require rethinking this approach
- Client must download all product data (privacy/security consideration)
- Faster feature development and testing

**Trade-offs:**
- Gained: Speed, lower costs, simpler debugging, better UX
- Lost: Complete criteria privacy, centralized control, ability to handle massive product databases

**Future Consideration:**
If product database grows to 500+ products, may need to reconsider server-side matching for performance.

---

### SD-005: Detailed Adverse Credit Tracking
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Track comprehensive details for each adverse credit type (count, value, date, satisfied status) rather than simple yes/no flags.

**Rationale:**
- Enables accurate matching against complex lender criteria
- Supports "credit improvement roadmap" feature (see SD-009)
- Provides data for future analytics and insights
- Mirrors how brokers assess clients in real world
- Allows for "near miss" matching and recommendations

**Alternatives Considered:**
1. **Simple boolean flags only**
   ```
   hasCCJs: true
   hasDefaults: true
   ```
   - Pros: Simpler data collection, faster fact-find
   - Cons: Can't match against specific criteria, no improvement roadmap

2. **Free-text description**
   - Pros: Flexible, captures nuance
   - Cons: Cannot algorithmically match, inconsistent data, hard to analyze

**Implications:**
- Longer fact-find form (11 steps)
- More complex data validation required
- More sophisticated matching algorithm
- Enables advanced features like improvement roadmap
- Better data for lender negotiations

**Trade-offs:**
- Gained: Precise matching, future feature capabilities, better client insights
- Lost: Form simplicity, faster fact-find completion

---

### SD-006: Tier-Based Product Organization
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Organize products by tier (AAA, AA, A, B, C, D, or Tier 1-9) rather than by rate or single product category.

**Rationale:**
- Matches how lenders actually structure their offerings
- Makes import scripts logical and maintainable
- Easier to explain product progression to clients
- Simplifies rate card updates (tiers are stable)
- Natural fit for credit improvement roadmap feature

**Alternatives Considered:**
1. **Rate-based organization (low to high)**
   - Pros: Client-focused view
   - Cons: Doesn't match lender structure, unstable as rates change
   
2. **Single product list per lender**
   - Pros: Simpler structure
   - Cons: Loses tier context, harder to explain, no clear progression

**Implications:**
- Import scripts named by tier (import-pepper-AAA.js, etc.)
- Product display can show tier progression
- Credit improvement can map tier changes over time
- Lender conversations use familiar tier language

**Trade-offs:**
- Gained: Alignment with industry structure, stable organization, improvement roadmap foundation
- Lost: Some client-facing simplicity

---

### SD-007: No Product Fees in Matching Algorithm
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Match products based on rate and criteria, but don't exclude products based on fees. Display fees for client consideration.

**Rationale:**
- Fees vary widely and are often negotiable
- Some clients prefer high fee/low rate, others prefer low fee/higher rate
- Excluding high-fee products removes valid options
- Total cost depends on loan amount and term (not just rate + fee)
- Advisers should explain fee trade-offs, not algorithm

**Alternatives Considered:**
1. **Calculate total cost, match on cost ranking**
   - Pros: Shows "true" cheapest option
   - Cons: Assumes specific loan term, ignores client preferences, overfitting
   
2. **Fee threshold (e.g., exclude fees >£3000)**
   - Pros: Removes "extreme" products
   - Cons: Arbitrary threshold, removes valid options, not flexible

**Implications:**
- All fee structures must be clearly displayed
- Need good UI to compare rate vs fee trade-offs
- Advisers should guide fee decisions during consultation
- Clients see full range of options

**Trade-offs:**
- Gained: Complete options, client choice, flexibility
- Lost: Simplicity of "cheapest" ranking, some clients may be overwhelmed

---

### SD-008: Netlify Hosting
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Deploy platform on Netlify rather than traditional hosting or cloud providers.

**Rationale:**
- Excellent integration with Firebase
- Built-in CDN for fast global delivery
- Simple deployment from git repository
- Generous free tier for development
- Automatic HTTPS and custom domains
- Serverless functions for any needed backend logic

**Alternatives Considered:**
1. **Vercel**
   - Pros: Similar features, good DX
   - Cons: Comparable pricing, less Firebase integration
   
2. **AWS (S3 + CloudFront)**
   - Pros: Maximum flexibility, enterprise-grade
   - Cons: Complex setup, higher management overhead, steeper learning curve

3. **Traditional hosting (Bluehost, etc.)**
   - Pros: Familiar to many
   - Cons: Slower, less modern tooling, manual deployment

**Implications:**
- Deployment via git push is simple
- Environment variables managed through Netlify dashboard
- No server management required
- Scales automatically with traffic
- May need Netlify functions for future backend needs

**Trade-offs:**
- Gained: Development speed, automatic scaling, simple deployment, great DX
- Lost: Some low-level control, vendor lock-in

---

### SD-009: Credit Improvement Roadmap Feature
**Date:** October 2024  
**Status:** Planned (documented in credit-improvement-roadmap.md)

**Decision:**
Build feature showing how client's rates improve as adverse credit ages, creating clear timeline to better products.

**Rationale:**
- Unique value proposition vs competitors
- Educates clients about credit repair
- Creates return engagement (come back in 6/12/24 months)
- Builds trust through transparency
- Motivates clients to wait for better rates if appropriate
- Demonstrates platform sophistication to lenders

**Alternatives Considered:**
1. **Static credit improvement advice**
   - Pros: Simpler to implement
   - Cons: Generic, not personalized, no concrete timeline
   
2. **External link to credit advice sites**
   - Pros: No development needed
   - Cons: Sends clients away, generic advice, no unique value

**Implications:**
- Requires tracking how each lender's criteria change with time
- Need UI to visualize improvement timeline
- Must regularly update as lender criteria change
- Potential regulatory considerations (see credit-improvement-roadmap.md)
- May require lender permission to display future rates

**Trade-offs:**
- Gained: Unique competitive advantage, client education, re-engagement mechanism
- Lost: Additional development time, ongoing maintenance burden, regulatory complexity

**Status Update:**
Feature documented and planned. Implementation pending completion of core platform and lender permission discussions.

---

### SD-010: FCA Compliance Priority
**Date:** October 2024  
**Status:** Ongoing

**Decision:**
Prioritize FCA compliance and responsible lending over rapid feature deployment.

**Rationale:**
- Legal requirement as FCA-registered intermediary
- Protects clients from unsuitable borrowing
- Builds trust with lenders
- Essential for long-term business viability
- Reduces liability risk
- Demonstrates professionalism to potential partners/investors

**Implications:**
- All features must consider regulatory impact
- May need legal review before launch
- Some features may be delayed or modified for compliance
- Need clear terms of service and disclosures
- Ongoing training on regulatory changes required

**Examples:**
- Credit improvement roadmap needs careful framing (not advice)
- Product descriptions must be clear and not misleading
- Cannot display products client doesn't qualify for without clear explanation
- Must maintain accurate records of advice given

**Trade-offs:**
- Gained: Legal compliance, client protection, lender confidence, reduced risk
- Lost: Some development speed, some creative freedom

---

### SD-011: Nationwide API Integration Path
**Date:** October 2024  
**Status:** Accepted into program, integration pending

**Decision:**
Pursue integration with Nationwide Building Society's Mortgage API Developer Program.

**Rationale:**
- First API integration opportunity
- Nationwide is reputable mainstream lender
- API access enables real-time rate updates
- Demonstrates technical capability to other lenders
- Potential to differentiate from manual-only platforms
- Could enable automated application submission in future

**Implications:**
- Need to maintain two data sources (manual + API)
- API integration requires ongoing maintenance
- Different data formats may require normalization
- Must handle API downtime gracefully
- Sets precedent for future API integrations

**Trade-offs:**
- Gained: Automated updates, technical credibility, partnership opportunity
- Lost: Additional complexity, API dependency, maintenance burden

**Next Steps:**
- Complete Nationwide API onboarding
- Build API integration layer
- Test data normalization
- Deploy to staging environment
- Monitor for issues before production

---

### SD-012: Focus on Adverse Credit First
**Date:** October 2024  
**Status:** Implemented

**Decision:**
Launch with adverse credit focus rather than attempting to be comprehensive mortgage platform from day one.

**Rationale:**
- Adverse credit is underserved market
- Less competition in specialist lending space
- Higher margins for brokers
- Clearer value proposition to clients
- More complex criteria = bigger moat
- Easier to scale expertise in one area first
- Founder has specialist knowledge in this area

**Alternatives Considered:**
1. **Full-spectrum mortgage platform**
   - Pros: Larger market, more clients
   - Cons: Extreme competition, lower margins, harder to differentiate
   
2. **Buy-to-let specialist**
   - Pros: Growing market, good margins
   - Cons: Different expertise needed, more complex, smaller than adverse credit

3. **First-time buyer focus**
   - Pros: Large market, good intentions
   - Cons: Low margins, price competition, no clear differentiation

**Implications:**
- Product database focused on adverse credit lenders
- Fact-find emphasizes adverse credit details
- Marketing targets clients with credit issues
- Can add other markets later from position of strength
- Lender relationships built around adverse credit expertise

**Trade-offs:**
- Gained: Clear positioning, less competition, expertise depth, higher margins
- Lost: Some market size, some potential clients, some platform flexibility

**Future Expansion:**
Once adverse credit platform is stable, consider:
- Adding mainstream lenders for clean credit profiles
- Buy-to-let expansion
- Bridging finance
- Commercial mortgages

---

## Decision Categories

### Technical Decisions
- SD-001: Firebase as Primary Database
- SD-002: Lenders/Products Subcollection Structure
- SD-003: Manual Product Import vs API Integration
- SD-004: Client-Side Matching Engine
- SD-008: Netlify Hosting

### Product Decisions
- SD-005: Detailed Adverse Credit Tracking
- SD-006: Tier-Based Product Organization
- SD-007: No Product Fees in Matching Algorithm
- SD-009: Credit Improvement Roadmap Feature

### Business Decisions
- SD-010: FCA Compliance Priority
- SD-011: Nationwide API Integration Path
- SD-012: Focus on Adverse Credit First

---

## Decision-Making Framework

When making future strategic decisions, consider:

1. **Client Impact**
   - How does this benefit clients?
   - What problems does it solve?
   - Is it better than alternatives?

2. **Technical Feasibility**
   - Can we build this with current tech stack?
   - What's the complexity vs benefit ratio?
   - How maintainable will it be?

3. **Regulatory Compliance**
   - Does this comply with FCA requirements?
   - Are there any legal risks?
   - Do we need legal review?

4. **Business Viability**
   - Does this support business goals?
   - What's the cost vs expected return?
   - Does it strengthen competitive position?

5. **Scalability**
   - Will this work with 10x growth?
   - What are the bottlenecks?
   - Can we iterate on this later?

---

## Lessons Learned

### What Worked Well

1. **Detailed Planning**
   - Taking time to document structure before building saved significant refactoring

2. **Incremental Approach**
   - Starting with 4 lenders before attempting all 20+ was wise
   - Learned patterns that inform future additions

3. **Testing with Real Data**
   - Using actual client profiles exposed edge cases early

4. **Lender-First Data Model**
   - Organizing around how lenders structure products simplified everything

### What We'd Do Differently

1. **Earlier Testing**
   - Should have created comprehensive test suite earlier
   - Some bugs found late could have been caught sooner

2. **More Upfront Documentation**
   - Some decisions were made implicitly and only documented later
   - This document should have existed from day one

3. **Standardized Import Process**
   - First few import scripts were inconsistent
   - Template/checklist would have helped

---

## Future Decision Areas

### Under Consideration

**Multi-Applicant Support**
- How to handle joint applications?
- Which applicant's adverse credit takes precedence?
- Lender-specific rules for joint applications?

**Application Submission Integration**
- Should platform submit applications directly to lenders?
- API integrations vs manual submission?
- How to handle lender-specific application forms?

**Remortgage vs Purchase**
- Current focus is purchase, should we add remortgage?
- Different criteria for existing vs new mortgages?
- Additional data needed from clients?

**Pricing Model**
- Procuration fees from lenders only?
- Client fees for advisory services?
- Premium features subscription model?

**Geographic Expansion**
- UK-only initially, but international opportunity?
- Scotland/Northern Ireland have different regulations
- What's required for each region?

---

## Decision Review Schedule

This document should be reviewed:
- **Monthly:** Check if any decisions need updating
- **Quarterly:** Review lessons learned and adjust future decisions
- **Major milestones:** Before launching new features or markets
- **Problem incidents:** When issues arise, check if decision contributed

---

## Contributing to This Document

When adding new strategic decisions:

1. **Use next sequential SD-XXX number**
2. **Include all sections:** Decision, Rationale, Alternatives, Implications, Trade-offs
3. **Date the decision**
4. **Mark status:** Proposed, Implemented, Deprecated, Under Review
5. **Link related decisions**
6. **Update category index**

**Format:**
```
### SD-XXX: Decision Title
**Date:** YYYY-MM
**Status:** [Proposed|Implemented|Deprecated|Under Review]

**Decision:**
Clear statement of what was decided

**Rationale:**
Why this decision was made

**Alternatives Considered:**
What else was evaluated and why it wasn't chosen

**Implications:**
What this means for development, users, business

**Trade-offs:**
What we gained and what we gave up

**Related Decisions:** SD-YYY, SD-ZZZ
```

---

## Related Documentation

- See `firebase-structure.md` for implementation of database decisions
- See `matching-engine-docs.md` for implementation of matching logic decisions
- See `import-scripts-inventory.md` for implementation of data import decisions
- See `credit-improvement-roadmap.md` for detail on SD-009

---

## Version History

**Version 1.0** (November 2024)
- Initial documentation of 12 strategic decisions
- Established decision-making framework
- Created standard format for future decisions

**Future Updates:**
- Add new decisions as they're made
- Mark deprecated decisions when changed
- Update implications as learned through implementation

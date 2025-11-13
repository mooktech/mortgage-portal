# GETMY.MORTGAGE Platform Documentation

## Overview
This documentation suite provides comprehensive technical reference for the GETMY.MORTGAGE platform - an adverse credit mortgage matching engine and client portal system.

## Documentation Structure

### 1. Firebase Database Structure (`firebase-structure.md`)
Complete reference for the Firebase Firestore database schema, including:
- Client data structure
- Lender and product tier organization
- Criteria objects and field definitions
- Data relationships and indexing strategies

### 2. Import Scripts Inventory (`import-scripts-inventory.md`)
Catalog of all lender data import scripts:
- 34 product tier import scripts across 4 lenders
- Script naming conventions and organization
- Import workflow and dependencies
- Maintenance guidelines

### 3. Matching Engine Documentation (`matching-engine-docs.md`)
Detailed explanation of the mortgage matching algorithm:
- Core matching logic and criteria evaluation
- Field mappings between clients and products
- Special handling cases (West One balance thresholds, etc.)
- Debugging and troubleshooting guides

### 4. Strategic Decisions Log (`strategic-decisions.md`)
Historical record of architectural and design choices:
- Technology stack decisions
- Database structure rationale
- Feature implementation approaches
- Trade-offs and alternatives considered

### 5. Credit Improvement Roadmap Feature (`credit-improvement-roadmap.md`)
Documentation for the unique feature showing clients how their rates improve as adverse credit ages:
- Feature concept and value proposition
- Technical implementation approach
- Regulatory compliance considerations
- Display logic and calculations

### 6. Development Guidelines (`development-guidelines.md`)
Standards and practices for platform development:
- Code organization and naming conventions
- Firebase security rules and best practices
- Testing and debugging procedures
- Documentation maintenance protocols

## Quick Start

1. **New to the platform?** Start with `firebase-structure.md` to understand the data model
2. **Working with lenders?** Reference `import-scripts-inventory.md`
3. **Debugging matches?** Check `matching-engine-docs.md`
4. **Making architectural decisions?** Review `strategic-decisions.md` first
5. **Implementing features?** Follow `development-guidelines.md`

## Platform Context

**Platform:** GETMY.MORTGAGE  
**Focus:** Adverse credit mortgage marketplace  
**Status:** Development/Pre-launch  
**Tech Stack:** Firebase (Firestore, Functions), Netlify hosting  
**Regulatory:** FCA-registered mortgage intermediary  

**Current Lenders:**
- Pepper Money (9 product tiers)
- West One (9 product tiers)
- The Mortgage Lender (8 product tiers)
- Bluestone Mortgages (8 product tiers)

## Maintenance

This documentation should be updated whenever:
- New lenders or products are added
- Database schema changes are made
- Matching logic is modified
- Strategic decisions are made that affect future development

## Version Control

All documentation should be version controlled alongside the codebase. When updating docs, include:
- Date of change
- Reason for change
- Impact on other systems

## Contact

Platform Owner: Canny (CeMAP qualified, FCA-registered)  
Project: GETMY.MORTGAGE - Adverse Credit Mortgage Platform

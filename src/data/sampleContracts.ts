export interface SampleContract {
  id: string;
  title: string;
  category: string;
  description: string;
  text: string;
  comparisonVersion?: {
    label: string;
    text: string;
  };
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: "freelance-contractor",
    title: "Independent Contractor Agreement (High Risk)",
    category: "Employment & Freelance",
    description: "Contains severe unilateral indemnity, perpetual IP assignment of pre-existing work, and a strict nationwide non-compete.",
    text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Agreement is entered into as of October 1, 2026, by and between Apex Global Solutions Inc. ("Company") and Sneha Thumar ("Contractor").

1. SERVICES AND DELIVERABLES:
Contractor agrees to perform software development, prompt engineering, and GenAI pipeline architecture as directed by Company.

2. COMPENSATION AND PAYMENT TERMS:
Company shall pay Contractor at the rate of $65 per hour. Invoices shall be submitted monthly and paid Net 90 days following final written approval and satisfaction by Company. If Company deems any deliverable requires revision, Company may withhold all payments indefinitely without accrual of interest.

3. INTELLECTUAL PROPERTY & WORK FOR HIRE:
All work product, concepts, code, training datasets, algorithms, and derivative works created by Contractor—whether created during work hours or outside of work hours, and including any pre-existing software, frameworks, or open-source templates utilized—shall be deemed "Work Made for Hire" and shall irrevocably become the exclusive sole property of Company worldwide in perpetuity. Contractor waives all moral rights and future claims.

4. UNILATERAL INDEMNIFICATION & LIABILITY:
Contractor shall defend, indemnify, and hold harmless Company, its affiliates, directors, officers, and clients from and against ANY and ALL claims, losses, damages, liabilities, costs, and legal fees arising out of, related to, or allegedly resulting from Contractor's services, performance, or deliverables, regardless of whether caused by negligence of Company or third parties. Contractor's liability under this section shall be completely UNLIMITED. Company's total cumulative liability to Contractor for any cause whatsoever shall not exceed $100.

5. NON-COMPETE AND NON-SOLICITATION:
During the term of this Agreement and for a period of thirty-six (36) months thereafter, Contractor shall not directly or indirectly provide consulting, engineering, or advisory services to any business operating in artificial intelligence, software, or technology worldwide that Company deems competitive.

6. TERMINATION:
Company may terminate this Agreement immediately at any time for any reason or no reason upon 1 hour email notice. Contractor may only terminate upon sixty (60) days advance written notice and shall forfeit the final 2 months of pending compensation as liquidated transition damages.

7. GOVERNING LAW & DISPUTE RESOLUTION:
This Agreement shall be governed by the laws of the State of Delaware. Any dispute shall be resolved exclusively through binding confidential arbitration before a single arbitrator selected solely by Company, with all fees advanced by Contractor. Contractor expressly waives any right to jury trial or class action proceedings.`,
    comparisonVersion: {
      label: "Balanced / Counter-Offer Version",
      text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT (BALANCED REVISION)

This Agreement is entered into as of October 1, 2026, by and between Apex Global Solutions Inc. ("Company") and Sneha Thumar ("Contractor").

1. SERVICES AND DELIVERABLES:
Contractor agrees to perform software development, prompt engineering, and GenAI pipeline architecture as detailed in mutually agreed Statements of Work (SOW).

2. COMPENSATION AND PAYMENT TERMS:
Company shall pay Contractor at the agreed rate within Net 15 days of invoice date. Invoices not disputed in good faith within 10 business days shall be deemed approved. Overdue balances shall accrue interest at 1.5% per month.

3. INTELLECTUAL PROPERTY:
Company owns all custom deliverables created specifically for Company under this Agreement upon full receipt of payment. Contractor retains all right, title, and ownership in Contractor's pre-existing tools, libraries, methodologies, and general prompt engineering techniques ("Pre-existing IP"), granting Company a non-exclusive license to use such Pre-existing IP solely within the deliverable.

4. MUTUAL INDEMNIFICATION & MUTUAL LIABILITY CAP:
Each party agrees to defend and indemnify the other against third-party claims arising solely from its gross negligence, willful misconduct, or proven infringement of third-party intellectual property. Both parties' total cumulative liability under this Agreement shall be capped at the total fees paid or payable by Company to Contractor in the preceding twelve (12) months. Neither party shall be liable for indirect, consequential, or punitive damages.

5. NON-SOLICITATION (NO NON-COMPETE):
There shall be no non-compete restriction. Contractor may serve other clients freely provided Contractor does not disclose Company's Confidential Information. For twelve (12) months, neither party shall solicit the other's employees.

6. MUTUAL TERMINATION:
Either party may terminate this Agreement without cause upon fourteen (14) days prior written notice. Upon termination, Company shall pay Contractor for all work completed up to the effective termination date.

7. GOVERNING LAW & DISPUTE RESOLUTION:
This Agreement shall be governed by the laws of the jurisdiction of Contractor's primary place of business. Disputes shall first be submitted to good-faith executive mediation before formal proceedings.`
    }
  },
  {
    id: "mutual-nda",
    title: "Non-Disclosure Agreement (NDA)",
    category: "Corporate & IP",
    description: "Compare standard mutual protection versus a one-sided counterparty redline that claims ownership of shared trade secrets.",
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

1. PURPOSE:
The parties wish to explore a potential business relationship concerning AI collaboration and evaluate confidential technical and business information.

2. DEFINITION OF CONFIDENTIAL INFORMATION:
"Confidential Information" means any non-public information disclosed by either party to the other, marked as confidential or that reasonably should be understood to be confidential given the nature of the information.

3. OBLIGATIONS:
Each party agrees to: (a) hold the other's Confidential Information in strict confidence using the same degree of care it uses for its own confidential information (but not less than reasonable care); (b) use such information solely for the Purpose; and (c) restrict disclosure to employees and advisors with a need to know who are bound by confidentiality obligations.

4. EXCLUSIONS:
Confidential Information does not include information that: (a) is or becomes publicly known through no breach; (b) was already known to the recipient prior to disclosure; (c) is independently developed without reference to the disclosing party's information; or (d) is rightfully received from a third party.

5. TERM:
This Agreement and the confidentiality obligations herein shall remain in effect for a period of two (2) years from the date of disclosure.

6. NO LICENSE OR OWNERSHIP:
Nothing herein grants either party any license or ownership rights in the other party's intellectual property. All confidential information remains the property of the disclosing party.`,
    comparisonVersion: {
      label: "One-Sided Counterparty Redline",
      text: `ONE-WAY CONFIDENTIALITY & PROPRIETARY RIGHTS AGREEMENT

1. PURPOSE:
Recipient is evaluating technology provided by Company. Only Company disclosures are protected hereunder.

2. DEFINITION OF CONFIDENTIAL INFORMATION:
"Confidential Information" means all information, ideas, feedback, suggestions, and source code disclosed by Company or communicated by Recipient to Company.

3. UNILATERAL OBLIGATIONS:
Recipient agrees to hold Company's information strictly confidential indefinitely. Recipient shall not disclose, reverse engineer, or reference any concept learned during discussions.

4. FEEDBACK & INVENTIONS ASSIGNMENT:
Any suggestion, improvement, algorithm, prompt, or feedback provided by Recipient to Company regarding Company's products or discussion topics shall immediately become the sole and exclusive property of Company, without royalty or compensation to Recipient.

5. PERPETUAL TERM & INJUNCTIVE RELIEF:
Recipient's confidentiality obligations shall survive perpetually without expiration. In the event of any suspected breach, Company shall be entitled to immediate injunctive relief without posting bond.

6. NON-SOLICITATION & NON-DEALING:
Recipient agrees not to engage with or solicit any of Company's vendors, partners, or investors for a period of twenty-four (24) months.`
    }
  },
  {
    id: "residential-lease",
    title: "Apartment / Commercial Lease Agreement",
    category: "Real Estate & Housing",
    description: "Contains surprise repair deductibles, automatic rent hikes, landlord entry without prior notice, and forfeiture of deposit.",
    text: `STANDARD LEASE AGREEMENT

1. PREMISES & TERM:
Landlord leases to Tenant the premises for a term of 12 months commencing November 1, 2026.

2. AUTOMATIC RENEWAL:
Unless Tenant delivers written notice via registered postal mail at least 120 days prior to the expiration of the term, this Lease shall automatically renew for an additional 12-month period at an escalated rent equal to 125% of the preceding monthly rent.

3. MAINTENANCE AND REPAIR SURCHARGE:
Tenant agrees to be responsible for all maintenance, repairs, HVAC servicing, plumbing, and appliance upkeep. Tenant shall pay a mandatory non-refundable deductible of $250 for any service call requested, regardless of cause or pre-existing condition.

4. RIGHT OF ENTRY:
Landlord and Landlord's agents reserve the unrestricted right to enter the premises at any time, with or without prior notice, for inspection, showing to prospective buyers, or routine walkthroughs.

5. SECURITY DEPOSIT & FORFEITURE:
The security deposit of $3,000 shall be held by Landlord. In the event Tenant vacates before the end of the term or fails to provide 120-day renewal notice, the entire security deposit shall be automatically forfeited as non-refundable liquidated administrative damages, in addition to liability for the remaining lease term.

6. ALTERATIONS & GUESTS:
No overnight guests are permitted for more than two (2) consecutive nights without Landlord's prior written permission and an overnight surcharge of $50/night.`
  },
  {
    id: "saas-terms",
    title: "Cloud SaaS Terms of Service & Data Usage",
    category: "Technology & Consumer",
    description: "Contains clauses granting the vendor broad rights to train AI models on user proprietary data and unilateral pricing shifts.",
    text: `TERMS OF SERVICE - NEXUS CLOUD PLATFORM

1. SUBSCRIPTION AND LICENSE:
Subject to these Terms, Nexus grants Customer a non-exclusive license to access the SaaS Platform.

2. CUSTOMER DATA & AI MODEL TRAINING:
Customer retains ownership of raw inputs. However, Customer grants Nexus an irrevocable, worldwide, perpetual, royalty-free license to use, reproduce, process, modify, and vectorize all Customer data, documents, prompts, and confidential uploads to train, tune, validate, and commercialize Nexus's foundation models and AI services.

3. FEES AND UNILATERAL PRICE ADJUSTMENTS:
Customer shall pay subscription fees monthly. Nexus reserves the right to increase subscription fees at any time upon five (5) days email notice. Continued use of the service after such notice constitutes irrevocable acceptance of new rates.

4. WARRANTY DISCLAIMER:
The service is provided strictly "AS IS" and "AS AVAILABLE". Nexus makes no representations regarding uptime, accuracy, legal compliance, or data security.

5. LIMITATION OF LIABILITY & ARBITRATION:
Nexus's aggregate liability shall not exceed $50. All disputes must be arbitrated individually in Dover, Delaware. Class actions and jury trials are waived.`
  }
];

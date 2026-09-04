# Business Requirements Document (BRD)
## Digital SOP Governance, Learning & Assessment Platform — Construction MVP

**Document Version:** 1.0  
**Date:** 03-Sep-2026  
**Primary Industry Focus:** Construction / Real Estate  
**Product Strategy:** Generic, industry-configurable architecture; Construction-focused MVP

---

## 1. Executive Summary

The proposed solution is a Digital SOP Governance and Workforce Competency Platform designed to replace fragmented SOP documents, disconnected checklists, and manual training/traceability processes with a controlled, auditable digital workflow.

The long-term product should be configurable for multiple industry segments such as Construction/Real Estate, Manufacturing, Services, and Distribution. However, the first Minimum Viable Product (MVP) will focus specifically on Construction/Real Estate because of the immediate business opportunity.

The MVP will provide controlled SOP creation and lifecycle management, employee/project assignment, textual digital learning with optional multimedia, quizzes, practical/simulation assessments, SOP audits, version control, issue/CAPA tracking, dashboards, and AI-assisted advisory queries.

### Important Scope Decision

The MVP will **not** implement real-time machine-connected or executable shop-floor SOP functionality.

Future manufacturing functionality may extend the platform into Digital Standard Work Execution, including machine scanning, machine-linked SOP execution, operational checklists, parameter capture, and machine start/stop workflows.

---

# 2. Business Problem

Current SOP processes commonly rely on Word/PDF documents and disconnected operational checklists.

Key problems:

- SOPs exist as static documents without a unified controlled lifecycle.
- Employees may not know which SOP/version is applicable to them.
- Management lacks reliable evidence that the correct employee completed the correct SOP.
- SOP assignment and completion tracking are fragmented.
- Reading an SOP does not prove that the employee understood it.
- Quiz results and attempts are often not centrally tracked.
- SOP audits can be disconnected from the governing SOP.
- Audit findings, deviations, and CAPA are often tracked separately.
- SOP revisions and historical versions may lack clear traceability.
- Project-specific SOP applicability can require unnecessary duplication.
- Outsourced execution creates additional challenges around communicating and verifying required standards.
- Management lacks a consolidated view of SOP coverage, employee competency, audits, and open actions.

---

# 3. Product Vision

Create a configurable platform that connects:

**Controlled SOP → Employee → Learning → Quiz → Practical Assessment → Qualification → Audit → Deviation → CAPA → Continuous Improvement**

The platform should provide one source of truth for operational standards and competency evidence.

---

# 4. Product Strategy

## 4.1 Long-Term Industry Model

The product should be designed around configurable industry segments:

1. Construction / Real Estate
2. Manufacturing
3. Services
4. Distribution

Industry selection/configuration should eventually control relevant masters, workflows, terminology, and features.

## 4.2 MVP Focus

The MVP will focus on:

> **Construction / Real Estate — Project-based SOP Governance and Workforce Competency**

The underlying architecture should remain generic enough to support future industry expansion without rebuilding the core SOP engine.

---

# 5. MVP Objectives

The MVP shall:

1. Establish a centralized SOP repository.
2. Provide controlled SOP lifecycle management.
3. Support SOP review, approval, release, effective dates, and version control.
4. Allow SOPs to be mapped to projects, departments, roles, and employees.
5. Provide an employee dashboard for assigned SOPs and progress.
6. Support textual digital SOP learning.
7. Allow optional videos, images, PDFs, PPTs, Word files, and attachments.
8. Provide mandatory quizzes where configured.
9. Enforce configurable quiz attempt limits.
10. Capture quiz scores and pass/fail status.
11. Provide a practical/simulation assessment capability beyond quizzes.
12. Provide SOP audit templates and audit execution.
13. Link audit findings and deviations back to the relevant SOP/version.
14. Provide issue, root cause, containment, corrective action, and preventive action tracking.
15. Provide management and project-level dashboards.
16. Provide AI advisory/conversational querying over authorized platform data.
17. Maintain complete audit and traceability records.

---

# 6. User Roles

## 6.1 System Administrator

Responsibilities:

- Configure system masters.
- Manage users and roles.
- Configure industry/project settings.
- Manage access permissions.
- Maintain master data.

## 6.2 SOP Owner / Process Owner

Responsibilities:

- Create SOPs.
- Define SOP content and steps.
- Define applicability.
- Attach quizzes and assessments.
- Submit SOPs for review.
- Initiate revisions.

## 6.3 Reviewer

Responsibilities:

- Review SOP content.
- Add comments.
- Request changes.
- Approve review stage.

## 6.4 Approver

Responsibilities:

- Approve SOP for release.
- Approve revised versions.

## 6.5 Quality / Compliance User

Responsibilities:

- Assign SOPs.
- Monitor SOP compliance.
- Conduct/schedule audits.
- Review findings.
- Track CAPA.

## 6.6 Project Manager / Project Engineer

Responsibilities:

- Manage project-level SOP applicability.
- View project compliance.
- Monitor assigned employees/users.
- Review assessments and issues.

## 6.7 Employee / Learner

Responsibilities:

- View assigned SOPs.
- Read/watch assigned content.
- Complete quizzes.
- Complete practical/simulation assessments.
- View own progress and results.

## 6.8 Auditor

Responsibilities:

- Execute SOP audits.
- Complete audit checklists.
- Record findings.
- Raise deviations.

## 6.9 CAPA Owner

Responsibilities:

- Manage containment.
- Perform root cause analysis.
- Execute corrective/preventive actions.
- Submit evidence.
- Complete closure/verification.

---

# 7. Functional Requirements

# 7.1 Employee / HRMS Master

The platform shall maintain employee information required for SOP assignment and competency tracking.

### Employee fields

- Employee ID
- Employee Name
- Department
- Designation/Role
- Location
- Project allocation
- Active/Inactive status
- Reporting manager
- User account mapping

### Employee-SOP relationship

The system shall support:

**Employee → Project → SOP → SOP Version → Assignment → Completion → Assessment → Result**

---

# 7.2 Project Management

Projects are the primary operational context for the Construction MVP.

### Project Master

- Project ID
- Project name
- Project type
- Client
- Location
- Project manager
- Start date
- End date
- Status
- Project users/employees

### Project dashboard

The project dashboard shall show:

- Total SOPs applicable
- SOPs assigned
- SOP completion
- Employee/user count
- Quiz performance
- Assessment status
- Pending audits
- Audit findings
- Open issues
- Open CAPA
- Overdue actions

---

# 7.3 SOP Master

The SOP Master is the central master data repository.

### SOP information

- SOP ID / Code
- SOP title
- SOP type
- Process
- Category
- Department
- Owner
- Applicable role
- Applicable project type
- Input
- Expected output
- Criticality
- Review frequency
- Status
- Current version
- Effective date
- Review/expiry date

---

# 7.4 SOP Lifecycle

The system shall support:

**Draft → Review → Approval → Release → Effective → Revision → Obsolete**

Each transition shall capture:

- User
- Date/time
- Comments
- Status
- Version where applicable

No SOP shall become the active governing version without the required approval/release process.

---

# 7.5 SOP Version Control

Every revision shall create a controlled version.

Example:

- V1.0
- V2.0
- V3.0

The system shall maintain:

- Version number
- Revision reason
- Change summary
- Created by
- Reviewed by
- Approved by
- Release date
- Effective date
- Previous version
- Current version

Historical assignments, quiz results, assessments, audits, and execution/usage records must remain linked to the exact SOP version applicable at that time.

---

# 7.6 Digital SOP Content

The SOP should primarily be a structured textual digital document.

Supported content:

- Rich text
- PDF
- Word
- PPT
- Images/photos
- Optional video
- Attachments
- Step-by-step instructions
- Checklists
- Tables

### Phase-1 LMS clarification

The platform requires learning capability because quizzes and competency validation are mandatory.

However, Phase 1 is **not a full video-based LMS product**.

Video is an optional SOP content type.

Advanced video-learning controls such as forced watch, anti-skip, detailed video analytics, and resume tracking are out of scope unless separately approved.

---

# 7.7 SOP Assignment

Authorized users shall assign SOPs to:

- Individual employee
- Role/designation
- Department
- Project
- User group

Assignment should support:

- Assignment date
- Due date
- Required completion
- SOP version
- Priority
- Status

---

# 7.8 Employee Dashboard

Employees shall have a **My SOPs** view.

Each assigned SOP should show:

- SOP name
- Version
- Assignment date
- Due date
- Progress %
- Quiz status
- Quiz score
- Attempts used
- Maximum attempts
- Assessment status
- Qualification/certification status
- Completion date

Example:

> Stock Verification SOP — V2.0  
> Progress: 100%  
> Quiz: 85% — Pass  
> Attempts: 1/3  
> Assessment: Passed  
> Status: Completed

---

# 7.9 Quiz Master

Quiz shall be maintained as independent master data.

### Quiz configuration

- Quiz ID
- Quiz name
- SOP/step association
- Questions
- Question type
- Options
- Correct answer
- Marks
- Passing percentage
- Maximum attempts
- Time limit, if required
- Active/inactive status

Quizzes can be attached to an SOP or relevant SOP section/step.

---

# 7.10 Quiz Attempt Management

The system shall enforce a configurable maximum attempt limit.

Example:

**Passing score = 80%**  
**Maximum attempts = 3**

Attempt history shall be recorded:

- Attempt number
- Date/time
- Score
- Pass/fail
- Duration
- Submitted answers

After the maximum attempts are exhausted, the quiz shall be locked.

Authorized users may reset/reassign attempts based on business rules.

---

# 7.11 Practical / Simulation Assessment

Quiz alone shall not be treated as sufficient evidence of SOP understanding.

Every applicable SOP should support an assessment method.

Assessment types may include:

- Simulation
- Assignment
- Scenario-based execution
- Result/output submission
- Practical observation
- Evaluator-based assessment

### Example — Construction

**SOP: Physical Stock Verification**

The employee receives a simulated stock-verification scenario and must:

1. Review preparation requirements.
2. Verify the provided information.
3. perform the required checks.
4. Record the result.
5. Identify discrepancies.
6. Submit the expected output.

The assessment result shall be recorded against the employee and SOP version.

### Future Manufacturing

Practical execution can eventually be performed against the actual machine/work environment.

This is outside the MVP.

---

# 7.12 Qualification / Certification

Where configured, an employee becomes qualified after completing the required learning and assessment criteria.

Possible status:

- Assigned
- In Progress
- Quiz Failed
- Assessment Pending
- Qualified
- Expired
- Suspended

Certification/qualification record should contain:

- Employee
- SOP
- Version
- Result
- Score
- Assessment result
- Completion date
- Validity
- Approver/evaluator

---

# 7.13 SOP Audit Management

The system shall provide SOP-specific audit functionality.

### Audit Template

An audit template may contain:

- Audit point
- Expected control
- Evidence requirement
- Pass/Fail
- Observation
- Severity

### Audit process

**SOP → Audit Template → Schedule → Execute → Findings → Result**

Audit record shall include:

- Audit ID
- Project
- SOP
- SOP version
- Auditor
- Scheduled date
- Actual date
- Checklist
- Findings
- Result
- Evidence
- Status

---

# 7.14 Deviation / Issue Management

A failed audit or identified SOP deviation shall be traceable to its source.

Issue should capture:

- Issue ID
- Project
- SOP
- SOP version
- Audit
- Employee/user
- Date/time
- Description
- Severity
- Evidence
- Owner
- Due date
- Status

---

# 7.15 CAPA Management

CAPA shall support:

### Containment
Immediate action to control the problem.

### Root Cause Analysis
Identification and documentation of the underlying cause.

### Corrective Action
Action to correct the identified issue.

### Preventive Action
Action to prevent recurrence.

### Verification
Validation that the action was effective.

### Closure

All actions should maintain:

- Owner
- Due date
- Evidence
- Status
- Comments
- Completion date
- Verification result

---

# 7.16 Document Management

The platform shall not behave like a generic file-system repository.

### Document Master

The system shall maintain document types/templates such as:

- Drawings
- BOQ
- Material specifications
- Method statements
- Inspection reports
- Certificates
- Checklists
- Other project-controlled documents

### Project Documents

A project shall select required document types from the Document Master.

Flow:

**Document Master → Project → Required Documents → Upload/Submit → Review/Verification → Status**

---

# 7.17 Project Issue Tracker

Issue Tracker should be accessible within the project context.

Navigation example:

**Project → Overview | SOPs | Documents | Issues | Audits**

Issues should be linkable to:

- Project
- SOP
- SOP version
- Audit
- Checklist
- User
- Contractor
- CAPA

---

# 7.18 Notifications and Escalations

Notifications should be generated for configured events:

- SOP assigned
- SOP due date approaching
- SOP overdue
- SOP completed
- Quiz failed
- Maximum attempts reached
- Assessment pending
- Qualification completed
- Qualification expiring
- SOP revision released
- SOP becomes effective
- Audit scheduled
- Audit overdue
- Audit failed
- Issue created
- CAPA assigned
- CAPA overdue

Escalation rules should notify the next responsible person when configured deadlines are missed.

---

# 7.19 Dashboard Requirements

## Management Dashboard

KPIs:

- Active projects
- Total SOPs
- Active SOP versions
- SOP assignment coverage
- Completion %
- Quiz pass %
- Assessment pass %
- Qualified employees
- Pending audits
- Failed audits
- Open issues
- Open CAPA
- Overdue actions

## Project Dashboard

KPIs:

- Projects/users
- Applicable SOPs
- Assigned SOPs
- Completed SOPs
- Pending SOPs
- Employee competency
- Audit status
- Issue status
- CAPA status
- Document status

## Employee Dashboard

KPIs:

- Assigned SOPs
- In-progress SOPs
- Completed SOPs
- Quiz scores
- Attempts used
- Assessment results
- Qualification status

---

# 7.20 AI Advisory

AI should be implemented as an advisory layer over authorized platform data.

### Example queries

- “Show pending SOPs for this project.”
- “Which employees have not completed mandatory SOPs?”
- “Which SOPs have the highest audit findings?”
- “Show open CAPAs related to quality.”
- “Why was this SOP revised?”
- “Which SOP version is currently effective?”

AI responses must respect user permissions and should not independently approve SOPs, close CAPA, or make compliance decisions.

---

# 8. Construction-Specific Requirements

The MVP should support construction project structures such as:

- Plot development
- Clubhouse
- Roads
- Compound walls
- Civil works
- Ground/cricket ground
- Electrical
- Plumbing
- Flooring
- Waterproofing
- Safety
- Quality inspections

SOPs should be reusable across projects.

Example:

**Standard SOP: Waterproofing**

can be mapped to:

- Project A
- Project B
- Project C

without creating duplicate SOP documents.

---

# 9. Contractor / Outsourcing Model

Construction work may be outsourced.

The platform should therefore distinguish between:

- Organization employees
- Project engineers
- Quality personnel
- Contractors/external workforce

For MVP, contractor management can be limited to the ability to identify the responsible contractor/vendor and maintain SOP compliance/assessment evidence.

Future phases may introduce dedicated external contractor portals and contractor-specific access.

---

# 10. Business Rules

### BR-01 — Controlled SOP

Only approved and released SOPs can become effective.

### BR-02 — Version Integrity

A historical record must always reference the SOP version applicable at that time.

### BR-03 — Assignment

Only authorized users can assign mandatory SOPs.

### BR-04 — Quiz Attempts

Maximum quiz attempts must be configurable.

### BR-05 — Quiz Lock

A quiz must lock after the maximum allowed attempts unless reset by an authorized user.

### BR-06 — Assessment

Where configured, quiz completion alone does not constitute competency. A practical/simulation assessment is required.

### BR-07 — SOP Revision

A revision must create a new controlled version and preserve the previous version.

### BR-08 — Audit Traceability

Every audit must reference the relevant SOP and SOP version.

### BR-09 — CAPA Traceability

Every CAPA should trace back to its originating issue/deviation/audit/SOP where applicable.

### BR-10 — Project Reusability

Standard SOPs should be reusable across multiple projects through project mapping.

### BR-11 — Permissions

Users should only see projects, SOPs, assessments, documents, audits, and issues permitted by their role/access.

### BR-12 — Effective Version

New assignments should use the currently effective SOP version unless an authorized workflow explicitly specifies otherwise.

---

# 11. Non-Functional Requirements

## Security

- Role-based access control
- Authentication
- Authorization
- Secure file access
- Audit logging

## Traceability

Every important action should record:

- User
- Date/time
- Entity
- Action
- Previous value where applicable
- New value where applicable

## Performance

- Dashboard should load within acceptable business application response times.
- Search should support SOP/project/user filtering.
- Large document repositories should remain searchable.

## Availability

The system should support normal enterprise web application availability requirements.

## Scalability

Architecture should allow future expansion from Construction to other industry segments.

## Auditability

Records should not be silently deleted or overwritten where regulatory/business traceability is required.

---

# 12. High-Level Navigation

## Global Navigation

**Home | Dashboard | Projects | SOP Library**

## Project Context

When a project is opened:

**Overview | SOPs | Documents | Issues | Audits**

This avoids exposing a generic ERP-style file system.

Documents and Issue Tracker are project-specific operational functions rather than primary global navigation items.

---

# 13. High-Level Data Relationships

```text
Organization
    |
    +-- Projects
    |      |
    |      +-- Project Users
    |      +-- Project SOP Mapping
    |      +-- Project Documents
    |      +-- Project Issues
    |      +-- Project Audits
    |
    +-- Employees
    |
    +-- SOP Master
    |      |
    |      +-- SOP Versions
    |      +-- SOP Content
    |      +-- SOP Checklists
    |      +-- SOP Quizzes
    |      +-- SOP Assessments
    |
    +-- Quiz Master
    |
    +-- Document Master
    |
    +-- Audit Templates
    |
    +-- Issues / Deviations
           |
           +-- CAPA
```

---

# 14. End-to-End MVP Workflow

```text
Create SOP
    ↓
Add structured textual content
    ↓
Add optional PDF / PPT / Word / Image / Video
    ↓
Define checklist
    ↓
Attach quiz
    ↓
Define assessment
    ↓
Review
    ↓
Approval
    ↓
Release
    ↓
Effective Version
    ↓
Map SOP to Project / Role / Employee
    ↓
Employee Dashboard
    ↓
Employee studies SOP
    ↓
Quiz
    ↓
Attempt Limit
    ↓
Pass / Fail
    ↓
Practical / Simulation Assessment
    ↓
Qualification / Completion
    ↓
SOP Audit
    ↓
Findings / Deviation
    ↓
Issue
    ↓
Root Cause
    ↓
Containment
    ↓
Corrective Action
    ↓
Preventive Action
    ↓
Verification
    ↓
Closure
    ↓
Continuous Improvement
    ↓
SOP Revision
    ↓
New Version
```

---

# 15. MVP Scope

## In Scope

- Construction/Real Estate project management
- Employee master
- SOP master
- SOP repository
- SOP lifecycle
- Review and approval
- Release/effective dates
- Version control
- Project-SOP mapping
- Employee-SOP assignment
- Employee dashboard
- Text-based digital SOP
- Optional multimedia attachments
- Quiz master
- Quiz attempt limits
- Quiz results
- Practical/simulation assessment
- Qualification tracking
- SOP audit templates
- SOP audits
- Findings/deviations
- Issue management
- CAPA
- Notifications/escalations
- Project documents
- Dashboards
- AI advisory/conversational query

---

# 16. Out of Scope — Phase 1

The following should not be implemented in the MVP:

- Real-time machine integration
- Machine QR/barcode-driven SOP execution
- Machine start/stop integration
- Machine parameter integration
- MES integration
- ERP production-data integration
- Real-time shop-floor execution
- Advanced video LMS controls
- Full external contractor portal
- Multi-industry configuration UI
- Manufacturing Digital Standard Work Execution
- Automated machine telemetry
- IoT integrations

These features should remain on the future product roadmap.

---

# 17. Future Roadmap

## Phase 2 — Manufacturing Digital Execution

Potential capabilities:

```text
Employee
   ↓
Scan Machine
   ↓
Identify Machine
   ↓
Identify Employee
   ↓
Check Qualification
   ↓
Fetch Effective SOP
   ↓
Digital Standard Work
   ↓
Pre-checks
   ↓
Operational Steps
   ↓
Measurements / Parameters
   ↓
In-process Checks
   ↓
Final Checks
   ↓
Submit Daily Execution
```

## Phase 3 — Industry Expansion

Add configurable industry profiles:

- Manufacturing
- Services
- Distribution
- Education/other applicable segments

## Phase 4 — Enterprise Integrations

Potential integrations:

- ERPNext
- MES
- HRMS
- IoT/machine systems
- External contractor systems
- BI/reporting platforms

---

# 18. Success Criteria for MVP

The MVP will be considered successful when a construction organization can:

1. Create and control an SOP.
2. Review and approve the SOP.
3. Release an effective version.
4. Map the SOP to one or more projects.
5. Assign it to employees/users.
6. Allow employees to access and complete the SOP.
7. Conduct a quiz with controlled attempts.
8. Record quiz scores.
9. Conduct a practical/simulation assessment.
10. Determine competency/qualification.
11. Audit the SOP.
12. Record findings/deviations.
13. Create and track CAPA.
14. View project and management dashboards.
15. Trace every result back to the employee, project, SOP, and version.
16. Ask authorized conversational queries against the available data.

---

# 19. Product Principle

The product should be designed around:

> **Learn → Understand → Assess → Qualify → Audit → Improve**

The immediate MVP is a **Construction-focused Digital SOP Governance and Competency Platform**, not a machine execution system.

The architecture should nevertheless preserve the ability to add **Digital Standard Work Execution** for manufacturing in a later phase.

---

# 20. Final Business Positioning

The solution can be positioned as:

> **A Digital SOP Governance and Workforce Competency Platform that provides controlled SOPs, employee learning, quizzes, practical assessments, project-level applicability, audit traceability, deviation/CAPA management, version control, and AI-assisted insights — starting with Construction/Real Estate and designed for future multi-industry expansion.**

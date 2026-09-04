Construction Compliance & SOP Management MVP
============================================

Project Module — Functional Requirements & End-to-End Workflow
--------------------------------------------------------------

### 1\. Purpose

The **Project Module** is the primary operational context of the Construction Compliance MVP.

The system should not treat Projects as a simple CRUD list. A Project should act as the central workspace where project teams configure and manage:

*   Project information
    
*   Project employees and responsibilities
    
*   Applicable SOPs
    
*   SOP learning and qualification
    
*   Project documents and evidence
    
*   Audits
    
*   Issues / deviations
    
*   RCA and CAPA
    
*   Compliance monitoring
    
*   Project activity and traceability
    

The core architecture is:

> **Project Master → Project Configuration → Project Workspace → Execution → Compliance**

The Project determines **where and to whom standards apply**, while the SOP Library and Document Master remain the controlled master-data sources.

2\. High-Level Application Structure
====================================

The main navigation should be:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   HOME  │  ├── DASHBOARD  │  ├── PROJECTS  │  │   ├── Project List  │   │  │   ├── New Project  │   │  │   └── Project Workspace  │       │  │       ├── Overview  │       ├── SOPs  │       ├── Team  │       ├── Documents  │       ├── Audits  │       └── Issues  │  └── SOP LIBRARY   `

The Project Workspace is the operational center.

3\. Project Master
==================

3.1 Project Creation
--------------------

Clicking **\+ New Project** should open a structured project creation form instead of one large form.

### Basic Information

Fields:

*   Project ID
    
*   Project Name
    
*   Project Type
    
*   Client
    
*   Location
    
*   Description
    
*   Project Manager
    
*   Project Owner
    
*   Department / Business Unit
    

### Project Types

For the Construction MVP:

*   Residential
    
*   Commercial
    
*   Industrial
    
*   Infrastructure
    
*   Renovation
    
*   Other
    

The architecture should allow Project Types to become configurable in the future.

### Timeline

Fields:

*   Planned Start Date
    
*   Planned End Date
    
*   Actual Start Date
    
*   Actual End Date
    
*   Current Status
    

### Project Status

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Planning     ↓  Active     ↓  Completed     ↓  Closed   `

Alternative state:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Active → On Hold → Active   `

4\. Projects Main Page
======================

The Projects page should provide management-level visibility.

Header
------

**Projects**

Actions:

*   Filter
    

*   New Project
    

### Filters

*   Project Type
    
*   Status
    
*   Project Manager
    
*   Location
    
*   Start Date
    
*   End Date
    

KPI Cards
---------

KPIPurposeTotal ProjectsNumber of all projectsActive ProjectsCurrently active projectsSOP ComplianceOverall SOP compliancePending ActionsItems requiring attentionOpen IssuesActive project issuesOverdue CAPACorrective actions overdue

Project List
------------

ProjectTypeManagerLocationSOPsUsersComplianceIssuesStatusActionGreen ValleyResidentialRaviHyderabad428692:ctiveViewXYZ ClubhouseCommercialKumarBengaluru284187ZctiveView

Clicking **View** opens the Project Workspace.

5\. Project Workspace
=====================

When a Project is opened, display:

**Project Name**Active

Project Manager: Ravi KumarLocation: HyderabadStart Date: 01-Jun-2026Expected Completion: 31-Dec-2026

Navigation:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Overview | SOPs | Team | Documents | Audits | Issues   `

6\. Project Overview
====================

The Overview page provides a complete project health summary.

KPI Cards
---------

*   SOP Compliance
    
*   Total Employees
    
*   Active SOPs
    
*   Qualified Employees
    
*   Pending Assessments
    
*   Open Issues
    
*   Overdue CAPA
    

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SOP Compliance        92%  Employees             86  Active SOPs            42  Qualified Employees    74  Pending Assessments     8  Open Issues             3  Overdue CAPA             1   `

SOP Compliance
--------------

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   42 Active SOPs  34 Completed  4 In Progress  2 Not Started  2 Overdue   `

Employee Competency
-------------------

Show:

EmployeeRequired SOPsCompletedQualifiedPendingRavi1212111Suresh8762Ahmed1010100

Document Compliance
-------------------

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Required Documents     65  Submitted              61  Approved               55  Pending Review          6  Expired                 2   `

Issues & CAPA
-------------

Show:

*   Open Issues
    
*   High Severity Issues
    
*   Pending CAPA
    
*   Overdue CAPA
    
*   CAPA awaiting verification
    

Recent Activity
---------------

Display an audit-style timeline:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SOP V2.1 released          ↓  Employee completed SOP          ↓  Audit conducted          ↓  Audit failed          ↓  Issue created          ↓  CAPA assigned          ↓  CAPA verified   `

7\. Project → Team
==================

The Team section manages employees assigned to the project.

Team List
---------

EmployeeRoleDepartmentResponsibilityStatusRavi KumarSite EngineerCivilProject ManagerActiveSureshSupervisorCivilSite SupervisorActiveAhmedQuality EngineerQualityQA/QCActive

Actions
-------

*   Add Employee
    
*   Bulk Assign
    
*   Edit Assignment
    
*   Remove Assignment
    
*   View Employee
    
*   View SOP Qualification
    
*   View Learning Progress
    

Assignment information:

*   Employee
    
*   Project Role
    
*   Department
    
*   Start Date
    
*   End Date
    
*   Responsibility
    
*   Active / Inactive
    

The relationship should ultimately support:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Project     ↓  Employee     ↓  Applicable SOP     ↓  Learning     ↓  Quiz     ↓  Assessment     ↓  Qualification   `

8\. Project → SOPs
==================

The Project SOP page is a dedicated operational workspace, not just a list.

The SOP content itself remains controlled by the **SOP Library**. The Project only configures and manages its applicability and execution.

SOP List
--------

Header:

**Project SOPs**

Actions:

*   Filter
    

*   Add SOP from Library
    

### Filters

*   Category
    
*   Department
    
*   Process
    
*   Status
    
*   Mandatory / Optional
    
*   Completion
    
*   Qualification
    
*   SOP Version
    

KPI Cards
---------

KPIExampleTotal SOPs42Mandatory36Completed30In Progress5Overdue3Qualified Employees74

SOP Table
---------

SOP IDSOP NameCategoryVersionMandatoryEmployeesCompletionStatusSOP-CIV-001Concrete WorkCivilV2.1Yes2492%ActiveSOP-FIN-004FlooringFinishingV1.2Yes1881%Active

9\. Add SOP to Project
======================

Users should **not create a new SOP inside the Project**.

Instead:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Project     ↓  + Add SOP     ↓  SOP Library     ↓  Select Existing SOP     ↓  Configure Applicability     ↓  Add to Project   `

Configuration:

*   SOP
    
*   Applicable Activity
    
*   Applicable Roles
    
*   Mandatory / Optional
    
*   Effective From
    
*   Completion Requirement
    
*   Assessment Required
    
*   Qualification Required
    
*   Applicable Employees
    
*   Remarks
    

### Important Master Data Rule

If one SOP applies to multiple projects:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SOP Library      │      ├── Project A      ├── Project B      ├── Project C      └── Project D   `

Do not duplicate the SOP.

10\. Project → SOP Detail
=========================

Clicking an SOP opens a **Project-Specific SOP View**.

Example:

**Concrete Work SOP**

V2.1 | Active | Mandatory

Project: Green ValleyCategory: CivilOwner: QA DepartmentEffective Date: 01-Aug-2026Next Review: 01-Aug-2027

Actions:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   View SOP  Assign  View History  Audit  More   `

SOP Tabs
--------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Overview  Procedure  Employees  Compliance  Quiz  Assessment  Audits  Version History   `

11\. SOP → Overview
===================

Display:

*   SOP ID
    
*   SOP Name
    
*   Version
    
*   Category
    
*   Process
    
*   Department
    
*   Owner
    
*   Criticality
    
*   Effective Date
    
*   Review Date
    
*   Status
    
*   Mandatory / Optional
    
*   Applicable Roles
    
*   Applicable Project Types
    

### Purpose

Why the SOP exists.

### Scope

Where it applies.

### Responsibilities

Who is responsible.

### Inputs

What is required before execution.

### Expected Output

What should be achieved.

12\. SOP → Procedure
====================

The SOP should be displayed as **structured digital content**, not simply as a PDF.

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Check Drawing         ↓  2. Verify Reinforcement         ↓  3. Check Formwork         ↓  4. Verify Concrete Mix         ↓  5. Conduct Pre-Pour Inspection         ↓  6. Pour Concrete         ↓  7. Record Inspection   `

Each procedure step may contain:

*   Instruction
    
*   Image
    
*   Table
    
*   Supporting Document
    
*   Safety Requirement
    
*   Checklist
    
*   Notes
    

13\. SOP → Employees
====================

Purpose:

> Identify which project employees must know and follow this SOP.

Table:

EmployeeRoleAssignedLearningQuizAssessmentQualificationRaviSite Engineer✓100%PassedPassedQualifiedSureshSupervisor✓100%PassedPendingPendingAhmedEngineer✓70%Not Started——

Actions:

*   Assign Employee
    
*   Bulk Assign
    
*   Remove Assignment
    
*   Extend Due Date
    
*   Reset Quiz
    
*   Assign Assessment
    
*   View Employee Progress
    

14\. SOP → Compliance
=====================

Show:

**Overall SOP Compliance: 92%**

Breakdown:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Learning Completion       95%  Quiz Pass Rate            89%  Assessment Qualification  82%   `

Pending Actions:

*   Employees who haven't started
    
*   Employees who failed quiz
    
*   Pending assessments
    
*   Expired qualifications
    

Actions:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Assign  Remind  View Employee   `

15\. SOP → Quiz
===============

Display:

*   Quiz Name
    
*   Number of Questions
    
*   Passing Percentage
    
*   Maximum Attempts
    
*   Current Pass Rate
    
*   Number of Attempts
    

Actions:

*   Open Quiz Master
    
*   View Results
    
*   Reset Attempts
    

Employees take the quiz through **My Learning**.

Managers monitor results from the Project SOP workspace.

16\. SOP → Assessment
=====================

For practical or simulation-based assessment.

Example:

**Concrete Work Practical Assessment**

Assessment Type: Practical ObservationPassing Score: 80%Evaluator: QA Engineer

EmployeeAssignedAttemptScoreResultEvaluatorRaviYes192%PassedKumarSureshYes1—Pending—

Actions:

*   Assign Assessment
    
*   Start / Record Assessment
    
*   Evaluate
    
*   Reassign
    
*   View Result
    

17\. SOP → Audits
=================

Show only audits related to this SOP **within the current project**.

AuditDateAuditorResultFindingsStatusAUD-02402-SepKumarFailed3ClosedAUD-03110-SepRavi——Scheduled

Actions:

*   Schedule Audit
    
*   Start Audit
    
*   View Findings
    

18\. SOP → Version History
==========================

Version control is mandatory.

VersionReleasedEffectiveChanged ByReasonStatusV1.0Jan 2026Feb 2026AdminInitialObsoleteV2.0Jun 2026Jul 2026QAProcess updateObsoleteV2.1Aug 2026Aug 2026QASafety updateActive

Actions:

*   View Version
    
*   Compare Versions
    
*   View Change Summary
    

### Critical Rule

Project users cannot directly edit master SOP content.

If modification is required:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Project SOP       ↓  Open in SOP Library       ↓  Create New Revision       ↓  Review       ↓  Approve       ↓  Release       ↓  New Version becomes Active   `

19\. Project → Documents
========================

Documents are a **controlled project repository**, not a generic file manager.

The Document module must clearly separate:

> **Document Requirement** vs **Actual Submitted Document**

20\. Project Document Structure
===============================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Project → Documents      ├── Requirements      │      └── Documents   `

### Requirements

Answers:

> What documents are required for this project?

### Documents

Answers:

> What documents have actually been submitted?

This distinction should be visible in the UI.

21\. Project → Documents → Requirements
=======================================

Example:

Required DocumentMandatoryRelated SOPStatusStructural DrawingYesConcrete SOPApprovedMix DesignYesConcrete SOPPendingMTCYesMaterial SOPMissing

Action:

**Configure Requirements**

Requirements should come from the **Document Master** and be configured for the specific project.

Architecture:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Document Master        ↓  Project Configuration        ↓  Required Document        ↓  Actual Document Submission   `

22\. Project → Documents → Actual Documents
===========================================

### KPI Cards

KPIExampleRequired65Submitted61Approved55Under Review6Rejected2Expiring Soon3Expired2

### Document List

DocumentTypeRelated SOPVersionSubmitted ByStatusStructural DrawingDrawingConcrete SOPRev 03RaviApprovedMix DesignTechnicalConcrete SOPRev 02KumarUnder ReviewMTCCertificateMaterial SOPRev 01AhmedApproved

Actions:

**\+ Submit Document**

Filters:

*   Document Type
    
*   Category
    
*   Status
    
*   Related SOP
    
*   Activity
    
*   Submitted By
    
*   Reviewer
    
*   Version
    
*   Expiry
    
*   Date
    

23\. Document Submission Flow
=============================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Select Document Type          ↓  Upload Document          ↓  Enter Metadata          ↓  Link SOP / Activity          ↓  Submit for Review          ↓  Reviewer          ↓  Approve / Reject / Request Revision   `

24\. Document Detail
====================

Example:

**Structural Drawing**

Rev 03 | Approved

Project: Green ValleyDocument Type: DrawingCategory: TechnicalRelated SOP: Concrete WorkRelated Activity: Concrete PourSubmitted By: RaviSubmitted Date: 02-Sep-2026Approved By: QA Manager

Actions:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   View  Download  New Revision  Review  More   `

Tabs:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Overview  Document  Review  Version History  Activity   `

25\. Document → Overview
========================

Display:

*   Document ID
    
*   Document Name
    
*   Document Type
    
*   Category
    
*   Project
    
*   Related SOP
    
*   Related Activity
    
*   Owner
    
*   Submitted By
    
*   Reviewer
    
*   Version
    
*   Document Date
    
*   Expiry Date
    
*   Status
    

26\. Document → Viewer
======================

Display the actual uploaded document.

Supported viewing:

*   PDF
    
*   Image
    
*   Office document preview where supported
    

Actions:

*   Download
    
*   Print
    
*   Full Screen
    

Clearly identify:

> **Current Approved Version: Rev 03**

27\. Document → Review
======================

Reviewer sees:

**Review Status: Under Review**

Actions:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Approve  Reject  Request Revision   `

Review metadata:

*   Review Comment
    
*   Review Date
    
*   Reviewer
    

Example comment:

> Drawing dimensions verified against latest structural design.

Approval changes status:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Under Review        ↓  Approved   `

28\. Document → Version History
===============================

VersionDateUploaded ByChange SummaryStatusRev 01JunRaviInitialSupersededRev 02JulRaviColumn changesSupersededRev 03SepKumarStructural updateCurrent

Actions:

*   View
    
*   Compare
    
*   Download
    

A casual **Restore** function should not be provided unless governance rules explicitly allow it.

29\. Document → Activity
========================

Maintain a complete audit trail:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Document uploaded         ↓  Rev 03 created         ↓  Submitted for review         ↓  QA commented         ↓  Approved by QA Manager         ↓  Viewed by Project Manager   `

This provides document traceability.

30\. Project → Audits
=====================

The Audit module manages project-level compliance verification.

Structure:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Audits  │  ├── Audit List  ├── Schedule  ├── Execute  └── Findings   `

An audit should identify:

*   Project
    
*   SOP
    
*   SOP Version
    
*   Auditor
    
*   Date
    
*   Audit Checklist
    
*   Result
    
*   Findings
    
*   Evidence
    

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   AUD-024  Project: Green Valley  SOP: Concrete Work  Version: V2.1  Auditor: QA Manager  Result: Failed  Findings: 3   `

Failed findings may create Issues/CAPA.

31\. Project → Issues
=====================

Issues represent deviations, non-conformities or problems discovered during execution.

Structure:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Issues  │  ├── Issue List  ├── Issue Detail  ├── RCA  ├── CAPA  └── Verification   `

Example:

IssueRelated SOPSeverityOwnerDue DateStatusImproper curingConcrete Work SOPHighSite Engineer10-SepOpenMaterial mismatchMaterial SOPMediumQA12-SepIn Progress

32\. Issue → RCA → CAPA
=======================

The workflow should be:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Issue Detected        ↓  Issue Created        ↓  Severity Classification        ↓  Root Cause Analysis        ↓  Corrective Action        ↓  Preventive Action        ↓  Action Assigned        ↓  Action Completed        ↓  Verification        ↓  Issue Closed   `

Overdue CAPA should automatically contribute to the Project's compliance risk indicators.

33\. End-to-End Project Flow
============================

The complete business flow should work as follows:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML                    `PROJECT MASTER                            │                            ↓                   Create Construction                        Project                            │               ┌────────────┼────────────┐               ↓            ↓            ↓             TEAM          SOPs      DOCUMENTS               │            │            │               │            ↓            ↓               │       Add SOP from   Configure               │       SOP Library    Requirements               │            │            │               ↓            ↓            ↓          Assign Roles   Configure    Submit Evidence          & Employees    Applicability      │               │            │               ↓               │            ↓          Review / Approval               │       Assign SOPs          │               │            │               │               │            ↓               │               │       Learning             │               │            ↓               │               │          Quiz              │               │            ↓               │               │       Assessment           │               │            ↓               │               │      Qualification         │               │            │               │               └────────────┼───────────────┘                            ↓                       AUDIT / REVIEW                            ↓                     Compliance Check                            ↓                    ┌───────┴───────┐                    ↓               ↓                  PASS            FAIL                    │               │                    │               ↓                    │             ISSUE                    │               ↓                    │              RCA                    │               ↓                    │              CAPA                    │               ↓                    │          Verification                    │               ↓                    └────────→ CLOSED`

34\. Complete Data Relationship
===============================

The core relationships should be:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SOP LIBRARY      │      │ SOP Master      ↓  PROJECT      │      ├── Project SOP      │       │      │       ├── Applicable Roles      │       ├── Employees      │       ├── Learning      │       ├── Quiz      │       ├── Assessment      │       ├── Qualification      │       ├── Compliance      │       ├── Audits      │       └── Version      │      ├── Team      │      ├── Document Requirements      │       │      │       ↓      │   Actual Documents      │       │      │       ├── Review      │       ├── Approval      │       ├── Version      │       └── Activity      │      ├── Audits      │       ↓      │    Findings      │       ↓      │    Issues      │       ↓      │      RCA      │       ↓      │      CAPA      │       ↓      │   Verification      │      └── Project Compliance   `

35\. Core Architectural Rules
=============================

Rule 1 — Project is the Operational Context
-------------------------------------------

Everything executed in relation to a construction project should be traceable back to the Project.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Project → SOP → Employee → Learning → Qualification  Project → Document → Review → Approval  Project → Audit → Finding → Issue → CAPA   `

Rule 2 — Master Data Must Remain Controlled
-------------------------------------------

Do not duplicate master information.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SOP Library      ↓  Project Applicability   `

and:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Document Master      ↓  Project Requirement      ↓  Actual Document   `

Rule 3 — Project Controls Applicability
---------------------------------------

The Project decides:

*   Which SOP applies
    
*   Which employees need it
    
*   Which roles need it
    
*   Whether it is mandatory
    
*   Whether assessment is required
    
*   Which documents are required
    
*   Who reviews the documents
    
*   Which audits apply
    

Rule 4 — Master SOP Content Is Not Edited from Project
------------------------------------------------------

Project users can configure applicability and manage execution.

They cannot directly modify the master SOP.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Project    ↓  Open SOP in Library    ↓  New Revision    ↓  Review    ↓  Approval    ↓  Release   `

Rule 5 — Every Controlled Item Needs Traceability
-------------------------------------------------

The system should maintain:

*   Created By
    
*   Created Date
    
*   Modified By
    
*   Modified Date
    
*   Version
    
*   Status
    
*   Approval
    
*   Activity History
    

36\. Role-Based Access
======================

### Admin / Project Manager

Can:

*   Create Projects
    
*   Configure Project
    
*   Add Employees
    
*   Add SOPs
    
*   Configure SOP applicability
    
*   Configure Document Requirements
    
*   Upload Documents
    
*   Assign Employees
    
*   Monitor Compliance
    
*   Schedule Audits
    
*   Manage Issues/CAPA
    
*   View Reports
    

### QA / Reviewer

Can:

*   Review Documents
    
*   Approve / Reject Documents
    
*   Conduct Audits
    
*   Record Findings
    
*   Evaluate Assessments
    
*   Verify CAPA
    
*   View SOP Compliance
    

### Employee

Should have a simplified experience:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   My Learning  My SOPs  My Assessments  My Documents  My Tasks   `

Employees can:

*   Read assigned SOPs
    
*   Complete learning
    
*   Complete checklists
    
*   Take quizzes
    
*   Submit assessments
    
*   View qualifications
    
*   View permitted documents
    

Employees should not approve controlled documents.

37\. MVP Scope
==============

For the Construction MVP, prioritize:

### Phase 1 — Foundation

*   Project Master
    
*   Project List
    
*   Project Workspace
    
*   Team Management
    
*   SOP Library integration
    

### Phase 2 — SOP Execution

*   Project SOP assignment
    
*   SOP applicability
    
*   SOP Procedure
    
*   Employee assignment
    
*   Learning tracking
    
*   Quiz
    
*   Assessment
    
*   Qualification
    
*   Compliance
    

### Phase 3 — Document Control

*   Document Requirements
    
*   Document Submission
    
*   Document Viewer
    
*   Review
    
*   Approval
    
*   Rejection
    
*   Version History
    
*   Activity Trail
    

### Phase 4 — Compliance

*   Audits
    
*   Findings
    
*   Issues
    
*   RCA
    
*   CAPA
    
*   Verification
    
*   Project Compliance Dashboard
    

38\. Final Product Concept
==========================

The Construction MVP should ultimately communicate this simple concept to users:

> **A Project is not just a project record. It is the complete operational and compliance workspace for that project.**

The complete lifecycle is:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   CREATE PROJECT        ↓  CONFIGURE PROJECT        ↓  ADD TEAM        ↓  SELECT APPLICABLE SOPs        ↓  CONFIGURE SOP REQUIREMENTS        ↓  ASSIGN SOPs TO EMPLOYEES        ↓  LEARNING        ↓  QUIZ        ↓  PRACTICAL ASSESSMENT        ↓  QUALIFICATION        ↓  DOCUMENT REQUIREMENTS        ↓  DOCUMENT SUBMISSION        ↓  DOCUMENT REVIEW        ↓  DOCUMENT APPROVAL        ↓  PROJECT EXECUTION        ↓  AUDIT        ↓  COMPLIANCE MONITORING        ↓  ISSUE / DEVIATION        ↓  RCA        ↓  CAPA        ↓  VERIFICATION        ↓  CLOSURE        ↓  PROJECT COMPLIANCE   `

Core Design Principle
---------------------

**SOP Module**

> **Standard + People + Learning + Qualification + Compliance**

**Document Module**

> **Evidence + Control + Review + Version + Traceability**

**Project Module**

> **Applicability + Execution + Monitoring + Compliance**

This separation keeps the MVP clean and also makes the architecture extensible when the platform later expands from **Construction** into **Manufacturing, Quality, Safety, or other industries**.
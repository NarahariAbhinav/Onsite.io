import { useSyncExternalStore } from "react";

/* ---------------------------------- types --------------------------------- */

export type ProjectStatus = "Planning" | "In Progress" | "Completed" | "On Hold" | "Closed";
export type ProjectType = "Residential" | "Commercial" | "Industrial" | "Infrastructure" | "Renovation" | "Other";
export type StepStatus = "Not Started" | "In Progress" | "Completed";
export type IssuePriority = "Low" | "Medium" | "High";
export type IssueStatus = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export type ProjectTeamMember = {
  id: string;
  project_id: string;
  name: string;
  role: string;
  department: string;
  responsibility: string;
  start_date: string;
  status: "Active" | "Inactive";
};

export type Project = {
  id: string;
  name: string;
  code: string;
  location: string;
  lat: number;
  lng: number;
  area: number;
  floors: number;
  flats: number;
  amenities: string[];
  start_date: string;
  end_date: string;
  admin: string;
  status: ProjectStatus;

  // projectpage.md fields:
  project_type?: ProjectType | undefined;
  client?: string | undefined;
  description?: string | undefined;
  project_manager?: string | undefined;
  project_owner?: string | undefined;
  department?: string | undefined;
  actual_start_date?: string | null | undefined;
  actual_end_date?: string | null | undefined;
};

export type SopLifecycleStatus = "Draft" | "In Review" | "Approved" | "Effective" | "Revision" | "Obsolete";

export type SopVersionHistory = {
  version_number: string;
  lifecycle_status: SopLifecycleStatus;
  effective_date?: string | null | undefined;
  revision_reason?: string | null | undefined;
  change_summary?: string | null | undefined;
  author: string;
  created_at: string;
};

export type Sop = {
  id: string;
  name: string;
  code?: string | undefined;
  sop_type?: string | undefined;
  category?: string | undefined;
  process?: string | undefined;
  department: string;
  description: string;
  version_number?: string | undefined;
  lifecycle_status?: SopLifecycleStatus | undefined;
  effective_date?: string | null | undefined;
  owner_name?: string | undefined;
  criticality?: "Low" | "Medium" | "High" | "Critical" | undefined;
  review_frequency_months?: number | undefined;
  purpose?: string | undefined;
  scope?: string | undefined;
  responsibilities?: string | undefined;
  inputs?: string | undefined;
  materials?: string | undefined;
  safety_ppe?: string | undefined;
  expected_output?: string | undefined;
  references?: string | undefined;
  applicable_industries?: string[] | undefined;
  applicable_project_types?: string[] | undefined;
  applicable_roles?: string[] | undefined;
  required_documents?: string[] | undefined;
  version_history?: SopVersionHistory[] | undefined;
};

export type SopStep = {
  id: string;
  sop_id: string;
  step_number: number;
  title: string;
  instructions: string;
  learning_content?: string | undefined; // richer LMS learning text (can include markdown)
};

export type LearningProgressStatus = "Not Started" | "In Progress" | "Completed" | "Overdue";

export type StepReadRecord = {
  step_id: string;
  read_at: string;
};

export type LearningProgress = {
  id: string;
  user_name: string;
  sop_id: string;
  project_id?: string | null | undefined;
  // step-by-step reading progress
  steps_read: StepReadRecord[];  // which steps have been marked as read
  all_steps_read: boolean;       // gate for quiz
  quiz_passed: boolean;
  quiz_score_pct?: number | null | undefined;
  assessment_passed: boolean;
  // weighted progress 0-100
  progress_pct: number;
  status: LearningProgressStatus;
  started_at?: string | null | undefined;
  completed_at?: string | null | undefined;
};

export type ProjectSop = {
  id: string;
  project_id: string;
  sop_id: string;
  assigned_to: string;
  due_date?: string | null | undefined;
  completed_at?: string | null | undefined;
  previous_sop_id?: string | null | undefined;

  // projectpage.md applicability fields:
  applicable_activity?: string | undefined;
  applicable_roles?: string[] | undefined;
  is_mandatory?: boolean | undefined;
  effective_from?: string | undefined;
  completion_requirement?: string | undefined;
  assessment_required?: boolean | undefined;
  qualification_required?: boolean | undefined;
  assigned_employees?: string[] | undefined;
  remarks?: string | undefined;
};

export type StepExecution = {
  id: string;
  project_sop_id: string;
  step_id: string;
  status: StepStatus;
  comments?: string | null | undefined;
  completed_by?: string | null | undefined;
  completed_at?: string | null | undefined;
};

export type DocumentCategory =
  | "Drawings"
  | "Approvals"
  | "ITP"
  | "MTC"
  | "Pour Cards"
  | "General";

export type DocumentType =
  | "Drawing"
  | "Specification"
  | "Certificate"
  | "Quality Report"
  | "Commercial"
  | "Method Statement"
  | "Approval / Permit"
  | "Safety / EHS";

export type DocumentComplianceStatus =
  | "Pending"
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Revision Required"
  | "Expired";

export type DocumentControlStatus =
  | "Controlled"
  | "Reference Only"
  | "Obsolete"
  | "Draft";

export type DocumentRevision = {
  revision: string;
  revised_by: string;
  revised_at: string;
  change_summary: string;
  file_name?: string | null;
};

export type DocumentActivityLog = {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  notes?: string | null;
};

export type DocumentMaster = {
  id: string;
  code: string;
  name: string;
  document_type: DocumentType;
  category: DocumentCategory;
  description: string;
  is_mandatory_default: boolean;
  applicable_industries: string[];
  applicable_project_types: string[];
  applicable_departments: string[];
  requires_approval: boolean;
  requires_expiry: boolean;
  requires_revision: boolean;
  review_frequency_months?: number;
};

export type Document = {
  id: string;
  project_id: string;
  sop_id: string | null;
  step_id: string | null;
  document_name: string;
  file_name: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  required: boolean;
  assigned_to?: string | null | undefined;
  due_date?: string | null | undefined;

  // Phase 6 & BRD: Controlled Document Governance & Compliance Engine
  document_master_id?: string | undefined;
  document_code?: string | undefined;
  category?: DocumentCategory | undefined;
  document_type?: DocumentType | undefined;
  status?: DocumentComplianceStatus | undefined;
  revision?: string | undefined;
  control_status?: DocumentControlStatus | undefined;
  watermark_text?: string | undefined;
  issued_to?: string | undefined;
  approved_by?: string | null | undefined;
  submission_date?: string | null | undefined;
  expiry_date?: string | null | undefined;
  assigned_reviewer?: string | null | undefined;
  reviewed_by?: string | null | undefined;
  reviewed_at?: string | null | undefined;
  review_notes?: string | null | undefined;
  file_size_bytes?: number | null | undefined;
  revision_history?: DocumentRevision[] | undefined;
  activity_log?: DocumentActivityLog[] | undefined;
};

export type IssueComment = {
  id: string;
  author: string;
  text: string;
  created_at: string;
};

export type FiveWhys = {
  why_1: string;
  why_2: string;
  why_3: string;
  why_4: string;
  root_cause: string;
};

export type IshikawaFactors = {
  man?: string;
  machine?: string;
  method?: string;
  material?: string;
  measurement?: string;
  milieu?: string;
};

export type CapaStage =
  | "1_Containment"
  | "2_RootCause"
  | "3_ActionPlan"
  | "4_Verification"
  | "5_Effectiveness";

export type Issue = {
  id: string;
  project_id: string;
  sop_id: string | null;
  step_id: string | null;
  title: string;
  description: string;
  priority: IssuePriority;
  assigned_to: string;
  status: IssueStatus;
  attachment: string | null;
  created_by: string;
  created_at: string;
  assigned_at?: string | null | undefined;
  in_progress_at?: string | null | undefined;
  in_progress_by?: string | null | undefined;
  resolved_at: string | null;
  resolved_by?: string | null | undefined;
  resolution_notes?: string | null | undefined;
  resolution_attachment?: string | null | undefined;
  closed_at?: string | null | undefined;
  closed_by?: string | null | undefined;
  closing_remarks?: string | null | undefined;
  comments: IssueComment[];

  // 5-Stage CAPA Lifecycle Engine
  capa_stage?: CapaStage | undefined;
  containment_action?: string | null | undefined;
  containment_by?: string | null | undefined;
  containment_at?: string | null | undefined;
  five_whys?: FiveWhys | null | undefined;
  ishikawa?: IshikawaFactors | null | undefined;
  corrective_action?: string | null | undefined;
  preventive_action?: string | null | undefined;
  capa_owner?: string | null | undefined;
  capa_target_date?: string | null | undefined;
  verification_evidence?: string | null | undefined;
  verification_notes?: string | null | undefined;
  verified_by?: string | null | undefined;
  verified_at?: string | null | undefined;
  recurrence_observed?: boolean | null | undefined;
  effectiveness_notes?: string | null | undefined;
};

export type ActivityType =
  | "step_completed"
  | "step_started"
  | "issue_created"
  | "issue_status"
  | "doc_uploaded"
  | "sop_assigned";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  project_id: string | null;
  sop_id?: string | null | undefined;
  step_id?: string | null | undefined;
  issue_id?: string | null | undefined;
  title: string;
  detail?: string | undefined;
  user: string;
  timestamp: string;
};

export type QuizQuestion = {
  id: string;
  order_index: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  marks: number;
};

export type Quiz = {
  id: string;
  sop_id: string;
  title: string;
  passing_pct: number;
  max_attempts: number;
  questions: QuizQuestion[];
  quiz_code?: string | undefined;
  description?: string | undefined;
  time_limit_mins?: number | undefined;
  status?: "Active" | "Draft" | "Inactive" | undefined;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  sop_id: string;
  user_name: string;
  attempt_number: number;
  score_pct: number;
  passed: boolean;
  submitted_answers: Record<string, string>;
  is_locked: boolean;
  timestamp: string;
};

export type AssessmentCriterion = {
  id: string;
  name: string;
  result?: "Pass" | "Fail" | null | undefined;
};

export type PracticalAssessment = {
  id: string;
  sop_id: string;
  title: string;
  scenario_description: string;
  expected_outputs: string;
  user_name: string;
  assessment_type?: "Simulation" | "Assignment" | "Scenario-based" | "Evaluator-led" | undefined;
  evaluator_name?: string | undefined;
  due_date?: string | undefined;
  criteria?: AssessmentCriterion[] | undefined;
  submitted_data?: string;
  evaluator_score?: number | null;
  passed?: boolean | null;
  evaluator_feedback?: string | null;
  status: "Not Submitted" | "Under Evaluation" | "Passed" | "Failed";
  submitted_at?: string;
  evaluated_at?: string;
};

export type EmployeeQualification = {
  id: string;
  user_name: string;
  sop_id: string;
  sop_title: string;
  version_number: string;
  quiz_score_pct: number;
  assessment_score?: number | null;
  certificate_number: string;
  issued_at: string;
  expires_at: string;
  status: "Qualified" | "In Progress" | "Locked" | "Expired";
};

export type AuditFindingSeverity = "Low" | "Medium" | "High" | "Critical";

export type AuditFinding = {
  id: string;
  audit_id: string;
  step_id?: string;
  step_title: string;
  passed: boolean;
  status: "Compliant" | "Minor Deviation" | "Major Non-Conformance" | "Critical Safety Failure";
  observation: string;
  severity: AuditFindingSeverity;
  corrective_action_required?: string;
  ncr_id?: string;
};

export type AuditStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
export type AuditType =
  | "Internal QA/QC Audit"
  | "Statutory Safety Audit"
  | "Client Compliance Audit"
  | "Process Adherence Audit";

export type AuditRecord = {
  id: string;
  audit_number: string;
  title: string;
  audit_type: AuditType;
  project_id: string;
  project_name: string;
  sop_id: string;
  sop_name: string;
  sop_version: string;
  auditor_name: string;
  lead_auditee: string;
  scheduled_date: string;
  completed_date?: string | null;
  status: AuditStatus;
  overall_score?: number | null;
  passed?: boolean | null;
  findings: AuditFinding[];
  summary_notes?: string | null;
  created_at: string;
};

export type SiteflowState = {
  projects: Project[];
  sops: Sop[];
  steps: SopStep[];
  projectSops: ProjectSop[];
  executions: StepExecution[];
  documents: Document[];
  issues: Issue[];
  activities: ActivityItem[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  assessments: PracticalAssessment[];
  qualifications: EmployeeQualification[];
  audits: AuditRecord[];
  // LMS
  learningProgress: LearningProgress[];
  // Document Governance Master Register
  documentMasters: DocumentMaster[];
  // Project Workspace Teams
  projectTeamMembers: ProjectTeamMember[];
};

export const CURRENT_USER = { name: "R. Menon", role: "Project Admin" };
export const PEOPLE = [
  "R. Menon",
  "A. Sharma",
  "Quality Manager",
  "Site Manager",
  "K. Iyer",
  "S. Deshmukh",
];
export const DEPARTMENTS = ["Civil", "Electrical", "Safety", "Plumbing", "Finishing"];
export const AMENITY_OPTIONS = [
  "Swimming Pool",
  "Gym",
  "Club House",
  "Children's Play Area",
  "Parking",
  "Landscaped Garden",
  "Power Backup",
];

/* ---------------------------------- seed ---------------------------------- */

let idc = 1000;
export const nextId = (p: string) => `${p}-${++idc}`;

type SopSeed = { name: string; department: string; description: string; steps: [string, string][] };

const SOP_SEEDS: SopSeed[] = [
  {
    name: "Excavation SOP",
    department: "Civil",
    description: "Safe and accurate excavation of foundation trenches as per approved drawings.",
    steps: [
      ["Site clearance & marking", "Clear vegetation and debris, mark trench lines with lime as per layout drawing."],
      ["Underground utility check", "Verify absence of buried cables/pipes with the utility drawing and detector."],
      ["Excavation to level", "Excavate in layers to the specified depth; maintain side slopes and shoring."],
      ["Dewatering", "Install pumps if groundwater is encountered; keep pit dry before further work."],
      ["Bed level survey", "Record reduced levels and get surveyor sign-off before PCC."],
    ],
  },
  {
    name: "RCC Work SOP",
    department: "Civil",
    description: "Reinforced concrete works covering shuttering, reinforcement, pour and curing.",
    steps: [
      ["Shuttering erection", "Erect and align formwork; apply shuttering oil and check plumb/level."],
      ["Reinforcement placement", "Place bars per BBS, maintain cover blocks and lap lengths."],
      ["Pre-pour inspection", "Joint inspection checklist signed by engineer and quality team."],
      ["Concrete pour", "Pour approved mix design, place in layers, vibrate without segregation."],
      ["Concrete quality check", "Take cube samples, record slump and batch details."],
      ["Curing", "Cure for a minimum of 7 days by ponding or wet hessian."],
      ["De-shuttering", "Remove formwork after specified period and inspect surface finish."],
    ],
  },
  {
    name: "Brickwork SOP",
    department: "Civil",
    description: "Masonry construction with line, level and correct mortar proportions.",
    steps: [
      ["Brick soaking", "Soak bricks in water for a minimum of 2 hours before laying."],
      ["Mortar preparation", "Prepare 1:6 cement mortar; use within 30 minutes of mixing."],
      ["Course laying", "Lay courses to line, level and plumb; stagger vertical joints."],
      ["Openings & lintels", "Provide openings as per drawing and cast lintels where required."],
      ["Curing & inspection", "Cure walls for 7 days and inspect for verticality and joint finish."],
    ],
  },
  {
    name: "Plastering SOP",
    department: "Finishing",
    description: "Internal and external plaster with proper surface preparation and curing.",
    steps: [
      ["Surface preparation", "Rake joints, remove loose mortar and wet the surface thoroughly."],
      ["Level dots & screeds", "Fix dots and screeds to achieve required thickness and plumb."],
      ["Base coat application", "Apply base coat in specified proportion and thickness."],
      ["Finish coat & curing", "Apply finish coat, straighten, and cure for 7 days."],
    ],
  },
  {
    name: "Waterproofing SOP",
    department: "Civil",
    description: "Waterproofing of terraces, toilets and sunken slabs with mandatory ponding test.",
    steps: [
      ["Surface cleaning", "Clean and repair the substrate, fill honeycombs and cracks."],
      ["Primer application", "Apply primer coat uniformly and allow to dry."],
      ["Membrane / coating", "Apply the approved waterproofing system with correct overlaps."],
      ["Ponding test", "Pond water for 48 hours and record any seepage observed."],
      ["Protective screed", "Lay protective screed over the tested membrane."],
    ],
  },
  {
    name: "Electrical Conduiting SOP",
    department: "Electrical",
    description: "Concealed conduiting and wiring works as per approved electrical layout.",
    steps: [
      ["Layout marking", "Mark switch, socket and DB positions per approved drawing."],
      ["Conduit laying", "Lay conduits with proper bends; fix securely before pour/plaster."],
      ["Wiring & pull test", "Draw cables of specified size; verify continuity."],
      ["Earthing", "Provide earth continuity to all points and DBs."],
      ["Insulation testing", "Megger test each circuit and record readings."],
    ],
  },
  {
    name: "PPE & Site Safety SOP",
    department: "Safety",
    description: "Mandatory personal protective equipment and daily site safety compliance.",
    steps: [
      ["Toolbox talk", "Conduct daily toolbox talk and record attendance."],
      ["PPE issue & check", "Verify helmet, shoes, harness and jacket for all workers at gate."],
      ["Height work permit", "Issue permit and inspect scaffolding/anchors before work at height."],
      ["Housekeeping check", "Clear access routes, cover openings, segregate debris."],
      ["Incident reporting", "Log near-misses and incidents in the safety register the same day."],
    ],
  },
  {
    name: "Plumbing Rough-in SOP",
    department: "Plumbing",
    description: "Concealed plumbing lines with pressure testing before closure.",
    steps: [
      ["Line marking", "Mark supply and drainage routes per plumbing layout."],
      ["Pipe fixing", "Fix pipes with clamps, maintain slopes for drainage."],
      ["Pressure test", "Pressure test supply lines at specified pressure for 24 hours."],
      ["Closure approval", "Get engineer approval before wall/floor closure."],
    ],
  },
];

const PROJECT_SEEDS: Array<Omit<Project, "id"> & { sopIdx: number[] }> = [
  {
    name: "KNS Clubhouse",
    code: "KNS-101",
    location: "KNS Infrastructure, Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    area: 4.8,
    floors: 3,
    flats: 0,
    amenities: ["Swimming Pool", "Gym", "Club House", "Power Backup"],
    start_date: "2025-01-10",
    end_date: "2026-12-31",
    admin: "R. Menon",
    status: "In Progress",
    sopIdx: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "Plot Development - Phase 2",
    code: "PLT-202",
    location: "Devenahalli, Bengaluru",
    lat: 13.2437,
    lng: 77.7137,
    area: 18.5,
    floors: 0,
    flats: 120,
    amenities: ["Landscaped Garden", "Children's Play Area", "Power Backup"],
    start_date: "2025-04-01",
    end_date: "2027-03-31",
    admin: "A. Sharma",
    status: "In Progress",
    sopIdx: [0, 1, 4, 6],
  },
  {
    name: "Cricket Ground Sports Complex",
    code: "CGS-303",
    location: "Sarjapur Road, Bengaluru",
    lat: 12.9249,
    lng: 77.6841,
    area: 12.0,
    floors: 2,
    flats: 0,
    amenities: ["Children's Play Area", "Parking", "Power Backup"],
    start_date: "2025-06-15",
    end_date: "2026-10-31",
    admin: "K. Iyer",
    status: "In Progress",
    sopIdx: [0, 2, 4, 6, 7],
  },
  {
    name: "Green Valley Residency",
    code: "GVR-101",
    location: "Whitefield, Bengaluru",
    lat: 12.9698,
    lng: 77.75,
    area: 6.5,
    floors: 14,
    flats: 224,
    amenities: ["Swimming Pool", "Gym", "Club House", "Children's Play Area", "Parking"],
    start_date: "2025-03-01",
    end_date: "2027-06-30",
    admin: "R. Menon",
    status: "In Progress",
    sopIdx: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "Sunrise Towers",
    code: "SRT-204",
    location: "Kharadi, Pune",
    lat: 18.5515,
    lng: 73.9385,
    area: 3.2,
    floors: 22,
    flats: 176,
    amenities: ["Gym", "Parking", "Power Backup"],
    start_date: "2025-08-15",
    end_date: "2027-12-15",
    admin: "A. Sharma",
    status: "In Progress",
    sopIdx: [0, 1, 5, 6, 7],
  },
  {
    name: "ABC Heights",
    code: "ABC-310",
    location: "Gachibowli, Hyderabad",
    lat: 17.4401,
    lng: 78.3489,
    area: 2.1,
    floors: 9,
    flats: 72,
    amenities: ["Club House", "Parking", "Landscaped Garden"],
    start_date: "2026-01-10",
    end_date: "2027-09-30",
    admin: "K. Iyer",
    status: "Planning",
    sopIdx: [0, 1, 6, 4],
  },
];

export const DOCUMENT_MASTERS_SEED: DocumentMaster[] = [
  {
    id: "master-doc-1",
    code: "DOC-001",
    name: "Approved Structural Drawing",
    document_type: "Drawing",
    category: "Drawings",
    description: "Good-for-construction (GFC) stamped structural drawings with revision sign-off.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential", "Infrastructure"],
    applicable_project_types: ["High-Rise Residential", "Commercial EPC", "Precast"],
    applicable_departments: ["Civil"],
    requires_approval: true,
    requires_expiry: false,
    requires_revision: true,
    review_frequency_months: 6,
  },
  {
    id: "master-doc-2",
    code: "DOC-002",
    name: "Bill of Quantities (BOQ)",
    document_type: "Commercial",
    category: "General",
    description: "Itemized material quantities, work package cost baselines, and milestone rate cards.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise Residential", "Villa Plotting", "Commercial EPC"],
    applicable_departments: ["Civil", "Electrical", "Plumbing"],
    requires_approval: true,
    requires_expiry: false,
    requires_revision: true,
    review_frequency_months: 12,
  },
  {
    id: "master-doc-3",
    code: "DOC-003",
    name: "Concrete Mix Design & Batching Sheet",
    document_type: "Specification",
    category: "Drawings",
    description: "Lab-tested design mix for M25/M30/M35 concrete with water-cement ratio and slump limits.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise Residential", "Precast"],
    applicable_departments: ["Civil"],
    requires_approval: true,
    requires_expiry: true,
    requires_revision: true,
    review_frequency_months: 6,
  },
  {
    id: "master-doc-4",
    code: "DOC-004",
    name: "Material Test Certificate (MTC - Steel / Cement)",
    document_type: "Certificate",
    category: "MTC",
    description: "Mill test certificate verifying yield strength, elongation, and chemical composition per IS 1786.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential", "Infrastructure"],
    applicable_project_types: ["High-Rise Residential", "Villa Plotting", "Commercial EPC"],
    applicable_departments: ["Civil"],
    requires_approval: true,
    requires_expiry: true,
    requires_revision: false,
    review_frequency_months: 3,
  },
  {
    id: "master-doc-5",
    code: "DOC-005",
    name: "Inspection Report & Pour Card",
    document_type: "Quality Report",
    category: "Pour Cards",
    description: "Multi-point sign-off before, during, and after concrete placement including rebar cover verification.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise Residential", "Precast"],
    applicable_departments: ["Civil"],
    requires_approval: true,
    requires_expiry: false,
    requires_revision: false,
    review_frequency_months: 1,
  },
  {
    id: "master-doc-6",
    code: "DOC-006",
    name: "Safe Work Method Statement (SWMS)",
    document_type: "Method Statement",
    category: "ITP",
    description: "Step-by-step risk assessment, hazard control hierarchy, and PPE directives for high-risk work.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential", "Infrastructure"],
    applicable_project_types: ["High-Rise Residential", "Commercial EPC"],
    applicable_departments: ["Safety", "Civil"],
    requires_approval: true,
    requires_expiry: false,
    requires_revision: true,
    review_frequency_months: 12,
  },
  {
    id: "master-doc-7",
    code: "DOC-007",
    name: "Statutory Building Permit & Fire NOC",
    document_type: "Approval / Permit",
    category: "Approvals",
    description: "Municipal sanction plan, commencement certificate, and Fire Department NOC compliance.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise Residential", "Villa Plotting", "Commercial EPC"],
    applicable_departments: ["Civil"],
    requires_approval: true,
    requires_expiry: true,
    requires_revision: true,
    review_frequency_months: 12,
  },
  {
    id: "master-doc-8",
    code: "DOC-008",
    name: "Environmental Health & Safety (EHS) Plan",
    document_type: "Safety / EHS",
    category: "ITP",
    description: "Project-level EHS emergency protocol, first aid stations, toolbox talk cadence, and waste disposal.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential", "Infrastructure"],
    applicable_project_types: ["High-Rise Residential", "Commercial EPC"],
    applicable_departments: ["Safety"],
    requires_approval: true,
    requires_expiry: false,
    requires_revision: true,
    review_frequency_months: 12,
  },
  {
    id: "master-doc-9",
    code: "DOC-009",
    name: "Waterproofing 48-Hour Ponding Test Certificate",
    document_type: "Certificate",
    category: "General",
    description: "Hydraulic ponding test inspection log for sunken slabs, podiums, and terrace membrane barriers.",
    is_mandatory_default: false,
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise Residential"],
    applicable_departments: ["Civil", "Finishing"],
    requires_approval: true,
    requires_expiry: true,
    requires_revision: false,
    review_frequency_months: 6,
  },
  {
    id: "master-doc-10",
    code: "DOC-010",
    name: "MEP High-Voltage Continuity & Megger Test Log",
    document_type: "Quality Report",
    category: "ITP",
    description: "Insulation resistance readings and earth pit continuity resistance values verified prior to charging.",
    is_mandatory_default: true,
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise Residential", "Commercial EPC"],
    applicable_departments: ["Electrical"],
    requires_approval: true,
    requires_expiry: true,
    requires_revision: false,
    review_frequency_months: 6,
  },
];

const DOC_NAMES = DOCUMENT_MASTERS_SEED.map((m) => m.name);

function buildSeed(): SiteflowState {
  const sops: Sop[] = [];
  const steps: SopStep[] = [];
  const codes = ["SOP-001", "SOP-002", "SOP-003", "SOP-004", "SOP-005", "SOP-006", "SOP-007", "SOP-008"];
  const categories = [
    "Civil Works",
    "Civil Works",
    "Civil Works",
    "Finishing",
    "Quality",
    "Electrical & MEP",
    "Safety",
    "Electrical & MEP",
  ];
  const processes = [
    "Substructure Excavation & Shoring",
    "RCC Superstructure Concreting",
    "Masonry & Blockwork",
    "Internal & External Plastering",
    "Subgrade & Terrace Waterproofing",
    "Concealed Conduit & Wiring",
    "HSE & Personal Protective Equipment",
    "Plumbing Piping & Rough-in",
  ];
  const owners = [
    "A. Sharma",
    "Quality Manager",
    "A. Sharma",
    "K. Iyer",
    "Quality Manager",
    "S. Deshmukh",
    "Safety Officer",
    "K. Iyer",
  ];
  const criticalities: Array<"Low" | "Medium" | "High" | "Critical"> = [
    "High",
    "Critical",
    "Medium",
    "Medium",
    "Critical",
    "High",
    "Critical",
    "Medium",
  ];

  SOP_SEEDS.forEach((s, i) => {
    const sopId = `sop-${i + 1}`;
    sops.push({
      id: sopId,
      name: s.name,
      code: codes[i] || `SOP-00${i + 1}`,
      sop_type: "Standard Operating Procedure",
      category: categories[i] || "Civil Works",
      process: processes[i] || "Site Execution",
      department: s.department,
      description: s.description,
      version_number: "V2.0",
      lifecycle_status: "Effective",
      owner_name: owners[i] || "Quality Manager",
      criticality: criticalities[i] || "Medium",
      review_frequency_months: 12,
      effective_date: "2026-05-01T09:00:00",
      purpose: `Standardize ISO 9001-compliant execution, quality verification, and safety adherence for ${s.name.toLowerCase()} across all construction projects.`,
      scope: "Mandatory across all active construction sites, subcontractors, engineering supervisors, and QA/QC inspection leads.",
      responsibilities: "Project Engineer (Execution), Quality Inspector (Hold-point Sign-off), Safety Officer (Permits & PPE)",
      inputs: "Approved architectural/structural drawings, survey levels, concrete mix design approvals, BBS schedules.",
      materials: "Specified grade cement, approved river sand/M-sand, steel rebars (Fe500D), shuttering oil, curing compounds, PVC spacers.",
      safety_ppe: "Industrial safety helmet (IS 2925), steel toe boots, high-vis vest, protective goggles, 3M dust mask, full-body safety harness.",
      expected_output: "Zero defect handover, 100% digital checklist compliance, signed pour/inspection card, zero lost-time injury.",
      references: "IS 456:2000, IS 1200, NBC 2016 Part 7, ISO 9001:2015 Clause 7.5 & 8.5",
      applicable_industries: ["Commercial Construction", "Residential High-Rise", "Infrastructure"],
      applicable_project_types: ["High-Rise Residential", "Villa Plotting", "Commercial EPC"],
      applicable_roles: ["Site Engineer", "Quality Inspector", "Safety Officer", "Subcontractor Foreman"],
      required_documents: ["Approved Structural Drawings", "Concrete Mix Design Approval", "Safety Compliance Certificate"],
      version_history: [
        {
          version_number: "V1.0",
          lifecycle_status: "Obsolete",
          created_at: "2026-01-10T10:00:00",
          author: "A. Sharma",
          revision_reason: "Initial organizational standard release.",
          change_summary: "Baseline procedure and general site instructions.",
        },
        {
          version_number: "V2.0",
          lifecycle_status: "Effective",
          effective_date: "2026-05-01T09:00:00",
          created_at: "2026-05-01T09:00:00",
          author: "Quality Manager",
          revision_reason: "Integrated mandatory 5-stage CAPA and digital checklist controls.",
          change_summary: "Updated inspection hold-points and material verification gates.",
        },
      ],
    });
    s.steps.forEach(([title, instructions], j) => {
      steps.push({
        id: `${sopId}-step-${j + 1}`,
        sop_id: sopId,
        step_number: j + 1,
        title,
        instructions,
      });
    });
  });

  const projects: Project[] = [];
  const projectSops: ProjectSop[] = [];
  const executions: StepExecution[] = [];
  const documents: Document[] = [];

  const projectTeamMembers: ProjectTeamMember[] = [];

  PROJECT_SEEDS.forEach((p, pi) => {
    const projectId = `prj-${pi + 1}`;
    const { sopIdx, ...rest } = p;
    projects.push({
      id: projectId,
      project_type: (pi % 2 === 0 ? "Commercial" : "Residential") as ProjectType,
      client: pi === 0 ? "KNS Infrastructure Ltd" : pi === 1 ? "Devenahalli Land Corp" : "Prestige Group",
      project_manager: p.admin,
      project_owner: "Central QA/QC Directorate",
      department: "Civil & Infrastructure",
      description: `Comprehensive multi-phase construction project located at ${p.location}.`,
      ...rest,
    });

    // Seed project team members
    const teamRoles = [
      { role: "Site Engineer", dept: "Civil", resp: "Daily on-site execution, alignment, and level checks" },
      { role: "QA/QC Inspector", dept: "Quality", resp: "Pour card sign-offs, cube testing, slump verification" },
      { role: "Safety Officer", dept: "Safety", resp: "Work-at-height permits and scaffolding checks" },
      { role: "Site Supervisor", dept: "Civil", resp: "Workforce coordination and material receipt" },
      { role: "Project Manager", dept: "Management", resp: "Milestone scheduling and resource management" },
    ];
    teamRoles.forEach((r, ri) => {
      projectTeamMembers.push({
        id: `tm-${pi + 1}-${ri + 1}`,
        project_id: projectId,
        name: PEOPLE[(pi + ri) % PEOPLE.length] ?? "R. Menon",
        role: r.role,
        department: r.dept,
        responsibility: r.resp,
        start_date: p.start_date,
        status: "Active",
      });
    });

    sopIdx.forEach((si, k) => {
      const psId = `ps-${pi + 1}-${k + 1}`;
      projectSops.push({
        id: psId,
        project_id: projectId,
        sop_id: `sop-${si + 1}`,
        assigned_to: PEOPLE[(pi + k) % PEOPLE.length] ?? "R. Menon",
        due_date: k === 0 ? "2026-06-15" : k === 1 ? "2026-08-30" : "2026-11-20",
        is_mandatory: k < 5,
        applicable_activity: sops[si]?.process || "Site Execution",
        applicable_roles: ["Site Engineer", "Supervisor", "QA/QC Inspector"],
        effective_from: p.start_date,
        completion_requirement: "100% Reading + Passing Quiz + Practical Sign-off",
        assessment_required: true,
        qualification_required: true,
        assigned_employees: [
          PEOPLE[(pi + k) % PEOPLE.length] ?? "R. Menon",
          PEOPLE[(pi + k + 1) % PEOPLE.length] ?? "A. Sharma",
        ],
      });
      const sopSteps = steps.filter((s) => s.sop_id === `sop-${si + 1}`);
      // deterministic progress: earlier SOPs further along; planning projects barely started
      const done = pi === 2 ? (k === 0 ? 2 : 0) : Math.max(0, Math.min(sopSteps.length, sopSteps.length - k));
      sopSteps.forEach((st, idx) => {
        const status: StepStatus =
          idx < done ? "Completed" : idx === done && done < sopSteps.length ? "In Progress" : "Not Started";
        executions.push({
          id: `ex-${psId}-${idx + 1}`,
          project_sop_id: psId,
          step_id: st.id,
          status,
          completed_by: status === "Completed" ? (PEOPLE[(idx + pi) % PEOPLE.length] ?? "R. Menon") : undefined,
          completed_at: status === "Completed" ? `2026-0${(idx % 8) + 1}-1${(idx % 9)}T10:${(idx * 7) % 60 < 10 ? "0" : ""}${(idx * 7) % 60}:00` : undefined,
        });
      });

      // one SOP-scoped document requirement per assigned SOP
      const uploaded = k % 2 === 0;
      const sopName = sops[si]?.name ?? "SOP";
      const uploadedBy = uploaded ? (PEOPLE[k % PEOPLE.length] ?? "R. Menon") : null;
      documents.push({
        id: `doc-${psId}`,
        project_id: projectId,
        sop_id: `sop-${si + 1}`,
        step_id: null,
        document_master_id: "master-doc-5",
        document_name: `${sopName} — Inspection Record`,
        document_type: "Quality Report",
        category: "Pour Cards",
        status: uploaded ? "Approved" : "Pending",
        file_name: uploaded ? `${sopName.toLowerCase().replace(/\s+/g, "-")}-record.pdf` : null,
        file_size_bytes: uploaded ? 2450000 : null,
        uploaded_by: uploadedBy,
        uploaded_at: uploaded ? "2026-05-12T09:20:00" : null,
        submission_date: uploaded ? "2026-05-12T09:20:00" : null,
        required: true,
        assigned_to: PEOPLE[(pi + k) % PEOPLE.length] ?? "R. Menon",
        assigned_reviewer: "Quality Manager",
        reviewed_by: uploaded ? "Quality Manager" : undefined,
        reviewed_at: uploaded ? "2026-05-14T11:00:00" : undefined,
        review_notes: uploaded ? "Verified compliance with ISO 9001 quality criteria." : undefined,
        due_date: "2026-08-30",
        control_status: uploaded ? "Controlled" : "Draft",
        watermark_text: uploaded ? "CONTROLLED COPY — ISSUED FOR CONSTRUCTION" : "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION",
        document_code: `DOC-${projectId.toUpperCase().replace("-", "")}-SOP${si + 1}`,
        activity_log: [
          {
            id: `act-${psId}-1`,
            timestamp: "2026-04-01T10:00:00",
            action: "Requirement Inherited from SOP",
            user: "Central QA/QC",
            notes: `Mandatory inspection record for procedure ${sopName}`,
          },
          ...(uploaded
            ? [
                {
                  id: `act-${psId}-2`,
                  timestamp: "2026-05-12T09:20:00",
                  action: "Evidence Submitted",
                  user: uploadedBy || "Site Engineer",
                  notes: "Uploaded signed digital pour card.",
                },
                {
                  id: `act-${psId}-3`,
                  timestamp: "2026-05-14T11:00:00",
                  action: "Quality Verification Completed",
                  user: "Quality Manager",
                  notes: "Approved and issued controlled copy.",
                },
              ]
            : []),
        ],
      });
    });

    DOCUMENT_MASTERS_SEED.forEach((master, di) => {
      // Pick 7 to 9 documents per project
      if ((di + pi) % 5 === 0 && di > 6) return; // skip a couple optional ones

      const uploaded = (di + pi) % 3 !== 0;
      const rev = (di + pi) % 2 === 0 ? "R1" : "R0";
      
      // Realistic compliance status breakdown
      const compStatus: DocumentComplianceStatus = !uploaded
        ? (di % 4 === 0 ? "Pending" : di % 4 === 1 ? "Draft" : "Rejected")
        : (di % 4 === 0 ? "Approved" : di % 4 === 1 ? "Under Review" : di % 4 === 2 ? "Submitted" : "Revision Required");
      
      const controlStatus: DocumentControlStatus =
        compStatus === "Approved" ? "Controlled" : compStatus === "Under Review" ? "Draft" : "Reference Only";

      const watermarkMap: Record<DocumentControlStatus, string> = {
        Controlled: "CONTROLLED COPY — ISSUED FOR CONSTRUCTION",
        "Reference Only": "FOR INFORMATION ONLY — UNCONTROLLED WHEN PRINTED",
        Obsolete: "SUPERSEDED / OBSOLETE — DO NOT USE ON SITE",
        Draft: "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION",
      };

      // Set expiry dates - some expiring in 15 days, some in 45 days, some in 2027
      const expiryDate = master.requires_expiry
        ? (di % 3 === 0 ? "2026-09-18" : di % 3 === 1 ? "2026-10-15" : "2027-03-31")
        : undefined;

      const targetDueDate = `2026-0${(di % 8) + 2}-28`;

      documents.push({
        id: `doc-${projectId}-${di + 1}`,
        project_id: projectId,
        sop_id: null,
        step_id: null,
        document_master_id: master.id,
        document_name: master.name,
        document_code: `${master.code}-${projectId.toUpperCase().replace("-", "")}`,
        category: master.category,
        document_type: master.document_type,
        status: compStatus,
        file_name: uploaded ? `${master.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf` : null,
        file_size_bytes: uploaded ? 1850000 + di * 420000 : null,
        uploaded_by: uploaded ? p.admin : null,
        uploaded_at: uploaded ? "2026-04-02T14:05:00" : null,
        submission_date: uploaded ? "2026-04-02T14:05:00" : null,
        expiry_date: expiryDate,
        required: master.is_mandatory_default,
        assigned_to: PEOPLE[(di + pi) % PEOPLE.length] ?? "R. Menon",
        assigned_reviewer: "Quality Manager",
        reviewed_by: compStatus === "Approved" ? "Quality Manager" : undefined,
        reviewed_at: compStatus === "Approved" ? "2026-04-05T16:00:00" : undefined,
        review_notes: compStatus === "Approved"
          ? "ISO 9001 Clause 7.5 verification complete. Approved for site execution."
          : compStatus === "Rejected"
          ? "Non-conforming test result; does not meet minimum design compressive threshold."
          : compStatus === "Revision Required"
          ? "Update structural notes to reflect column revision C14 before resubmission."
          : undefined,
        due_date: targetDueDate,
        revision: rev,
        control_status: controlStatus,
        watermark_text: watermarkMap[controlStatus],
        issued_to: `${p.name} Engineering & QA Team`,
        approved_by: compStatus === "Approved" ? p.admin : undefined,
        revision_history: rev === "R1" ? [
          {
            revision: "R0",
            revised_by: p.admin,
            revised_at: "2026-02-10T11:00:00",
            change_summary: "Initial baseline submission.",
            file_name: `${master.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-r0.pdf`,
          }
        ] : [],
        activity_log: [
          {
            id: `act-doc-${projectId}-${di + 1}-1`,
            timestamp: "2026-02-01T09:00:00",
            action: "Requirement Configured",
            user: p.admin,
            notes: `Document requirement ${master.code} mapped to ${p.name}`,
          },
          ...(uploaded ? [
            {
              id: `act-doc-${projectId}-${di + 1}-2`,
              timestamp: "2026-04-02T14:05:00",
              action: "Evidence Submitted",
              user: p.admin,
              notes: `Submitted ${rev} version of file for review.`,
            },
            ...(compStatus === "Approved" ? [
              {
                id: `act-doc-${projectId}-${di + 1}-3`,
                timestamp: "2026-04-05T16:00:00",
                action: "Approved & Controlled",
                user: "Quality Manager",
                notes: "Signed off and marked as Controlled Copy for construction.",
              }
            ] : compStatus === "Under Review" ? [
              {
                id: `act-doc-${projectId}-${di + 1}-3`,
                timestamp: "2026-04-03T10:15:00",
                action: "Review Initiated",
                user: "Quality Manager",
                notes: "QA inspection under review.",
              }
            ] : [])
          ] : [])
        ],
      });
    });
  });

  const issues: Issue[] = [
    {
      id: "iss-1",
      project_id: "prj-1",
      sop_id: "sop-2",
      step_id: "sop-2-step-5",
      title: "Concrete cube strength below design mix",
      description:
        "7-day cube results for the 4th floor slab pour are 18% below the target strength. Batch records from the RMC plant need review before the next pour.",
      priority: "High",
      assigned_to: "Quality Manager",
      status: "In Progress",
      attachment: "cube-test-report.jpg",
      created_by: "A. Sharma",
      created_at: "2026-08-18T08:40:00",
      resolved_at: null,
      comments: [
        { id: "c1", author: "Quality Manager", text: "Requested batch slips from the plant.", created_at: "2026-08-18T11:00:00" },
        { id: "c2", author: "R. Menon", text: "Next pour on hold until 28-day results are in.", created_at: "2026-08-19T09:15:00" },
      ],
      capa_stage: "2_RootCause",
      containment_action: "Work halted on column C14; batch plant transit deliveries quarantined; non-destructive rebound hammer tests scheduled.",
      containment_by: "Quality Manager",
      containment_at: "2026-08-18T09:00:00",
      five_whys: {
        why_1: "7-day compressive cube strength fell 18% below M35 requirement.",
        why_2: "Transit mixer batch water-cement ratio was delivered at 0.51 instead of specified 0.44.",
        why_3: "Batch plant aggregate bin moisture sensor drifted +4.2% following monsoon downpour.",
        why_4: "Manual moisture check was omitted prior to morning dispatch run.",
        root_cause: "Absence of automated aggregate moisture sensor calibration gate in batch plant dispatch protocol.",
      },
      ishikawa: {
        man: "Technician skipped morning oven-drying aggregate moisture sample.",
        machine: "Aggregate moisture probe calibration drifted +4.2%.",
        method: "SOP-CIV-002 lacked mandatory moisture compensation lockout.",
        material: "Course aggregate bins saturated from heavy monsoon showers.",
        measurement: "Slump cone test at batch gate was not cross-verified with laboratory slump.",
        milieu: "High atmospheric humidity and heavy overnight rainfall.",
      },
      corrective_action: "Re-calibrate batch plant moisture probe; perform 28-day core test on 4th floor slab.",
      preventive_action: "Revise SOP-CIV-002 to mandate dual digital moisture probe sensors and daily physical oven check.",
      capa_owner: "Quality Manager",
      capa_target_date: "2026-09-15",
    },
    {
      id: "iss-2",
      project_id: "prj-1",
      sop_id: "sop-7",
      step_id: "sop-7-step-3",
      title: "Scaffolding anchors missing at east elevation",
      description: "Two scaffold bays at the east elevation are not tied back to the structure. Height work stopped in that zone.",
      priority: "High",
      assigned_to: "Site Manager",
      status: "Open",
      attachment: "scaffold-east.jpg",
      created_by: "S. Deshmukh",
      created_at: "2026-08-25T07:15:00",
      resolved_at: null,
      comments: [],
    },
    {
      id: "iss-3",
      project_id: "prj-2",
      sop_id: "sop-6",
      step_id: "sop-6-step-2",
      title: "Conduit routing clashes with beam reinforcement",
      description: "Concealed conduit route on 6th floor clashes with beam bottom bars. Needs a coordinated revision from the MEP consultant.",
      priority: "Medium",
      assigned_to: "K. Iyer",
      status: "Assigned",
      attachment: null,
      created_by: "A. Sharma",
      created_at: "2026-08-21T16:30:00",
      resolved_at: null,
      comments: [{ id: "c3", author: "K. Iyer", text: "Consultant markup expected by Friday.", created_at: "2026-08-22T10:00:00" }],
    },
    {
      id: "iss-4",
      project_id: "prj-2",
      sop_id: "sop-1",
      step_id: "sop-1-step-4",
      title: "Groundwater seepage in foundation pit",
      description: "Continuous seepage in the north pit; single pump is insufficient during monsoon hours.",
      priority: "Medium",
      assigned_to: "Site Manager",
      status: "Resolved",
      attachment: null,
      created_by: "R. Menon",
      created_at: "2026-07-04T12:10:00",
      resolved_at: "2026-07-09T17:45:00",
      comments: [{ id: "c4", author: "Site Manager", text: "Second dewatering pump deployed, pit dry.", created_at: "2026-07-09T17:40:00" }],
    },
    {
      id: "iss-5",
      project_id: "prj-3",
      sop_id: "sop-1",
      step_id: "sop-1-step-2",
      title: "Utility drawing not available for site handover",
      description: "Buried cable route drawing pending from the authority; excavation clearance held.",
      priority: "Low",
      assigned_to: "R. Menon",
      status: "Closed",
      attachment: null,
      created_by: "K. Iyer",
      created_at: "2026-06-11T09:00:00",
      resolved_at: "2026-06-20T15:00:00",
      comments: [],
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: "act-1",
      type: "step_completed",
      project_id: "prj-1",
      sop_id: "sop-1",
      title: "Signed off Milestone 1: Raft Rebar Binding & Cover Blocks",
      detail: "Verified clear cover 50mm on all bar chairs.",
      user: "R. Menon",
      timestamp: "2026-06-03T11:30:00",
    },
    {
      id: "act-2",
      type: "issue_created",
      project_id: "prj-1",
      sop_id: "sop-1",
      title: "Logged High Priority NCR",
      detail: "Formwork alignment deviation in Shear Wall SW-4",
      user: "A. Sharma",
      timestamp: "2026-06-04T14:15:00",
    },
    {
      id: "act-3",
      type: "doc_uploaded",
      project_id: "prj-1",
      sop_id: "sop-1",
      title: "Attached Quality Document",
      detail: "Concrete Pour Card & Batch Plant Slip (p1_pour_slip_batch_04.pdf)",
      user: "R. Menon",
      timestamp: "2026-06-05T09:00:00",
    },
    {
      id: "act-4",
      type: "sop_assigned",
      project_id: "prj-2",
      sop_id: "sop-4",
      title: "Assigned SOP: Internal Concealed Conduit & DB Dressing",
      detail: "Assigned to A. Sharma on Sky High Residency",
      user: "R. Menon",
      timestamp: "2026-06-01T10:00:00",
    },
  ];

  const defaultQuizzes: Quiz[] = [
    {
      id: "quiz-sop-1",
      sop_id: "sop-1",
      title: "Excavation Safety, Slope Stability & Shoring Competency Exam",
      passing_pct: 80,
      max_attempts: 3,
      questions: [
        {
          id: "q-sop-1-1",
          order_index: 1,
          question_text: "What is the maximum vertical trench depth permitted before protective shoring or slope battering must be installed?",
          options: ["1.5 meters", "3.0 meters", "5.0 meters", "0.5 meters"],
          correct_answer: "1.5 meters",
          explanation: "As per construction safety standards, excavations exceeding 1.5m require strutted shoring or safe angle of repose battering.",
          marks: 25,
        },
        {
          id: "q-sop-1-2",
          order_index: 2,
          question_text: "Which survey procedure is mandatory to verify safe bearing level before Plain Cement Concrete (PCC) bed casting?",
          options: ["Reduced level survey with auto-level/total station and surveyor sign-off", "Visual inspection by mason", "Tape measurement from tree marker", "Plumb bob check only"],
          correct_answer: "Reduced level survey with auto-level/total station and surveyor sign-off",
          explanation: "PCC bed thickness and invert level must be established using verified benchmarks and auto-level.",
          marks: 25,
        },
        {
          id: "q-sop-1-3",
          order_index: 3,
          question_text: "True or False: Underground utility scanning with cable detectors is optional if the client didn't provide utility drawings.",
          options: ["True", "False"],
          correct_answer: "False",
          explanation: "Underground scanning is strictly mandatory prior to mechanical digging to prevent electric shock or water pipeline ruptures.",
          marks: 25,
        },
        {
          id: "q-sop-1-4",
          order_index: 4,
          question_text: "What is the mandatory protocol when groundwater seepage or pit inundation occurs during excavation?",
          options: ["Deploy submersible slurry pumps to dry pit and inspect slope stability", "Cast PCC directly through standing water", "Backfill pit with loose topsoil", "Stop all work for 30 days"],
          correct_answer: "Deploy submersible slurry pumps to dry pit and inspect slope stability",
          explanation: "Continuous dewatering must keep the pit dry, and banks re-checked for hydrostatic slumping.",
          marks: 25,
        },
      ],
    },
    {
      id: "quiz-sop-2",
      sop_id: "sop-2",
      title: "RCC Quality Control, Placement & Curing Competency Exam",
      passing_pct: 80,
      max_attempts: 3,
      questions: [
        {
          id: "q-sop-2-1",
          order_index: 1,
          question_text: "What is the standard nominal clear cover requirement for RCC columns as per IS 456:2000?",
          options: ["40 mm", "20 mm", "15 mm", "75 mm"],
          correct_answer: "40 mm",
          explanation: "IS 456 Clause 26.4 requires 40mm clear cover for columns to guard rebar against carbonation and corrosion.",
          marks: 25,
        },
        {
          id: "q-sop-2-2",
          order_index: 2,
          question_text: "What on-site quality check must be performed on every transit mixer delivery before concrete discharge?",
          options: ["Slump cone workability test & batch delivery ticket check", "Tensile bar test", "Rebound hammer test", "Soundness test"],
          correct_answer: "Slump cone workability test & batch delivery ticket check",
          explanation: "Slump and batch delivery slip (verifying grade, mix time, and water-cement ratio) must be logged for every load.",
          marks: 25,
        },
        {
          id: "q-sop-2-3",
          order_index: 3,
          question_text: "What is the correct method for operating an internal immersion needle vibrator during concrete placement?",
          options: ["Immerse vertically in 300-500mm lifts without touching formwork or rebar", "Drag needle horizontally along formwork", "Leave vibrator in one spot for over 2 minutes", "Touch needle directly against reinforcement bars"],
          correct_answer: "Immerse vertically in 300-500mm lifts without touching formwork or rebar",
          explanation: "Vertical penetration ensures compaction without segregating aggregate or disturbing rebar bond.",
          marks: 25,
        },
        {
          id: "q-sop-2-4",
          order_index: 4,
          question_text: "What is the minimum mandatory moist curing period for structural concrete using Ordinary Portland Cement (OPC)?",
          options: ["7 days minimum", "24 hours", "3 days", "No curing required if covered"],
          correct_answer: "7 days minimum",
          explanation: "IS 456 specifies at least 7 days moist curing (10 days in dry/hot weather) for hydration and strength development.",
          marks: 25,
        },
      ],
    },
    {
      id: "quiz-sop-7",
      sop_id: "sop-7",
      title: "Site Safety, Fall Protection & PPE Mandatory Qualification",
      passing_pct: 80,
      max_attempts: 3,
      questions: [
        {
          id: "q-sop-7-1",
          order_index: 1,
          question_text: "At what height is a full-body safety harness with dual lanyards mandatory on construction sites?",
          options: ["Above 1.8 meters (6 feet)", "Above 5.0 meters", "Above 10 meters only", "Any elevation above 0.5m"],
          correct_answer: "Above 1.8 meters (6 feet)",
          explanation: "OSHA & Indian safety standards enforce 100% fall protection tying off at 1.8m and above.",
          marks: 25,
        },
        {
          id: "q-sop-7-2",
          order_index: 2,
          question_text: "What document must be formally signed by Safety Officer & Site In-Charge before any worker ascends a scaffolding tower?",
          options: ["Work at Height Permit & Scaffold Green Tag Inspection", "Gate Pass only", "Worker Attendance Register", "Civil drawing receipt"],
          correct_answer: "Work at Height Permit & Scaffold Green Tag Inspection",
          explanation: "Scaffolding must carry a valid inspected green tag and an authorized height permit.",
          marks: 25,
        },
        {
          id: "q-sop-7-3",
          order_index: 3,
          question_text: "True or False: Daily safety toolbox talks must be conducted and signed by all crew members before starting morning shift.",
          options: ["True", "False"],
          correct_answer: "True",
          explanation: "Daily morning briefings ensure hazard awareness, PPE checking, and task-specific precautions.",
          marks: 25,
        },
        {
          id: "q-sop-7-4",
          order_index: 4,
          question_text: "Which PPE item is mandatory for all personnel entering the construction zone without exception?",
          options: ["Safety Helmet (Hard Hat) with chin strap & Steel-toe safety shoes", "Sunglasses and gloves only", "Dust mask only", "Reflective jacket without helmet"],
          correct_answer: "Safety Helmet (Hard Hat) with chin strap & Steel-toe safety shoes",
          explanation: "Standard industrial site PPE requires hard hat, chin strap, and steel-toe safety footwear.",
          marks: 25,
        },
      ],
    },
  ];

  const defaultAssessments: PracticalAssessment[] = [
    {
      id: "prac-sop-1",
      sop_id: "sop-1",
      title: "Excavation Pit Slope Stability & Dewatering Log Simulation",
      scenario_description: "You arrive at Tower A footing trench (depth 3.2m). Overnight rain has accumulated 400mm water, and localized sand slippage is observed along the north face. Outline your immediate containment protocol, pump setup, strutted shoring installation, and surveyor sign-off steps.",
      expected_outputs: "Submission of slope stability verification log, pump discharge record, and engineer sign-off note.",
      user_name: "R. Menon",
      status: "Not Submitted",
    },
    {
      id: "prac-sop-2",
      sop_id: "sop-2",
      title: "RCC Column Pre-Pour Cover Spacer & Slump Observation",
      scenario_description: "During pre-pour inspection of Column C14-C18 (Floor 12), you discover rebar binding wire protruding toward the formwork face and a transit mixer batch with an unrecorded slump of 170mm (specified limit 120 ± 25mm). Document your corrective actions before signing off the pour card.",
      expected_outputs: "Logged non-conformance action, cover spacer replacement photo log, and batch plant rejection/adjustment record.",
      user_name: "R. Menon",
      status: "Not Submitted",
    },
  ];

  const defaultQualifications: EmployeeQualification[] = [
    {
      id: "qual-1",
      user_name: "R. Menon",
      sop_id: "sop-7",
      sop_title: "PPE & Site Safety SOP",
      version_number: "V1.0",
      quiz_score_pct: 100,
      assessment_score: 95,
      certificate_number: "CERT-SAFE-2026-0941",
      issued_at: "2026-01-10",
      expires_at: "2027-01-10",
      status: "Qualified",
    },
  ];

  const defaultAudits: AuditRecord[] = [
    {
      id: "aud-1",
      audit_number: "AUD-2026-001",
      title: "Pre-Concreting & Rebar Shoring Compliance Audit",
      audit_type: "Internal QA/QC Audit",
      project_id: "prj-1",
      project_name: "Godrej Woodsman Tower",
      sop_id: "sop-2",
      sop_name: "RCC Work SOP",
      sop_version: "V1.0",
      auditor_name: "Quality Manager",
      lead_auditee: "R. Menon",
      scheduled_date: "2026-06-12",
      status: "Scheduled",
      findings: [
        {
          id: "fnd-1-1",
          audit_id: "aud-1",
          step_id: "step-2-1",
          step_title: "Pre-pour inspection & cover blocks",
          passed: true,
          status: "Compliant",
          observation: "Nominal cover 40mm maintained using approved concrete spacer blocks. Binding wire ends bent inwards.",
          severity: "Low",
        },
        {
          id: "fnd-1-2",
          audit_id: "aud-1",
          step_id: "step-2-2",
          step_title: "Concrete mix verification",
          passed: true,
          status: "Compliant",
          observation: "Mix grade M35 batch tickets inspected. Slump verified at 125mm.",
          severity: "Low",
        },
      ],
      created_at: "2026-06-05T10:00:00",
    },
    {
      id: "aud-2",
      audit_number: "AUD-2026-002",
      title: "Statutory Health, Safety & PPE Site Audit",
      audit_type: "Statutory Safety Audit",
      project_id: "prj-2",
      project_name: "Sky High Residency",
      sop_id: "sop-7",
      sop_name: "PPE & Site Safety SOP",
      sop_version: "V1.0",
      auditor_name: "S. Deshmukh",
      lead_auditee: "A. Sharma",
      scheduled_date: "2026-06-03",
      completed_date: "2026-06-03T16:30:00",
      status: "Completed",
      overall_score: 92,
      passed: true,
      summary_notes: "Overall scaffolding green tags and safety harness tie-off compliance exceeded mandatory benchmarks. Minor housekeeping reminder issued for basement sump area.",
      findings: [
        {
          id: "fnd-2-1",
          audit_id: "aud-2",
          step_title: "Mandatory personal protective equipment check",
          passed: true,
          status: "Compliant",
          observation: "100% hard hat and safety shoes compliance verified across 48 on-site workers.",
          severity: "Low",
        },
        {
          id: "fnd-2-2",
          audit_id: "aud-2",
          step_title: "Work at height fall protection & scaffold green tag",
          passed: true,
          status: "Compliant",
          observation: "Dual lanyard shock-absorbing harnesses active on scaffolding perimeter at Floor 18.",
          severity: "Low",
        },
        {
          id: "fnd-2-3",
          audit_id: "aud-2",
          step_title: "Excavation pit barricading & edge warnings",
          passed: false,
          status: "Minor Deviation",
          observation: "Barricade tape sagging along east boundary wall; replaced during audit.",
          severity: "Medium",
          corrective_action_required: "Replace sagging barricade tape with rigid timber handrail.",
        },
      ],
      created_at: "2026-06-01T09:00:00",
    },
  ];

  return {
    projects,
    sops,
    steps,
    projectSops,
    executions,
    documents,
    issues,
    activities,
    quizzes: defaultQuizzes,
    quizAttempts: [],
    assessments: defaultAssessments,
    qualifications: defaultQualifications,
    audits: defaultAudits,
    learningProgress: [],
    documentMasters: DOCUMENT_MASTERS_SEED,
    projectTeamMembers,
  };
}

/* --------------------------------- store ---------------------------------- */

const STORAGE_KEY = "siteflow_app_state_v5";

function loadInitialState(): SiteflowState {
  if (typeof window === "undefined") {
    return buildSeed();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.projects) &&
        Array.isArray(parsed.sops) &&
        Array.isArray(parsed.steps)
      ) {
        const seed = buildSeed();
        const existingNames = new Set((parsed.projects ?? []).map((p: any) => p.name));
        const missingProjects = seed.projects.filter((p) => !existingNames.has(p.name));
        const missingPrjIds = new Set(missingProjects.map((p) => p.id));
        const mergedProjects = [...(parsed.projects ?? []), ...missingProjects];
        const mergedProjectSops = [
          ...(parsed.projectSops ?? []),
          ...seed.projectSops.filter((ps) => missingPrjIds.has(ps.project_id)),
        ];
        const missingPsIds = new Set(
          seed.projectSops.filter((ps) => missingPrjIds.has(ps.project_id)).map((ps) => ps.id)
        );
        const mergedExecutions = [
          ...(parsed.executions ?? []),
          ...seed.executions.filter((ex) => missingPsIds.has(ex.project_sop_id)),
        ];
        const mergedDocuments = [
          ...(parsed.documents ?? []),
          ...seed.documents.filter((d) => missingPrjIds.has(d.project_id)),
        ];

        const mergedSops = (parsed.sops ?? []).map((pSop: any, i: number) => {
          const seedMatch = seed.sops.find((s) => s.id === pSop.id) || seed.sops[i % seed.sops.length];
          return {
            ...seedMatch,
            ...pSop,
            code: pSop.code || seedMatch?.code || `SOP-00${i + 1}`,
            category: pSop.category || seedMatch?.category || "Civil Works",
            process: pSop.process || seedMatch?.process || "Site Execution",
            sop_type: pSop.sop_type || seedMatch?.sop_type || "Standard Operating Procedure",
            purpose: pSop.purpose || seedMatch?.purpose,
            scope: pSop.scope || seedMatch?.scope,
            responsibilities: pSop.responsibilities || seedMatch?.responsibilities,
            inputs: pSop.inputs || seedMatch?.inputs,
            materials: pSop.materials || seedMatch?.materials,
            safety_ppe: pSop.safety_ppe || seedMatch?.safety_ppe,
            expected_output: pSop.expected_output || seedMatch?.expected_output,
            references: pSop.references || seedMatch?.references,
            applicable_industries: pSop.applicable_industries || seedMatch?.applicable_industries,
            applicable_project_types: pSop.applicable_project_types || seedMatch?.applicable_project_types,
            applicable_roles: pSop.applicable_roles || seedMatch?.applicable_roles,
            required_documents: pSop.required_documents || seedMatch?.required_documents,
            owner_name: pSop.owner_name || seedMatch?.owner_name,
            criticality: pSop.criticality || seedMatch?.criticality,
            version_history: pSop.version_history || seedMatch?.version_history,
          };
        });

        return {
          projects: mergedProjects,
          sops: mergedSops,
          steps: parsed.steps,
          projectSops: mergedProjectSops,
          executions: mergedExecutions,
          documents: mergedDocuments,
          issues: parsed.issues ?? [],
          activities: parsed.activities ?? [],
          quizzes: parsed.quizzes ?? seed.quizzes,
          quizAttempts: parsed.quizAttempts ?? [],
          assessments: parsed.assessments ?? seed.assessments,
          qualifications: parsed.qualifications ?? seed.qualifications,
          audits: parsed.audits ?? seed.audits,
          learningProgress: parsed.learningProgress ?? [],
          documentMasters:
            parsed.documentMasters && parsed.documentMasters.length > 0
              ? parsed.documentMasters
              : seed.documentMasters,
          projectTeamMembers:
            parsed.projectTeamMembers && parsed.projectTeamMembers.length > 0
              ? parsed.projectTeamMembers
              : seed.projectTeamMembers,
        };
      }
    }
  } catch (e) {
    console.warn("Failed to load SiteFlow state from localStorage", e);
  }
  return buildSeed();
}

function saveState(s: SiteflowState) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn("Failed to save SiteFlow state to localStorage", e);
    }
  }
}

let state: SiteflowState = loadInitialState();
const listeners = new Set<() => void>();

function set(updater: (s: SiteflowState) => SiteflowState) {
  state = updater(state);
  saveState(state);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => state;

export function useSiteflow(): SiteflowState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* --------------------------------- actions -------------------------------- */

export const actions = {
  saveProject(p: Omit<Project, "id"> & { id?: string | undefined | null }) {
    set((s) => {
      if (p.id) {
        return {
          ...s,
          projects: s.projects.map((x) => (x.id === p.id ? ({ ...x, ...p } as Project) : x)),
        };
      }
      const id = nextId("prj");
      const project = { ...p, id } as Project;
      const docs: Document[] = DOC_NAMES.map((dn, i) => ({
        id: nextId("doc"),
        project_id: id,
        sop_id: null,
        step_id: null,
        document_name: dn,
        file_name: null,
        uploaded_by: null,
        uploaded_at: null,
        required: i < 4,
      }));
      return { ...s, projects: [project, ...s.projects], documents: [...s.documents, ...docs] };
    });
  },

  saveSop(
    sop: { id?: string | undefined | null; name: string; department: string; description: string },
    steps: Array<{ id?: string | undefined | null; title: string; instructions: string }>,
  ) {
    let sopId = sop.id ?? nextId("sop");
    set((s) => {
      const record: Sop = { id: sopId, name: sop.name, department: sop.department, description: sop.description };
      const newSteps: SopStep[] = steps.map((st, i) => ({
        id: st.id ?? `${sopId}-step-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
        sop_id: sopId,
        step_number: i + 1,
        title: st.title,
        instructions: st.instructions,
      }));
      return {
        ...s,
        sops: sop.id ? s.sops.map((x) => (x.id === sopId ? record : x)) : [...s.sops, record],
        steps: [...s.steps.filter((x) => x.sop_id !== sopId), ...newSteps],
      };
    });
    return sopId;
  },

  assignSop(project_id: string, sop_id: string, assigned_to: string, due_date?: string | null | undefined) {
    set((s) => {
      const psId = nextId("ps");
      const execs: StepExecution[] = s.steps
        .filter((st) => st.sop_id === sop_id)
        .map((st) => ({ id: nextId("ex"), project_sop_id: psId, step_id: st.id, status: "Not Started" }));
      const sop = s.sops.find((x) => x.id === sop_id);
      const project = s.projects.find((p) => p.id === project_id);
      const doc: Document = {
        id: nextId("doc"),
        project_id,
        sop_id,
        step_id: null,
        document_name: `${sop?.name ?? "SOP"} — Inspection Record`,
        file_name: null,
        uploaded_by: null,
        uploaded_at: null,
        required: true,
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "sop_assigned",
        project_id,
        sop_id,
        title: `Assigned SOP: ${sop?.name ?? "Procedure"}`,
        detail: `Assigned to ${assigned_to} on ${project?.name ?? "Project"}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        projectSops: [...s.projectSops, { id: psId, project_id, sop_id, assigned_to, due_date }],
        executions: [...s.executions, ...execs],
        documents: [...s.documents, doc],
        activities: [act, ...s.activities],
      };
    });
  },

  setStepStatus(executionId: string, status: StepStatus, comments?: string) {
    set((s) => {
      const targetExec = s.executions.find((e) => e.id === executionId);
      const ps = targetExec ? s.projectSops.find((p) => p.id === targetExec.project_sop_id) : null;
      const step = targetExec ? s.steps.find((st) => st.id === targetExec.step_id) : null;
      const sop = ps ? s.sops.find((sp) => sp.id === ps.sop_id) : null;

      let newActivities = s.activities;
      if (targetExec && ps && step) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: status === "Completed" ? "step_completed" : "step_started",
          project_id: ps.project_id,
          sop_id: ps.sop_id,
          step_id: step.id,
          title: status === "Completed" ? `Signed off Milestone ${step.step_number}: ${step.title}` : `Started Milestone ${step.step_number}: ${step.title}`,
          detail: comments || (status === "Completed" ? `Verified compliance for ${sop?.name ?? "procedure"}` : undefined),
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        executions: s.executions.map((e) =>
          e.id === executionId
            ? {
                ...e,
                status,
                comments: comments ?? e.comments,
                completed_by: status === "Completed" ? CURRENT_USER.name : undefined,
                completed_at: status === "Completed" ? new Date().toISOString() : undefined,
              }
            : e,
        ),
        activities: newActivities,
      };
    });
  },

  attachDocument(docId: string, fileName: string) {
    set((s) => {
      const targetDoc = s.documents.find((d) => d.id === docId);
      let newActivities = s.activities;
      if (targetDoc) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "doc_uploaded",
          project_id: targetDoc.project_id,
          sop_id: targetDoc.sop_id,
          title: `Attached Quality Document`,
          detail: `${targetDoc.document_name} (${fileName})`,
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        documents: s.documents.map((d) =>
          d.id === docId
            ? { ...d, file_name: fileName, uploaded_by: CURRENT_USER.name, uploaded_at: new Date().toISOString() }
            : d,
        ),
        activities: newActivities,
      };
    });
  },

  updateProjectSop(
    projectSopId: string,
    updates: Partial<{ assigned_to: string; due_date: string | null; previous_sop_id?: string | null; completed_at?: string | null }>,
  ) {
    set((s) => {
      const targetPs = s.projectSops.find((ps) => ps.id === projectSopId);
      const sop = targetPs ? s.sops.find((x) => x.id === targetPs.sop_id) : null;
      let newActivities = s.activities;

      if (targetPs && updates.assigned_to && updates.assigned_to !== targetPs.assigned_to) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "sop_assigned",
          project_id: targetPs.project_id,
          sop_id: targetPs.sop_id,
          title: `Reassigned SOP Lead: ${sop?.name ?? "Procedure"}`,
          detail: `Lead transferred from ${targetPs.assigned_to} to ${updates.assigned_to}`,
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        projectSops: s.projectSops.map((ps) => (ps.id === projectSopId ? { ...ps, ...updates } : ps)),
        activities: newActivities,
      };
    });
  },

  assignDocument(docId: string, assigned_to: string, due_date?: string | null) {
    set((s) => ({
      ...s,
      documents: s.documents.map((d) => (d.id === docId ? { ...d, assigned_to, due_date } : d)),
    }));
  },

  addProjectDocument(input: {
    project_id: string;
    document_name: string;
    required: boolean;
    sop_id?: string | null;
    file_name?: string | null;
    assigned_to?: string | null;
    due_date?: string | null;
  }) {
    const id = nextId("doc");
    set((s) => {
      let newActivities = s.activities;
      if (input.file_name) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "doc_uploaded",
          project_id: input.project_id,
          sop_id: input.sop_id ?? null,
          title: `Uploaded Document: ${input.document_name}`,
          detail: input.file_name,
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        };
        newActivities = [act, ...s.activities];
      }

      const projCode = input.project_id.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const timestamp = new Date().toISOString();

      return {
        ...s,
        documents: [
          ...s.documents,
          {
            id,
            project_id: input.project_id,
            sop_id: input.sop_id ?? null,
            step_id: null,
            document_name: input.document_name,
            document_code: `DOC-${projCode}-${id.slice(-3)}`,
            document_type: "Quality Report",
            category: "General",
            status: input.file_name ? "Submitted" : "Pending",
            revision: "R0",
            control_status: input.file_name ? "Draft" : "Draft",
            watermark_text: input.file_name
              ? "SUBMITTED FOR QUALITY REVIEW — UNCONTROLLED"
              : "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION",
            file_name: input.file_name ?? null,
            uploaded_by: input.file_name ? CURRENT_USER.name : null,
            uploaded_at: input.file_name ? timestamp : null,
            submission_date: input.file_name ? timestamp : null,
            required: input.required,
            assigned_to: input.assigned_to ?? null,
            due_date: input.due_date ?? null,
            activity_log: [
              {
                id: nextId("act"),
                timestamp,
                action: "Requirement Created",
                user: CURRENT_USER.name,
                notes: `Added requirement to compliance register`,
              },
              ...(input.file_name
                ? [
                    {
                      id: nextId("act"),
                      timestamp,
                      action: "Evidence Submitted",
                      user: CURRENT_USER.name,
                      notes: `Attached file ${input.file_name}`,
                    },
                  ]
                : []),
            ],
          },
        ],
        activities: newActivities,
      };
    });
    return id;
  },

  deleteDocument(docId: string) {
    set((s) => ({
      ...s,
      documents: s.documents.filter((d) => d.id !== docId),
    }));
  },

  deleteProjectDocument(docId: string) {
    set((s) => ({
      ...s,
      documents: s.documents.filter((d) => d.id !== docId),
    }));
  },

  saveDocumentMaster(master: DocumentMaster) {
    set((s) => {
      const exists = s.documentMasters.some((m) => m.id === master.id);
      const updatedMasters = exists
        ? s.documentMasters.map((m) => (m.id === master.id ? master : m))
        : [...s.documentMasters, master];

      const act: ActivityItem = {
        id: nextId("act"),
        project_id: s.projects[0]?.id || "proj-kns-clubhouse",
        type: "doc_uploaded",
        title: exists ? `Updated Document Master: ${master.code}` : `Created Document Master: ${master.code}`,
        detail: `${master.name} (${master.document_type})`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        documentMasters: updatedMasters,
        activities: [act, ...s.activities],
      };
    });
  },

  deleteDocumentMaster(masterId: string) {
    set((s) => ({
      ...s,
      documentMasters: s.documentMasters.filter((m) => m.id !== masterId),
    }));
  },

  configureProjectRequirements(
    projectId: string,
    masterIds: string[],
    defaultAssignee?: string,
    defaultDueDate?: string
  ) {
    set((s) => {
      const project = s.projects.find((p) => p.id === projectId);
      const existingMasterIds = new Set(
        s.documents
          .filter((d) => d.project_id === projectId && d.document_master_id)
          .map((d) => d.document_master_id!)
      );

      const newDocs: Document[] = [];
      const timestamp = new Date().toISOString();
      const projCode = (project?.code || "SITE").toUpperCase().replace(/[^A-Z0-9]/g, "");

      masterIds.forEach((mId) => {
        if (!existingMasterIds.has(mId)) {
          const master = s.documentMasters.find((m) => m.id === mId);
          if (master) {
            const docId = nextId("doc");
            newDocs.push({
              id: docId,
              project_id: projectId,
              sop_id: null,
              step_id: null,
              document_master_id: master.id,
              document_name: master.name,
              document_code: `${master.code}-${projCode}`,
              document_type: master.document_type,
              category: master.category,
              status: "Pending",
              file_name: null,
              uploaded_by: null,
              uploaded_at: null,
              required: master.is_mandatory_default,
              assigned_to: defaultAssignee || project?.admin || CURRENT_USER.name,
              assigned_reviewer: "Quality Manager",
              due_date: defaultDueDate || "2026-08-30",
              revision: "R0",
              control_status: "Draft",
              watermark_text: "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION",
              activity_log: [
                {
                  id: nextId("act"),
                  timestamp,
                  action: "Requirement Configured",
                  user: CURRENT_USER.name,
                  notes: `Mapped requirement from Master standard ${master.code} (${master.name})`,
                },
              ],
            });
          }
        }
      });

      if (newDocs.length === 0) return s;

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: projectId,
        title: `Configured ${newDocs.length} Document Requirements`,
        detail: `Requirements inherited for ${project?.name || "Project"} from Master standards`,
        user: CURRENT_USER.name,
        timestamp,
      };

      return {
        ...s,
        documents: [...s.documents, ...newDocs],
        activities: [act, ...s.activities],
      };
    });
  },

  submitDocumentEvidence(
    docId: string,
    fileName: string,
    fileSizeBytes: number,
    submittedBy: string,
    notes?: string,
    expiryDate?: string
  ) {
    set((s) => {
      const doc = s.documents.find((d) => d.id === docId);
      if (!doc) return s;

      const timestamp = new Date().toISOString();
      const updatedDoc: Document = {
        ...doc,
        file_name: fileName,
        file_size_bytes: fileSizeBytes,
        uploaded_by: submittedBy,
        uploaded_at: timestamp,
        submission_date: timestamp,
        status: "Submitted",
        expiry_date: expiryDate || doc.expiry_date,
        control_status: "Draft",
        watermark_text: "SUBMITTED FOR QUALITY REVIEW — UNCONTROLLED",
        activity_log: [
          ...(doc.activity_log || []),
          {
            id: nextId("act"),
            timestamp,
            action: "Evidence Submitted",
            user: submittedBy,
            notes: notes || `Submitted file ${fileName} for quality verification`,
          },
        ],
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: doc.project_id,
        sop_id: doc.sop_id,
        title: `Document Submitted for Review: ${doc.document_name}`,
        detail: `File: ${fileName} by ${submittedBy}`,
        user: submittedBy,
        timestamp,
      };

      return {
        ...s,
        documents: s.documents.map((d) => (d.id === docId ? updatedDoc : d)),
        activities: [act, ...s.activities],
      };
    });
  },

  reviewProjectDocument(
    docId: string,
    action: "Approved" | "Rejected" | "Revision Required",
    reviewer: string,
    comments: string,
    newRevisionCode?: string
  ) {
    set((s) => {
      const doc = s.documents.find((d) => d.id === docId);
      if (!doc) return s;

      const timestamp = new Date().toISOString();
      const isApproved = action === "Approved";
      const isRejected = action === "Rejected";

      const controlStatus: DocumentControlStatus = isApproved
        ? "Controlled"
        : isRejected
        ? "Reference Only"
        : "Draft";

      const watermarkMap: Record<DocumentControlStatus, string> = {
        Controlled: "CONTROLLED COPY — ISSUED FOR CONSTRUCTION",
        "Reference Only": "NON-CONFORMING / REJECTED — NOT FOR SITE USE",
        Obsolete: "SUPERSEDED / OBSOLETE — DO NOT USE ON SITE",
        Draft: "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION",
      };

      const updatedDoc: Document = {
        ...doc,
        status: action,
        reviewed_by: reviewer,
        reviewed_at: timestamp,
        review_notes: comments,
        control_status: controlStatus,
        watermark_text: watermarkMap[controlStatus],
        approved_by: isApproved ? reviewer : doc.approved_by,
        revision: newRevisionCode || doc.revision || "R0",
        activity_log: [
          ...(doc.activity_log || []),
          {
            id: nextId("act"),
            timestamp,
            action: `Review Verdict: ${action}`,
            user: reviewer,
            notes: comments,
          },
        ],
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: doc.project_id,
        sop_id: doc.sop_id,
        title: `Document Review: ${action} (${doc.document_name})`,
        detail: `Reviewer: ${reviewer}. Notes: ${comments}`,
        user: reviewer,
        timestamp,
      };

      return {
        ...s,
        documents: s.documents.map((d) => (d.id === docId ? updatedDoc : d)),
        activities: [act, ...s.activities],
      };
    });
  },

  reviseProjectDocument(
    docId: string,
    newRevisionCode: string,
    changeSummary: string,
    fileName?: string,
    revisedBy?: string
  ) {
    set((s) => {
      const doc = s.documents.find((d) => d.id === docId);
      if (!doc) return s;

      const timestamp = new Date().toISOString();
      const author = revisedBy || CURRENT_USER.name;

      const prevRev: DocumentRevision = {
        revision: doc.revision || "R0",
        revised_by: author,
        revised_at: timestamp,
        change_summary: changeSummary,
        file_name: doc.file_name,
      };

      const updatedDoc: Document = {
        ...doc,
        revision: newRevisionCode,
        file_name: fileName || doc.file_name,
        uploaded_by: author,
        uploaded_at: timestamp,
        submission_date: timestamp,
        status: "Submitted",
        control_status: "Draft",
        watermark_text: `SUBMITTED REVISION ${newRevisionCode} — UNDER REVIEW`,
        revision_history: [prevRev, ...(doc.revision_history || [])],
        activity_log: [
          ...(doc.activity_log || []),
          {
            id: nextId("act"),
            timestamp,
            action: `Revision ${newRevisionCode} Created`,
            user: author,
            notes: changeSummary,
          },
        ],
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: doc.project_id,
        sop_id: doc.sop_id,
        title: `Document Revised: ${doc.document_name} (${newRevisionCode})`,
        detail: `Change summary: ${changeSummary}`,
        user: author,
        timestamp,
      };

      return {
        ...s,
        documents: s.documents.map((d) => (d.id === docId ? updatedDoc : d)),
        activities: [act, ...s.activities],
      };
    });
  },

  createIssue(input: {
    project_id: string;
    sop_id: string | null;
    step_id: string | null;
    title: string;
    description: string;
    priority: IssuePriority;
    assigned_to: string;
    attachment: string | null;
  }) {
    const id = nextId("iss");
    set((s) => {
      const act: ActivityItem = {
        id: nextId("act"),
        type: "issue_created",
        project_id: input.project_id,
        sop_id: input.sop_id ?? null,
        step_id: input.step_id ?? null,
        issue_id: id,
        title: `Logged ${input.priority} Priority NCR`,
        detail: input.title,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        issues: [
          {
            ...input,
            id,
            status: "Open",
            created_by: CURRENT_USER.name,
            created_at: new Date().toISOString(),
            resolved_at: null,
            comments: [],
          },
          ...s.issues,
        ],
        activities: [act, ...s.activities],
      };
    });
    return id;
  },

  deleteSop(sopId: string) {
    set((s) => {
      const targetSop = s.sops.find((x) => x.id === sopId);
      const affectedProjectSopIds = s.projectSops.filter((ps) => ps.sop_id === sopId).map((ps) => ps.id);
      return {
        ...s,
        sops: s.sops.filter((x) => x.id !== sopId),
        steps: s.steps.filter((st) => st.sop_id !== sopId),
        projectSops: s.projectSops.filter((ps) => ps.sop_id !== sopId),
        executions: s.executions.filter((e) => !affectedProjectSopIds.includes(e.project_sop_id)),
      };
    });
  },

  reviseSop(
    sopId: string,
    revisionReason: string,
    changeSummary: string,
    steps: Array<{ title: string; instructions: string }>
  ) {
    set((s) => {
      const sop = s.sops.find((x) => x.id === sopId);
      if (!sop) return s;
      const currentVer = sop.version_number ?? "V1.0";
      const major = parseInt(currentVer.replace("V", "").split(".")[0] || "1", 10);
      const nextVer = `V${major + 1}.0`;

      const historyItem: SopVersionHistory = {
        version_number: currentVer,
        lifecycle_status: "Obsolete",
        effective_date: sop.effective_date,
        revision_reason: revisionReason,
        change_summary: changeSummary,
        author: CURRENT_USER.name,
        created_at: new Date().toISOString(),
      };

      const updatedSop: Sop = {
        ...sop,
        version_number: nextVer,
        lifecycle_status: "Effective",
        effective_date: new Date().toISOString().split("T")[0],
        version_history: [...(sop.version_history ?? []), historyItem],
      };

      const newSteps: SopStep[] = steps.map((st, i) => ({
        id: `${sopId}-step-v${major + 1}-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
        sop_id: sopId,
        step_number: i + 1,
        title: st.title,
        instructions: st.instructions,
      }));

      const act: ActivityItem = {
        id: nextId("act"),
        type: "step_completed",
        project_id: null,
        sop_id: sopId,
        title: `Issued Major Revision ${nextVer}: ${sop.name}`,
        detail: `Reason: ${revisionReason}. ${changeSummary}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        sops: s.sops.map((x) => (x.id === sopId ? updatedSop : x)),
        steps: [...s.steps.filter((x) => x.sop_id !== sopId), ...newSteps],
        activities: [act, ...s.activities],
      };
    });
  },

  transitionSopLifecycle(sopId: string, targetStatus: SopLifecycleStatus, remarks?: string) {
    set((s) => {
      const sop = s.sops.find((x) => x.id === sopId);
      if (!sop) return s;

      const act: ActivityItem = {
        id: nextId("act"),
        type: "step_completed",
        project_id: null,
        sop_id: sopId,
        title: `Lifecycle Signoff: ${sop.name} transitioned to ${targetStatus}`,
        detail: remarks || `Status changed from ${sop.lifecycle_status ?? "Effective"} to ${targetStatus}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        sops: s.sops.map((x) =>
          x.id === sopId
            ? {
                ...x,
                lifecycle_status: targetStatus,
                effective_date: targetStatus === "Effective" ? new Date().toISOString().split("T")[0] : x.effective_date,
              }
            : x
        ),
        activities: [act, ...s.activities],
      };
    });
  },

  unassignSopFromProject(projectSopId: string) {
    set((s) => {
      const ps = s.projectSops.find((p) => p.id === projectSopId);
      const sop = ps ? s.sops.find((x) => x.id === ps.sop_id) : null;
      let newActivities = s.activities;
      if (ps && sop) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "sop_assigned",
          project_id: ps.project_id,
          sop_id: ps.sop_id,
          title: `Removed SOP: ${sop.name}`,
          detail: `Procedure unassigned from project by ${CURRENT_USER.name}`,
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        projectSops: s.projectSops.filter((p) => p.id !== projectSopId),
        executions: s.executions.filter((e) => e.project_sop_id !== projectSopId),
        activities: newActivities,
      };
    });
  },

  deleteProject(projectId: string) {
    set((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== projectId),
      projectSops: s.projectSops.filter((ps) => ps.project_id !== projectId),
      documents: s.documents.filter((d) => d.project_id !== projectId),
      issues: s.issues.filter((i) => i.project_id !== projectId),
      activities: s.activities.filter((a) => a.project_id !== projectId),
      projectTeamMembers: s.projectTeamMembers.filter((tm) => tm.project_id !== projectId),
    }));
  },

  addProjectTeamMember(member: Omit<ProjectTeamMember, "id">) {
    const id = nextId("tm");
    set((s) => ({
      ...s,
      projectTeamMembers: [...s.projectTeamMembers, { ...member, id }],
    }));
    return id;
  },

  updateProjectTeamMember(id: string, updates: Partial<ProjectTeamMember>) {
    set((s) => ({
      ...s,
      projectTeamMembers: s.projectTeamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  removeProjectTeamMember(id: string) {
    set((s) => ({
      ...s,
      projectTeamMembers: s.projectTeamMembers.filter((m) => m.id !== id),
    }));
  },

  assignSopToProject(config: {
    projectId: string;
    sopId: string;
    assignedTo: string;
    dueDate?: string | null | undefined;
    applicableActivity?: string | undefined;
    applicableRoles?: string[] | undefined;
    isMandatory?: boolean | undefined;
    effectiveFrom?: string | undefined;
    completionRequirement?: string | undefined;
    assessmentRequired?: boolean | undefined;
    qualificationRequired?: boolean | undefined;
    assignedEmployees?: string[] | undefined;
    remarks?: string | undefined;
  }) {
    const id = nextId("ps");
    set((s) => {
      const sop = s.sops.find((x) => x.id === config.sopId);
      const project = s.projects.find((x) => x.id === config.projectId);
      const sopSteps = s.steps.filter((st) => st.sop_id === config.sopId);

      const newExecutions: StepExecution[] = sopSteps.map((st) => ({
        id: nextId("ex"),
        project_sop_id: id,
        step_id: st.id,
        status: "Not Started",
      }));

      const newPs: ProjectSop = {
        id,
        project_id: config.projectId,
        sop_id: config.sopId,
        assigned_to: config.assignedTo,
        due_date: config.dueDate ?? null,
        applicable_activity: config.applicableActivity ?? sop?.process ?? "Site Execution",
        applicable_roles: config.applicableRoles ?? ["Site Engineer", "Supervisor"],
        is_mandatory: config.isMandatory ?? true,
        effective_from: config.effectiveFrom ?? new Date().toISOString().slice(0, 10),
        completion_requirement: config.completionRequirement ?? "100% Reading + Passing Quiz",
        assessment_required: config.assessmentRequired ?? true,
        qualification_required: config.qualificationRequired ?? true,
        assigned_employees: config.assignedEmployees ?? [config.assignedTo],
        remarks: config.remarks,
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "sop_assigned",
        project_id: config.projectId,
        sop_id: config.sopId,
        title: `Assigned SOP: ${sop?.name ?? "Procedure"}`,
        detail: `Configured for ${project?.name ?? "project"} by ${CURRENT_USER.name}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        projectSops: [...s.projectSops, newPs],
        executions: [...s.executions, ...newExecutions],
        activities: [act, ...s.activities],
      };
    });
    return id;
  },

  updateProjectSopApplicability(projectSopId: string, updates: Partial<ProjectSop>) {
    set((s) => ({
      ...s,
      projectSops: s.projectSops.map((ps) => (ps.id === projectSopId ? { ...ps, ...updates } : ps)),
    }));
  },

  updateDocument(docId: string, updates: Partial<Document>) {
    set((s) => ({
      ...s,
      documents: s.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d)),
    }));
  },

  setIssueStatus(id: string, status: IssueStatus) {
    set((s) => {
      const targetIssue = s.issues.find((i) => i.id === id);
      let newActivities = s.activities;
      if (targetIssue) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "issue_status",
          project_id: targetIssue.project_id,
          sop_id: targetIssue.sop_id,
          step_id: targetIssue.step_id,
          issue_id: id,
          title: `Updated NCR status to ${status}`,
          detail: targetIssue.title,
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === id
            ? {
                ...i,
                status,
                resolved_at:
                  status === "Resolved" || status === "Closed" ? i.resolved_at ?? new Date().toISOString() : null,
              }
            : i,
        ),
        activities: newActivities,
      };
    });
  },

  reassignIssue(id: string, assigned_to: string) {
    set((s) => {
      const targetIssue = s.issues.find((i) => i.id === id);
      const timestamp = new Date().toISOString();
      let newActivities = s.activities;
      if (targetIssue) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "issue_status",
          project_id: targetIssue.project_id,
          sop_id: targetIssue.sop_id,
          step_id: targetIssue.step_id,
          issue_id: id,
          title: `Reassigned NCR to ${assigned_to}`,
          detail: `Transferred from ${targetIssue.assigned_to} to ${assigned_to}`,
          user: CURRENT_USER.name,
          timestamp,
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === id
            ? {
                ...i,
                assigned_to,
                assigned_at: timestamp,
                status: i.status === "Open" ? "Assigned" : i.status,
                comments: [
                  ...i.comments,
                  {
                    id: nextId("c"),
                    author: CURRENT_USER.name,
                    text: `Reassigned NCR responsibility to ${assigned_to}`,
                    created_at: timestamp,
                  },
                ],
              }
            : i,
        ),
        activities: newActivities,
      };
    });
  },

  startIssueProgress(id: string, in_progress_by?: string | null | undefined, notes?: string | null | undefined) {
    set((s) => {
      const targetIssue = s.issues.find((i) => i.id === id);
      const timestamp = new Date().toISOString();
      const byUser = in_progress_by || CURRENT_USER.name;
      let newActivities = s.activities;

      if (targetIssue) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "issue_status",
          project_id: targetIssue.project_id,
          sop_id: targetIssue.sop_id,
          step_id: targetIssue.step_id,
          issue_id: id,
          title: `Containment Started: ${targetIssue.title}`,
          detail: notes || `Work in progress by ${byUser}`,
          user: byUser,
          timestamp,
        };
        newActivities = [act, ...s.activities];
      }

      const commentList: IssueComment[] = notes
        ? [{ id: nextId("c"), author: byUser, text: `Started containment: ${notes}`, created_at: timestamp }]
        : [{ id: nextId("c"), author: byUser, text: "Work and containment started on site", created_at: timestamp }];

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "In Progress",
                in_progress_by: byUser,
                in_progress_at: timestamp,
                comments: [...i.comments, ...commentList],
              }
            : i,
        ),
        activities: newActivities,
      };
    });
  },

  resolveIssue(
    id: string,
    input: {
      resolved_by: string;
      resolved_at?: string | null | undefined;
      resolution_notes: string;
      resolution_attachment?: string | null | undefined;
    },
  ) {
    set((s) => {
      const targetIssue = s.issues.find((i) => i.id === id);
      const timestamp = input.resolved_at || new Date().toISOString();
      let newActivities = s.activities;

      if (targetIssue) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "issue_status",
          project_id: targetIssue.project_id,
          sop_id: targetIssue.sop_id,
          step_id: targetIssue.step_id,
          issue_id: id,
          title: `Resolved NCR: ${targetIssue.title}`,
          detail: `Corrective action completed by ${input.resolved_by}: ${input.resolution_notes}`,
          user: input.resolved_by,
          timestamp,
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "Resolved",
                resolved_by: input.resolved_by,
                resolved_at: timestamp,
                resolution_notes: input.resolution_notes,
                resolution_attachment: input.resolution_attachment ?? null,
                comments: [
                  ...i.comments,
                  {
                    id: nextId("c"),
                    author: input.resolved_by,
                    text: `✅ Rectification Completed: ${input.resolution_notes}${
                      input.resolution_attachment ? ` (Proof attached: ${input.resolution_attachment})` : ""
                    }`,
                    created_at: timestamp,
                  },
                ],
              }
            : i,
        ),
        activities: newActivities,
      };
    });
  },

  closeIssue(
    id: string,
    input: {
      closed_by: string;
      closed_at?: string | null | undefined;
      closing_remarks?: string | null | undefined;
    },
  ) {
    set((s) => {
      const targetIssue = s.issues.find((i) => i.id === id);
      const timestamp = input.closed_at || new Date().toISOString();
      let newActivities = s.activities;

      if (targetIssue) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "issue_status",
          project_id: targetIssue.project_id,
          sop_id: targetIssue.sop_id,
          step_id: targetIssue.step_id,
          issue_id: id,
          title: `Closed & Approved NCR: ${targetIssue.title}`,
          detail: input.closing_remarks || `Final QA sign-off by ${input.closed_by}`,
          user: input.closed_by,
          timestamp,
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "Closed",
                closed_by: input.closed_by,
                closed_at: timestamp,
                closing_remarks: input.closing_remarks ?? null,
                comments: [
                  ...i.comments,
                  {
                    id: nextId("c"),
                    author: input.closed_by,
                    text: `🏁 Quality Sign-off & Closed: ${input.closing_remarks || "Verified and approved on site."}`,
                    created_at: timestamp,
                  },
                ],
              }
            : i,
        ),
        activities: newActivities,
      };
    });
  },

  reopenIssue(id: string, reason?: string | null | undefined) {
    set((s) => {
      const targetIssue = s.issues.find((i) => i.id === id);
      const timestamp = new Date().toISOString();
      let newActivities = s.activities;

      if (targetIssue) {
        const act: ActivityItem = {
          id: nextId("act"),
          type: "issue_status",
          project_id: targetIssue.project_id,
          sop_id: targetIssue.sop_id,
          step_id: targetIssue.step_id,
          issue_id: id,
          title: `Re-opened NCR: ${targetIssue.title}`,
          detail: reason || `Re-opened by ${CURRENT_USER.name} for re-work`,
          user: CURRENT_USER.name,
          timestamp,
        };
        newActivities = [act, ...s.activities];
      }

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "In Progress",
                comments: [
                  ...i.comments,
                  {
                    id: nextId("c"),
                    author: CURRENT_USER.name,
                    text: `⚠️ Re-opened NCR: ${reason || "Rectification requires additional verification on site."}`,
                    created_at: timestamp,
                  },
                ],
              }
            : i,
        ),
        activities: newActivities,
      };
    });
  },

  deleteIssue(id: string) {
    set((s) => ({
      ...s,
      issues: s.issues.filter((i) => i.id !== id),
    }));
  },

  deleteIssueComment(issueId: string, commentId: string) {
    set((s) => ({
      ...s,
      issues: s.issues.map((i) =>
        i.id === issueId
          ? { ...i, comments: i.comments.filter((c) => c.id !== commentId) }
          : i,
      ),
    }));
  },

  addIssueComment(id: string, text: string) {
    set((s) => ({
      ...s,
      issues: s.issues.map((i) =>
        i.id === id
          ? {
              ...i,
              comments: [
                ...i.comments,
                { id: nextId("c"), author: CURRENT_USER.name, text, created_at: new Date().toISOString() },
              ],
            }
          : i,
      ),
    }));
  },

  submitQuizAttempt(sopId: string, submittedAnswers: Record<string, string>) {
    set((s) => {
      const quiz = s.quizzes.find((q) => q.sop_id === sopId);
      if (!quiz) return s;

      const userAttempts = s.quizAttempts.filter(
        (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name
      );
      if (userAttempts.some((a) => a.passed)) return s;

      const attemptNum = userAttempts.length + 1;
      let earned = 0;
      let total = 0;

      quiz.questions.forEach((q) => {
        total += q.marks;
        const answer = submittedAnswers[q.id];
        if (answer && answer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
          earned += q.marks;
        }
      });

      const scorePct = total > 0 ? Math.round((earned / total) * 100) : 0;
      const passed = scorePct >= quiz.passing_pct;
      const isLocked = !passed && attemptNum >= quiz.max_attempts;

      const attempt: QuizAttempt = {
        id: nextId("att"),
        quiz_id: quiz.id,
        sop_id: sopId,
        user_name: CURRENT_USER.name,
        attempt_number: attemptNum,
        score_pct: scorePct,
        passed,
        submitted_answers: submittedAnswers,
        is_locked: isLocked,
        timestamp: new Date().toISOString(),
      };

      let newQualifications = s.qualifications;
      const sop = s.sops.find((x) => x.id === sopId);
      const assessment = s.assessments.find(
        (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name
      );

      const isAssessmentSatisfied = !assessment || assessment.status === "Passed";
      if (passed && isAssessmentSatisfied) {
        const certNo = `CERT-${sop?.version_number ?? "V1.0"}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const qual: EmployeeQualification = {
          id: nextId("qual"),
          user_name: CURRENT_USER.name,
          sop_id: sopId,
          sop_title: sop?.name ?? "SOP",
          version_number: sop?.version_number ?? "V1.0",
          quiz_score_pct: scorePct,
          assessment_score: assessment?.evaluator_score ?? null,
          certificate_number: certNo,
          issued_at: new Date().toISOString().split("T")[0]!,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
          status: "Qualified",
        };
        newQualifications = [
          qual,
          ...newQualifications.filter((q) => !(q.sop_id === sopId && q.user_name === CURRENT_USER.name)),
        ];
      }

      const act: ActivityItem = {
        id: nextId("act"),
        type: "step_completed",
        project_id: "",
        sop_id: sopId,
        title: passed
          ? `Passed Competency Exam: ${quiz.title} (${scorePct}%)`
          : `Quiz Attempt #${attemptNum} Failed: ${quiz.title} (${scorePct}%)`,
        detail: passed
          ? `Qualified as certified field practitioner.`
          : isLocked
          ? `Locked after exhausting ${quiz.max_attempts} attempts.`
          : `${quiz.max_attempts - attemptNum} attempts remaining.`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        quizAttempts: [attempt, ...s.quizAttempts],
        qualifications: newQualifications,
        activities: [act, ...s.activities],
      };
    });
  },

  resetQuizAttempts(sopId: string) {
    set((s) => ({
      ...s,
      quizAttempts: s.quizAttempts.filter(
        (a) => a.sop_id !== sopId || a.user_name !== CURRENT_USER.name
      ),
      activities: [
        {
          id: nextId("act"),
          type: "step_completed",
          project_id: "",
          sop_id: sopId,
          title: `Admin Override: Reset Quiz Attempts for ${CURRENT_USER.name}`,
          detail: `Permitted re-evaluation for SOP competency`,
          user: CURRENT_USER.name,
          timestamp: new Date().toISOString(),
        },
        ...s.activities,
      ],
    }));
  },

  submitPracticalAssessment(sopId: string, submittedData: string) {
    set((s) => {
      const existing = s.assessments.find(
        (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name
      );
      const sop = s.sops.find((x) => x.id === sopId);
      const updatedAssessment: PracticalAssessment = existing
        ? {
            ...existing,
            submitted_data: submittedData,
            status: "Under Evaluation",
            submitted_at: new Date().toISOString(),
          }
        : {
            id: nextId("prac"),
            sop_id: sopId,
            title: `Practical Observation: ${sop?.name ?? "SOP"}`,
            scenario_description: "Field checklist submission and photograph inspection evidence.",
            expected_outputs: "Logged verification checklist.",
            user_name: CURRENT_USER.name,
            submitted_data: submittedData,
            status: "Under Evaluation",
            submitted_at: new Date().toISOString(),
          };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: "",
        sop_id: sopId,
        title: `Submitted Practical Simulation: ${sop?.name ?? "Procedure"}`,
        detail: "Awaiting QA lead evaluation and field verification",
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        assessments: [
          updatedAssessment,
          ...s.assessments.filter(
            (a) => !(a.sop_id === sopId && a.user_name === CURRENT_USER.name)
          ),
        ],
        activities: [act, ...s.activities],
      };
    });
  },

  evaluatePracticalAssessment(sopId: string, score: number, passed: boolean, feedback: string) {
    set((s) => {
      const assessment = s.assessments.find(
        (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name
      );
      if (!assessment) return s;

      const sop = s.sops.find((x) => x.id === sopId);
      const quiz = s.quizzes.find((q) => q.sop_id === sopId);
      const passedQuiz = s.quizAttempts.find(
        (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name && a.passed
      );

      let newQualifications = s.qualifications;

      if (passed && (!quiz || Boolean(passedQuiz))) {
        const certNo = `CERT-${sop?.version_number ?? "V1.0"}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const qual: EmployeeQualification = {
          id: nextId("qual"),
          user_name: CURRENT_USER.name,
          sop_id: sopId,
          sop_title: sop?.name ?? "SOP",
          version_number: sop?.version_number ?? "V1.0",
          quiz_score_pct: passedQuiz?.score_pct ?? 100,
          assessment_score: score,
          certificate_number: certNo,
          issued_at: new Date().toISOString().split("T")[0]!,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
          status: "Qualified",
        };
        newQualifications = [
          qual,
          ...newQualifications.filter((q) => !(q.sop_id === sopId && q.user_name === CURRENT_USER.name)),
        ];
      }

      return {
        ...s,
        assessments: s.assessments.map((a) =>
          a.sop_id === sopId && a.user_name === CURRENT_USER.name
            ? {
                ...a,
                evaluator_score: score,
                passed,
                evaluator_feedback: feedback,
                status: passed ? "Passed" : "Failed",
                evaluated_at: new Date().toISOString(),
              }
            : a
        ),
        qualifications: newQualifications,
      };
    });
  },

  scheduleAudit(input: {
    title: string;
    audit_type: AuditType;
    project_id: string;
    sop_id: string;
    auditor_name: string;
    lead_auditee: string;
    scheduled_date: string;
  }) {
    const id = nextId("aud");
    set((s) => {
      const project = s.projects.find((p) => p.id === input.project_id);
      const sop = s.sops.find((x) => x.id === input.sop_id);
      const sopSteps = s.steps.filter((st) => st.sop_id === input.sop_id);

      const auditCount = s.audits.length + 1;
      const auditNumber = `AUD-2026-${String(auditCount).padStart(3, "0")}`;

      const initialFindings: AuditFinding[] = sopSteps.map((step) => ({
        id: nextId("fnd"),
        audit_id: id,
        step_id: step.id,
        step_title: step.title,
        passed: true,
        status: "Compliant",
        observation: "Initial checkpoint compliant with procedure specification.",
        severity: "Low",
      }));

      const newAudit: AuditRecord = {
        id,
        audit_number: auditNumber,
        title: input.title,
        audit_type: input.audit_type,
        project_id: input.project_id,
        project_name: project?.name ?? "Active Project",
        sop_id: input.sop_id,
        sop_name: sop?.name ?? "SOP",
        sop_version: sop?.version_number ?? "V1.0",
        auditor_name: input.auditor_name,
        lead_auditee: input.lead_auditee,
        scheduled_date: input.scheduled_date,
        status: "Scheduled",
        findings: initialFindings,
        created_at: new Date().toISOString(),
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "step_started",
        project_id: input.project_id,
        sop_id: input.sop_id,
        title: `Scheduled Quality Audit: ${auditNumber}`,
        detail: `${input.title} assigned to ${input.auditor_name}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        audits: [newAudit, ...s.audits],
        activities: [act, ...s.activities],
      };
    });
    return id;
  },

  submitAuditExecution(
    auditId: string,
    findings: AuditFinding[],
    summaryNotes: string
  ) {
    set((s) => {
      const audit = s.audits.find((a) => a.id === auditId);
      if (!audit) return s;

      const total = findings.length;
      const passedCount = findings.filter((f) => f.passed).length;
      const overallScore = total > 0 ? Math.round((passedCount / total) * 100) : 100;
      const passed = overallScore >= 80;

      const newIssues: Issue[] = [];
      const updatedFindings = findings.map((f) => {
        if (!f.passed) {
          const issueId = nextId("iss");
          const priorityMap: Record<AuditFindingSeverity, IssuePriority> = {
            Critical: "High",
            High: "High",
            Medium: "Medium",
            Low: "Low",
          };

          const newIssue: Issue = {
            id: issueId,
            project_id: audit.project_id,
            sop_id: audit.sop_id,
            step_id: f.step_id ?? null,
            title: `Audit Deviation (${audit.audit_number}): ${f.step_title}`,
            description: `${f.observation}. Required Action: ${f.corrective_action_required || "Implement immediate corrective action"}`,
            priority: priorityMap[f.severity] || "High",
            assigned_to: audit.lead_auditee || CURRENT_USER.name,
            status: "Open",
            attachment: null,
            created_by: audit.auditor_name || CURRENT_USER.name,
            created_at: new Date().toISOString(),
            resolved_at: null,
            comments: [
              {
                id: nextId("c"),
                author: audit.auditor_name || CURRENT_USER.name,
                text: `Logged from Audit ${audit.audit_number}: ${f.status} (${f.severity} severity)`,
                created_at: new Date().toISOString(),
              },
            ],
          };

          newIssues.push(newIssue);
          return { ...f, ncr_id: issueId };
        }
        return f;
      });

      const updatedAudit: AuditRecord = {
        ...audit,
        status: "Completed",
        completed_date: new Date().toISOString(),
        overall_score: overallScore,
        passed,
        findings: updatedFindings,
        summary_notes: summaryNotes,
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "step_completed",
        project_id: audit.project_id,
        sop_id: audit.sop_id,
        title: `Completed Audit ${audit.audit_number}: ${audit.title} (${overallScore}%)`,
        detail: passed
          ? `Audit Passed compliance standards. ${newIssues.length} minor NCRs created.`
          : `Audit Failed with ${newIssues.length} Non-Conformance Reports generated.`,
        user: audit.auditor_name || CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        audits: s.audits.map((a) => (a.id === auditId ? updatedAudit : a)),
        issues: [...newIssues, ...s.issues],
        activities: [act, ...s.activities],
      };
    });
  },

  cancelAudit(auditId: string) {
    set((s) => ({
      ...s,
      audits: s.audits.map((a) =>
        a.id === auditId ? { ...a, status: "Cancelled" as AuditStatus } : a
      ),
    }));
  },

  updateCapaStage(
    issueId: string,
    updates: Partial<{
      capa_stage: CapaStage | undefined;
      containment_action: string | null | undefined;
      containment_by: string | null | undefined;
      containment_at: string | null | undefined;
      five_whys: FiveWhys | null | undefined;
      ishikawa: IshikawaFactors | null | undefined;
      corrective_action: string | null | undefined;
      preventive_action: string | null | undefined;
      capa_owner: string | null | undefined;
      capa_target_date: string | null | undefined;
      verification_evidence: string | null | undefined;
      verification_notes: string | null | undefined;
      verified_by: string | null | undefined;
      verified_at: string | null | undefined;
      recurrence_observed: boolean | null | undefined;
      effectiveness_notes: string | null | undefined;
    }>
  ) {
    set((s) => {
      const target = s.issues.find((i) => i.id === issueId);
      if (!target) return s;

      const newStage = updates.capa_stage || target.capa_stage || "1_Containment";

      const act: ActivityItem = {
        id: nextId("act"),
        type: "issue_status",
        project_id: target.project_id,
        sop_id: target.sop_id,
        step_id: target.step_id,
        issue_id: issueId,
        title: `CAPA Advanced: ${target.title}`,
        detail: `Stage set to ${newStage} by ${CURRENT_USER.name}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        issues: s.issues.map((i) =>
          i.id === issueId
            ? {
                ...i,
                ...updates,
                capa_stage: newStage,
              }
            : i
        ),
        activities: [act, ...s.activities],
      };
    });
  },

  reviseDocument(
    docId: string,
    newRevision: string,
    changeSummary: string,
    fileName?: string
  ) {
    set((s) => {
      const doc = s.documents.find((d) => d.id === docId);
      if (!doc) return s;

      const prevRev: DocumentRevision = {
        revision: doc.revision || "R0",
        revised_by: CURRENT_USER.name,
        revised_at: new Date().toISOString(),
        change_summary: changeSummary,
        file_name: doc.file_name,
      };

      const updatedDoc: Document = {
        ...doc,
        revision: newRevision,
        file_name: fileName || doc.file_name,
        uploaded_by: CURRENT_USER.name,
        uploaded_at: new Date().toISOString(),
        revision_history: [prevRev, ...(doc.revision_history || [])],
      };

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: doc.project_id,
        sop_id: doc.sop_id,
        title: `Document Revised: ${doc.document_name} (${newRevision})`,
        detail: `Change: ${changeSummary}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        documents: s.documents.map((d) => (d.id === docId ? updatedDoc : d)),
        activities: [act, ...s.activities],
      };
    });
  },

  updateDocumentControlStatus(
    docId: string,
    status: DocumentControlStatus,
    watermarkText?: string
  ) {
    set((s) => {
      const doc = s.documents.find((d) => d.id === docId);
      if (!doc) return s;

      const watermarkMap: Record<DocumentControlStatus, string> = {
        Controlled: "CONTROLLED COPY — ISSUED FOR CONSTRUCTION",
        "Reference Only": "FOR INFORMATION ONLY — UNCONTROLLED WHEN PRINTED",
        Obsolete: "SUPERSEDED / OBSOLETE — DO NOT USE ON SITE",
        Draft: "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION",
      };

      const finalWatermark = watermarkText || watermarkMap[status];

      const act: ActivityItem = {
        id: nextId("act"),
        type: "doc_uploaded",
        project_id: doc.project_id,
        sop_id: doc.sop_id,
        title: `Document Stamp Updated: ${doc.document_name}`,
        detail: `Status set to ${status}. Stamp: ${finalWatermark}`,
        user: CURRENT_USER.name,
        timestamp: new Date().toISOString(),
      };

      return {
        ...s,
        documents: s.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                control_status: status,
                watermark_text: finalWatermark,
              }
            : d
        ),
        activities: [act, ...s.activities],
      };
    });
  },

  resetToDefaultSeed() {
    const fresh = buildSeed();
    state = fresh;
    saveState(fresh);
    listeners.forEach((l) => l());
  },

  // ─── LMS Actions ────────────────────────────────────────────────────────────

  /** Ensure a LearningProgress record exists for the current user + SOP */
  ensureLearningProgress(sopId: string, projectId?: string | null) {
    set((s) => {
      const existing = s.learningProgress.find(
        (lp) => lp.sop_id === sopId && lp.user_name === CURRENT_USER.name
      );
      if (existing) return s;
      const lp: LearningProgress = {
        id: nextId("lp"),
        user_name: CURRENT_USER.name,
        sop_id: sopId,
        project_id: projectId ?? null,
        steps_read: [],
        all_steps_read: false,
        quiz_passed: false,
        quiz_score_pct: null,
        assessment_passed: false,
        progress_pct: 0,
        status: "Not Started",
        started_at: null,
        completed_at: null,
      };
      return { ...s, learningProgress: [...s.learningProgress, lp] };
    });
  },

  /** Mark a specific SOP step as read by current user */
  markStepRead(sopId: string, stepId: string) {
    set((s) => {
      const sopSteps = s.steps.filter((st) => st.sop_id === sopId);
      const totalSteps = sopSteps.length;

      const updatedProgress = s.learningProgress.map((lp) => {
        if (lp.sop_id !== sopId || lp.user_name !== CURRENT_USER.name) return lp;

        // Add step if not already read
        const alreadyRead = lp.steps_read.some((r) => r.step_id === stepId);
        const stepsRead = alreadyRead
          ? lp.steps_read
          : [...lp.steps_read, { step_id: stepId, read_at: new Date().toISOString() }];

        const allStepsRead = totalSteps > 0 && stepsRead.length >= totalSteps;

        // Calculate weighted progress:
        // Content = 40%, Quiz = 30%, Assessment = 30%
        const contentPct = totalSteps > 0 ? (stepsRead.length / totalSteps) * 40 : 0;
        const quizPct = lp.quiz_passed ? 30 : 0;
        const assessPct = lp.assessment_passed ? 30 : 0;
        const progressPct = Math.round(contentPct + quizPct + assessPct);

        const status: LearningProgressStatus =
          progressPct >= 100
            ? "Completed"
            : stepsRead.length > 0 || lp.quiz_passed
            ? "In Progress"
            : "Not Started";

        return {
          ...lp,
          steps_read: stepsRead,
          all_steps_read: allStepsRead,
          progress_pct: progressPct,
          status,
          started_at: lp.started_at ?? new Date().toISOString(),
          completed_at: progressPct >= 100 ? new Date().toISOString() : lp.completed_at,
        };
      });

      // If no existing progress record found, create + mark
      const hasExisting = s.learningProgress.some(
        (lp) => lp.sop_id === sopId && lp.user_name === CURRENT_USER.name
      );
      if (!hasExisting) {
        const sopStepsTotal = s.steps.filter((st) => st.sop_id === sopId).length;
        const newLp: LearningProgress = {
          id: nextId("lp"),
          user_name: CURRENT_USER.name,
          sop_id: sopId,
          project_id: null,
          steps_read: [{ step_id: stepId, read_at: new Date().toISOString() }],
          all_steps_read: sopStepsTotal === 1,
          quiz_passed: false,
          quiz_score_pct: null,
          assessment_passed: false,
          progress_pct: sopStepsTotal > 0 ? Math.round((1 / sopStepsTotal) * 40) : 0,
          status: "In Progress",
          started_at: new Date().toISOString(),
          completed_at: null,
        };
        return { ...s, learningProgress: [...s.learningProgress, newLp] };
      }

      return { ...s, learningProgress: updatedProgress };
    });
  },

  /** Update progress when quiz is passed (called from submitQuizAttempt flow) */
  syncQuizPassedToLearning(sopId: string, scorePct: number, passed: boolean) {
    set((s) => {
      const exists = s.learningProgress.some(
        (lp) => lp.sop_id === sopId && lp.user_name === CURRENT_USER.name
      );
      if (!exists) return s;

      return {
        ...s,
        learningProgress: s.learningProgress.map((lp) => {
          if (lp.sop_id !== sopId || lp.user_name !== CURRENT_USER.name) return lp;
          const contentPct = lp.all_steps_read ? 40 : (lp.steps_read.length / Math.max(s.steps.filter((st) => st.sop_id === sopId).length, 1)) * 40;
          const quizPct = passed ? 30 : 0;
          const assessPct = lp.assessment_passed ? 30 : 0;
          const progressPct = Math.round(contentPct + quizPct + assessPct);
          return {
            ...lp,
            quiz_passed: passed,
            quiz_score_pct: scorePct,
            progress_pct: progressPct,
            status: progressPct >= 100 ? "Completed" : "In Progress",
            completed_at: progressPct >= 100 ? new Date().toISOString() : lp.completed_at,
          };
        }),
      };
    });
  },

  /** Update rich learning_content for a specific step (admin action) */
  updateStepLearningContent(stepId: string, learningContent: string) {
    set((s) => ({
      ...s,
      steps: s.steps.map((st) =>
        st.id === stepId ? { ...st, learning_content: learningContent } : st
      ),
    }));
  },

  /** Save or create a Quiz */
  saveQuiz(quiz: Omit<Quiz, "id"> & { id?: string | undefined }) {
    set((s) => {
      if (quiz.id) {
        return {
          ...s,
          quizzes: s.quizzes.map((q) => (q.id === quiz.id ? ({ ...q, ...quiz } as Quiz) : q)),
        };
      }
      const id = nextId("quiz");
      const newQuiz: Quiz = { ...quiz, id } as Quiz;
      return {
        ...s,
        quizzes: [newQuiz, ...s.quizzes],
      };
    });
  },

  /** Delete a Quiz */
  deleteQuiz(quizId: string) {
    set((s) => ({
      ...s,
      quizzes: s.quizzes.filter((q) => q.id !== quizId),
      quizAttempts: s.quizAttempts.filter((a) => a.quiz_id !== quizId),
    }));
  },

  /** Save or create an Assessment */
  saveAssessment(assessment: Omit<PracticalAssessment, "id"> & { id?: string | undefined }) {
    set((s) => {
      if (assessment.id) {
        return {
          ...s,
          assessments: s.assessments.map((a) =>
            a.id === assessment.id ? ({ ...a, ...assessment } as PracticalAssessment) : a
          ),
        };
      }
      const id = nextId("prac");
      const newAssessment: PracticalAssessment = { ...assessment, id } as PracticalAssessment;
      return {
        ...s,
        assessments: [newAssessment, ...s.assessments],
      };
    });
  },

  /** Delete an Assessment */
  deleteAssessment(assessmentId: string) {
    set((s) => ({
      ...s,
      assessments: s.assessments.filter((a) => a.id !== assessmentId),
    }));
  },

  /** Batch map an SOP master to multiple projects without duplication */
  batchMapSopToProjects(sopId: string, projectIds: string[], assignedTo?: string, dueDate?: string) {
    set((s) => {
      const newProjectSops = [...s.projectSops];
      const newExecutions = [...s.executions];
      const sopSteps = s.steps.filter((st) => st.sop_id === sopId);

      projectIds.forEach((pId) => {
        const existing = newProjectSops.find((ps) => ps.project_id === pId && ps.sop_id === sopId);
        if (!existing) {
          const psId = nextId("ps");
          newProjectSops.push({
            id: psId,
            project_id: pId,
            sop_id: sopId,
            assigned_to: assignedTo || PEOPLE[Math.floor(Math.random() * PEOPLE.length)] || "R. Menon",
            due_date: dueDate || "2026-12-31",
          });
          sopSteps.forEach((st) => {
            newExecutions.push({
              id: nextId("ex"),
              project_sop_id: psId,
              step_id: st.id,
              status: "Not Started",
            });
          });
        }
      });

      return {
        ...s,
        projectSops: newProjectSops,
        executions: newExecutions,
      };
    });
  },

  /** Save complete Master SOP with business metadata */
  saveMasterSop(
    sop: Partial<Sop> & { name: string; department: string },
    steps: Array<{ id?: string | null | undefined; title: string; instructions: string }>
  ) {
    let sopId = sop.id ?? nextId("sop");
    set((s) => {
      const record: Sop = {
        id: sopId,
        name: sop.name,
        code: sop.code || `SOP-00${s.sops.length + 1}`,
        sop_type: sop.sop_type || "Standard Operating Procedure",
        category: sop.category || "Civil Works",
        process: sop.process || "Site Operations",
        department: sop.department,
        description: sop.description || `Standard operating procedure for ${sop.name}`,
        version_number: sop.version_number || "V1.0",
        lifecycle_status: sop.lifecycle_status || "Effective",
        effective_date: sop.effective_date || new Date().toISOString(),
        owner_name: sop.owner_name || "Quality Manager",
        criticality: sop.criticality || "Medium",
        review_frequency_months: sop.review_frequency_months || 12,
        purpose: sop.purpose || `Standardize safe, ISO-compliant execution of ${sop.name}.`,
        scope: sop.scope || "Applicable across all construction sites and subcontracted work packages.",
        responsibilities: sop.responsibilities || "Project Engineer (Execution), Quality Inspector (Sign-off)",
        inputs: sop.inputs || "Approved drawings and material test certificates.",
        materials: sop.materials || "Specified construction materials and approved mixes.",
        safety_ppe: sop.safety_ppe || "Helmet, safety boots, high-vis jacket, protective eyewear.",
        expected_output: sop.expected_output || "100% checklist compliance, signed pour/inspection card.",
        references: sop.references || "IS 456:2000, ISO 9001:2015 Clause 7.5",
        applicable_industries: sop.applicable_industries || ["Construction / Infrastructure"],
        applicable_project_types: sop.applicable_project_types || ["High-Rise Residential", "Commercial EPC"],
        applicable_roles: sop.applicable_roles || ["Site Engineer", "Quality Inspector"],
        required_documents: sop.required_documents || ["Approved Structural Drawings"],
        version_history: sop.version_history || [
          {
            version_number: "V1.0",
            lifecycle_status: "Effective",
            effective_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            author: "Quality Manager",
            revision_reason: "Initial release of Master SOP.",
            change_summary: "Baseline procedure definition.",
          },
        ],
      };

      const newSteps: SopStep[] = steps.map((st, i) => ({
        id: st.id ?? `${sopId}-step-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
        sop_id: sopId,
        step_number: i + 1,
        title: st.title,
        instructions: st.instructions,
      }));

      return {
        ...s,
        sops: sop.id ? s.sops.map((x) => (x.id === sopId ? record : x)) : [record, ...s.sops],
        steps: [...s.steps.filter((x) => x.sop_id !== sopId), ...newSteps],
      };
    });
    return sopId;
  },
};

/* -------------------------------- selectors ------------------------------- */

export function getSopUsedInProjects(s: SiteflowState, sopId: string) {
  const mappings = s.projectSops.filter((ps) => ps.sop_id === sopId);
  return mappings.map((ps) => {
    const project = s.projects.find((p) => p.id === ps.project_id);
    const execs = s.executions.filter((e) => e.project_sop_id === ps.id);
    const completed = execs.filter((e) => e.status === "Completed").length;
    const total = execs.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      projectSopId: ps.id,
      projectId: ps.project_id,
      projectName: project?.name ?? "Unknown Project",
      projectCode: project?.code ?? "—",
      location: project?.location ?? "—",
      status: project?.status ?? "In Progress",
      assignedTo: ps.assigned_to,
      dueDate: ps.due_date,
      progressPct: pct,
      stepCount: total,
      completedSteps: completed,
      complianceStatus: pct === 100 ? "Completed" : pct > 0 ? "In Progress" : "Not Started",
    };
  });
}

export function getSopBlastRadius(s: SiteflowState, sopId: string) {
  const usedIn = getSopUsedInProjects(s, sopId);
  const totalProjects = usedIn.length;
  // Dynamic estimated workers impacted based on mapped sites
  const activeWorkersImpacted = totalProjects * 18 + 4;
  const auditsImpacted = (s.audits || []).filter((a) => a.sop_id === sopId).length;
  const openIssuesImpacted = s.issues.filter((i) => i.sop_id === sopId && i.status !== "Resolved" && i.status !== "Closed").length;
  return {
    totalProjects,
    usedIn,
    activeWorkersImpacted,
    auditsImpacted,
    openIssuesImpacted,
  };
}

export function sopProgress(s: SiteflowState, projectSopId: string) {
  const execs = s.executions.filter((e) => e.project_sop_id === projectSopId);
  const completed = execs.filter((e) => e.status === "Completed").length;
  const inProgress = execs.filter((e) => e.status === "In Progress").length;
  const status: StepStatus =
    execs.length > 0 && completed === execs.length
      ? "Completed"
      : completed > 0 || inProgress > 0
        ? "In Progress"
        : "Not Started";
  return { completed, total: execs.length, status, pct: execs.length ? Math.round((completed / execs.length) * 100) : 0 };
}

export function projectProgress(s: SiteflowState, projectId: string) {
  const ps = s.projectSops.filter((p) => p.project_id === projectId);
  const stats = ps.map((p) => sopProgress(s, p.id));
  const totalSteps = stats.reduce((a, b) => a + b.total, 0);
  const doneSteps = stats.reduce((a, b) => a + b.completed, 0);
  return {
    sops: ps.length,
    completed: stats.filter((x) => x.status === "Completed").length,
    inProgress: stats.filter((x) => x.status === "In Progress").length,
    notStarted: stats.filter((x) => x.status === "Not Started").length,
    pct: totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0,
  };
}

export function isSopOverdue(projectSop: ProjectSop, state: SiteflowState): boolean {
  if (!projectSop.due_date) return false;
  const prog = sopProgress(state, projectSop.id);
  if (prog.status === "Completed") return false;
  const dueDate = new Date(projectSop.due_date);
  const now = new Date();
  return dueDate.getTime() < now.getTime();
}

export function getSopStageDependency(
  projectSopId: string,
  state: SiteflowState,
): {
  hasDependency: boolean;
  prevProjectSop: ProjectSop | null;
  prevSop: Sop | null;
  status: "Completed" | "In Progress" | "Not Started" | "Overdue" | "None";
  progressPct: number;
  completedAt: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  message: string;
  level: "success" | "warning" | "danger" | "info" | "none";
} {
  const currentPs = state.projectSops.find((ps) => ps.id === projectSopId);
  if (!currentPs) {
    return {
      hasDependency: false,
      prevProjectSop: null,
      prevSop: null,
      status: "None",
      progressPct: 0,
      completedAt: null,
      assignedTo: null,
      dueDate: null,
      message: "",
      level: "none",
    };
  }

  const projectSops = state.projectSops.filter((ps) => ps.project_id === currentPs.project_id);
  let prevPs: ProjectSop | null = null;

  if (currentPs.previous_sop_id) {
    prevPs =
      projectSops.find((ps) => ps.sop_id === currentPs.previous_sop_id || ps.id === currentPs.previous_sop_id) ??
      null;
  } else {
    const idx = projectSops.findIndex((ps) => ps.id === projectSopId);
    if (idx > 0) {
      prevPs = projectSops[idx - 1] ?? null;
    }
  }

  if (!prevPs) {
    return {
      hasDependency: false,
      prevProjectSop: null,
      prevSop: null,
      status: "None",
      progressPct: 100,
      completedAt: null,
      assignedTo: null,
      dueDate: null,
      message: "Initial sequential milestone stage (No preceding prerequisite stage).",
      level: "info",
    };
  }

  const prevSop = state.sops.find((s) => s.id === prevPs.sop_id) ?? null;
  const prevProg = sopProgress(state, prevPs.id);
  const isOverdue = isSopOverdue(prevPs, state);

  // Check completion date from executions or projectSop
  const prevExecs = state.executions.filter((e) => e.project_sop_id === prevPs?.id);
  const lastCompletedExec = [...prevExecs]
    .filter((e) => e.status === "Completed" && e.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];
  const completedAt = prevPs.completed_at || lastCompletedExec?.completed_at || null;

  if (prevProg.status === "Completed") {
    return {
      hasDependency: true,
      prevProjectSop: prevPs,
      prevSop,
      status: "Completed",
      progressPct: 100,
      completedAt,
      assignedTo: prevPs.assigned_to,
      dueDate: prevPs.due_date ?? null,
      message: `Previous Stage (${prevSop?.name ?? "Preceding SOP"}) was signed off and completed${
        completedAt ? ` on ${formatDate(completedAt)}` : ""
      } by ${prevPs.assigned_to}. Handover clear — proceed with execution!`,
      level: "success",
    };
  }

  if (isOverdue) {
    return {
      hasDependency: true,
      prevProjectSop: prevPs,
      prevSop,
      status: "Overdue",
      progressPct: prevProg.pct,
      completedAt: null,
      assignedTo: prevPs.assigned_to,
      dueDate: prevPs.due_date ?? null,
      message: `CRITICAL ALERT: Preceding stage (${prevSop?.name ?? "Preceding SOP"}) is OVERDUE (Target was ${formatDate(
        prevPs.due_date,
      )} · Lead: ${prevPs.assigned_to} · ${prevProg.pct}% complete). Review with lead before next milestone sign-off.`,
      level: "danger",
    };
  }

  return {
    hasDependency: true,
    prevProjectSop: prevPs,
    prevSop,
    status: prevProg.status === "In Progress" ? "In Progress" : "Not Started",
    progressPct: prevProg.pct,
    completedAt: null,
    assignedTo: prevPs.assigned_to,
    dueDate: prevPs.due_date ?? null,
    message: `PREVIOUS STAGE PENDING: Preceding stage (${prevSop?.name ?? "Preceding SOP"}) is currently ${
      prevProg.status
    } (${prevProg.pct}% by ${prevPs.assigned_to}, Target: ${formatDate(
      prevPs.due_date,
    )}). Coordinate with previous lead for milestone handover.`,
    level: "warning",
  };
}

export function getOverdueProjectSops(state: SiteflowState): Array<{
  projectSop: ProjectSop;
  project: Project;
  sop: Sop;
  daysOverdue: number;
}> {
  const now = new Date();
  const overdue: Array<{
    projectSop: ProjectSop;
    project: Project;
    sop: Sop;
    daysOverdue: number;
  }> = [];

  state.projectSops.forEach((ps) => {
    if (!ps.due_date) return;
    const prog = sopProgress(state, ps.id);
    if (prog.status === "Completed") return;
    const dueDate = new Date(ps.due_date);
    if (dueDate.getTime() < now.getTime()) {
      const project = state.projects.find((p) => p.id === ps.project_id);
      const sop = state.sops.find((s) => s.id === ps.sop_id);
      if (project && sop) {
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        overdue.push({ projectSop: ps, project, sop, daysOverdue });
      }
    }
  });

  return overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export function formatRelativeTime(d?: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(d);
}

export function formatDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return `${formatDate(d)} · ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

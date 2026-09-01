import { useSyncExternalStore } from "react";

/* ---------------------------------- types --------------------------------- */

export type ProjectStatus = "Planning" | "In Progress" | "Completed";
export type StepStatus = "Not Started" | "In Progress" | "Completed";
export type IssuePriority = "Low" | "Medium" | "High";
export type IssueStatus = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";

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
};

export type Sop = {
  id: string;
  name: string;
  department: string;
  description: string;
};

export type SopStep = {
  id: string;
  sop_id: string;
  step_number: number;
  title: string;
  instructions: string;
};

export type ProjectSop = {
  id: string;
  project_id: string;
  sop_id: string;
  assigned_to: string;
};

export type StepExecution = {
  id: string;
  project_sop_id: string;
  step_id: string;
  status: StepStatus;
  completed_by?: string;
  completed_at?: string;
  comments?: string;
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
};

export type IssueComment = { id: string; author: string; text: string; created_at: string };

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
  resolved_at: string | null;
  comments: IssueComment[];
};

export type SiteflowState = {
  projects: Project[];
  sops: Sop[];
  steps: SopStep[];
  projectSops: ProjectSop[];
  executions: StepExecution[];
  documents: Document[];
  issues: Issue[];
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

const DOC_NAMES = [
  "Approved Structural Drawings",
  "Soil Investigation Report",
  "Concrete Mix Design Approval",
  "Safety Compliance Certificate",
  "Commencement Certificate",
];

function buildSeed(): SiteflowState {
  const sops: Sop[] = [];
  const steps: SopStep[] = [];
  SOP_SEEDS.forEach((s, i) => {
    const sopId = `sop-${i + 1}`;
    sops.push({ id: sopId, name: s.name, department: s.department, description: s.description });
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

  PROJECT_SEEDS.forEach((p, pi) => {
    const projectId = `prj-${pi + 1}`;
    const { sopIdx, ...rest } = p;
    projects.push({ id: projectId, ...rest });

    sopIdx.forEach((si, k) => {
      const psId = `ps-${pi + 1}-${k + 1}`;
      projectSops.push({
        id: psId,
        project_id: projectId,
        sop_id: `sop-${si + 1}`,
        assigned_to: PEOPLE[(pi + k) % PEOPLE.length],
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
          completed_by: status === "Completed" ? PEOPLE[(idx + pi) % PEOPLE.length] : undefined,
          completed_at: status === "Completed" ? `2026-0${(idx % 8) + 1}-1${(idx % 9)}T10:${(idx * 7) % 60 < 10 ? "0" : ""}${(idx * 7) % 60}:00` : undefined,
        });
      });

      // one SOP-scoped document requirement per assigned SOP
      const uploaded = k % 2 === 0;
      documents.push({
        id: `doc-${psId}`,
        project_id: projectId,
        sop_id: `sop-${si + 1}`,
        step_id: null,
        document_name: `${sops[si].name} — Inspection Record`,
        file_name: uploaded ? `${sops[si].name.toLowerCase().replace(/\s+/g, "-")}-record.pdf` : null,
        uploaded_by: uploaded ? PEOPLE[k % PEOPLE.length] : null,
        uploaded_at: uploaded ? "2026-05-12T09:20:00" : null,
        required: true,
      });
    });

    DOC_NAMES.forEach((dn, di) => {
      const uploaded = (di + pi) % 3 !== 0;
      documents.push({
        id: `doc-${projectId}-${di + 1}`,
        project_id: projectId,
        sop_id: null,
        step_id: null,
        document_name: dn,
        file_name: uploaded ? `${dn.toLowerCase().replace(/\s+/g, "-")}.pdf` : null,
        uploaded_by: uploaded ? p.admin : null,
        uploaded_at: uploaded ? "2026-04-02T14:05:00" : null,
        required: di < 4,
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

  return { projects, sops, steps, projectSops, executions, documents, issues };
}

/* --------------------------------- store ---------------------------------- */

let state: SiteflowState = buildSeed();
const listeners = new Set<() => void>();

function set(updater: (s: SiteflowState) => SiteflowState) {
  state = updater(state);
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
  saveProject(p: Omit<Project, "id"> & { id?: string }) {
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

  saveSop(sop: { id?: string; name: string; department: string; description: string }, steps: Array<{ id?: string; title: string; instructions: string }>) {
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

  assignSop(project_id: string, sop_id: string, assigned_to: string) {
    set((s) => {
      const psId = nextId("ps");
      const execs: StepExecution[] = s.steps
        .filter((st) => st.sop_id === sop_id)
        .map((st) => ({ id: nextId("ex"), project_sop_id: psId, step_id: st.id, status: "Not Started" }));
      const sop = s.sops.find((x) => x.id === sop_id);
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
      return {
        ...s,
        projectSops: [...s.projectSops, { id: psId, project_id, sop_id, assigned_to }],
        executions: [...s.executions, ...execs],
        documents: [...s.documents, doc],
      };
    });
  },

  setStepStatus(executionId: string, status: StepStatus, comments?: string) {
    set((s) => ({
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
    }));
  },

  attachDocument(docId: string, fileName: string) {
    set((s) => ({
      ...s,
      documents: s.documents.map((d) =>
        d.id === docId
          ? { ...d, file_name: fileName, uploaded_by: CURRENT_USER.name, uploaded_at: new Date().toISOString() }
          : d,
      ),
    }));
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
    set((s) => ({
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
    }));
    return id;
  },

  setIssueStatus(id: string, status: IssueStatus) {
    set((s) => ({
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
};

/* -------------------------------- selectors ------------------------------- */

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

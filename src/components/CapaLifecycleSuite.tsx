import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Wrench,
  CheckCircle2,
  Award,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Edit3,
  Plus,
  Sparkles,
  Layers,
  HelpCircle,
  FileCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  actions,
  CURRENT_USER,
  PEOPLE,
  type Issue,
  type FiveWhys,
  type IshikawaFactors,
  type CapaStage,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

const STAGES: { id: CapaStage; number: number; title: string; subtitle: string }[] = [
  { id: "1_Containment", number: 1, title: "Identification & Containment", subtitle: "Immediate site quarantine & hazard isolation" },
  { id: "2_RootCause", number: 2, title: "Root Cause Analysis (RCA)", subtitle: "5 Whys & Ishikawa 6M causal analysis" },
  { id: "3_ActionPlan", number: 3, title: "CAPA Action Planning", subtitle: "Corrective and systemic preventive measures" },
  { id: "4_Verification", number: 4, title: "Implementation Verification", subtitle: "Physical verification & test evidence" },
  { id: "5_Effectiveness", number: 5, title: "Effectiveness & QA Closure", subtitle: "30-day monitoring & zero-recurrence sign-off" },
];

export function CapaLifecycleSuite({ issue }: { issue: Issue }) {
  const currentStage = issue.capa_stage || "1_Containment";
  const [activeTab, setActiveTab] = useState<CapaStage>(currentStage);

  // Modals
  const [containmentModalOpen, setContainmentModalOpen] = useState(false);
  const [containmentAction, setContainmentAction] = useState(issue.containment_action || "");

  const [rcaModalOpen, setRcaModalOpen] = useState(false);
  const [why1, setWhy1] = useState(issue.five_whys?.why_1 || "");
  const [why2, setWhy2] = useState(issue.five_whys?.why_2 || "");
  const [why3, setWhy3] = useState(issue.five_whys?.why_3 || "");
  const [why4, setWhy4] = useState(issue.five_whys?.why_4 || "");
  const [rootCause, setRootCause] = useState(issue.five_whys?.root_cause || "");
  const [ishikawaMan, setIshikawaMan] = useState(issue.ishikawa?.man || "");
  const [ishikawaMachine, setIshikawaMachine] = useState(issue.ishikawa?.machine || "");
  const [ishikawaMethod, setIshikawaMethod] = useState(issue.ishikawa?.method || "");
  const [ishikawaMaterial, setIshikawaMaterial] = useState(issue.ishikawa?.material || "");
  const [ishikawaMeasurement, setIshikawaMeasurement] = useState(issue.ishikawa?.measurement || "");
  const [ishikawaMilieu, setIshikawaMilieu] = useState(issue.ishikawa?.milieu || "");

  const [actionPlanModalOpen, setActionPlanModalOpen] = useState(false);
  const [correctiveAction, setCorrectiveAction] = useState(issue.corrective_action || "");
  const [preventiveAction, setPreventiveAction] = useState(issue.preventive_action || "");
  const [capaOwner, setCapaOwner] = useState(issue.capa_owner || issue.assigned_to);
  const [targetDate, setTargetDate] = useState(issue.capa_target_date || new Date().toISOString().split("T")[0]);

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationEvidence, setVerificationEvidence] = useState(issue.verification_evidence || "");
  const [verificationNotes, setVerificationNotes] = useState(issue.verification_notes || "");

  const [effectivenessModalOpen, setEffectivenessModalOpen] = useState(false);
  const [recurrenceObserved, setRecurrenceObserved] = useState(issue.recurrence_observed || false);
  const [effectivenessNotes, setEffectivenessNotes] = useState(issue.effectiveness_notes || "");

  // Current stage index helper
  const currentStageIdx = STAGES.findIndex((s) => s.id === currentStage);

  // Save Containment
  const handleSaveContainment = () => {
    if (!containmentAction.trim()) {
      toast.error("Please enter immediate site containment measures.");
      return;
    }
    actions.updateCapaStage(issue.id, {
      containment_action: containmentAction,
      containment_by: CURRENT_USER.name,
      containment_at: new Date().toISOString(),
      capa_stage: "2_RootCause",
    });
    toast.success("Stage 1 Containment recorded! Advanced to Stage 2 Root Cause Analysis.");
    setContainmentModalOpen(false);
    setActiveTab("2_RootCause");
  };

  // Save RCA
  const handleSaveRca = () => {
    if (!rootCause.trim()) {
      toast.error("Please identify the fundamental root cause in the 5 Whys analysis.");
      return;
    }

    const fiveWhys: FiveWhys = {
      why_1: why1,
      why_2: why2,
      why_3: why3,
      why_4: why4,
      root_cause: rootCause,
    };

    const ishikawa: IshikawaFactors = {
      man: ishikawaMan,
      machine: ishikawaMachine,
      method: ishikawaMethod,
      material: ishikawaMaterial,
      measurement: ishikawaMeasurement,
      milieu: ishikawaMilieu,
    };

    actions.updateCapaStage(issue.id, {
      five_whys: fiveWhys,
      ishikawa,
      capa_stage: "3_ActionPlan",
    });

    toast.success("Stage 2 Root Cause Analysis saved! Advanced to Stage 3 Action Planning.");
    setRcaModalOpen(false);
    setActiveTab("3_ActionPlan");
  };

  // Save Action Plan
  const handleSaveActionPlan = () => {
    if (!correctiveAction.trim() || !preventiveAction.trim()) {
      toast.error("Please provide both immediate corrective and systemic preventive actions.");
      return;
    }

    actions.updateCapaStage(issue.id, {
      corrective_action: correctiveAction,
      preventive_action: preventiveAction,
      capa_owner: capaOwner,
      capa_target_date: targetDate,
      capa_stage: "4_Verification",
    });

    toast.success("Stage 3 CAPA Action Plan committed! Advanced to Stage 4 Verification.");
    setActionPlanModalOpen(false);
    setActiveTab("4_Verification");
  };

  // Save Verification
  const handleSaveVerification = () => {
    if (!verificationNotes.trim()) {
      toast.error("Please enter verification observation notes.");
      return;
    }

    actions.updateCapaStage(issue.id, {
      verification_evidence: verificationEvidence,
      verification_notes: verificationNotes,
      verified_by: CURRENT_USER.name,
      verified_at: new Date().toISOString(),
      capa_stage: "5_Effectiveness",
    });

    toast.success("Stage 4 Implementation verified on site! Advanced to Stage 5 Effectiveness Review.");
    setVerificationModalOpen(false);
    setActiveTab("5_Effectiveness");
  };

  // Save Effectiveness & Final Sign-off
  const handleSaveEffectiveness = () => {
    actions.updateCapaStage(issue.id, {
      recurrence_observed: recurrenceObserved,
      effectiveness_notes: effectivenessNotes || "30-day post-rectification monitoring confirms 0% defect recurrence.",
      capa_stage: "5_Effectiveness",
    });

    if (!recurrenceObserved) {
      actions.resolveIssue(issue.id, {
        resolved_by: CURRENT_USER.name,
        resolution_notes: `CAPA Root Cause eliminated: ${issue.five_whys?.root_cause || "Verified"}. Corrective: ${issue.corrective_action || "Complete"}. Preventive: ${issue.preventive_action || "Complete"}.`,
      });
      toast.success("CAPA Successfully Closed! Defect marked as Resolved with zero recurrence.");
    } else {
      toast.error("Defect Recurrence Detected! CAPA flagged for rework & investigation.");
    }

    setEffectivenessModalOpen(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="rounded-full bg-primary/10 text-primary font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
            ISO 9001:2015 Clause 10.2 Compliant
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
            5-Stage CAPA & Root Cause Lifecycle Suite
          </h2>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Current: Stage {currentStageIdx + 1} of 5
        </span>
      </div>

      {/* 5-Stage Visual Stepper */}
      <div className="grid grid-cols-5 gap-2 text-center border-b border-slate-100 pb-6">
        {STAGES.map((st, idx) => {
          const isPassed = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const isSelected = activeTab === st.id;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveTab(st.id)}
              className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl text-xs font-bold transition-all",
                  isPassed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isCurrent
                    ? "bg-primary text-white shadow-xs ring-4 ring-primary/20 scale-105"
                    : "bg-slate-100 text-slate-400 border border-slate-200 group-hover:bg-slate-200"
                )}
              >
                {isPassed ? <Check className="size-4" /> : st.number}
              </div>

              <span
                className={cn(
                  "mt-2 text-[11px] font-bold leading-tight line-clamp-1 transition-colors",
                  isSelected
                    ? "text-primary font-extrabold underline decoration-primary/40 underline-offset-4"
                    : isPassed
                    ? "text-slate-800"
                    : "text-slate-400"
                )}
              >
                Stage {st.number}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[100px]">
                {st.title.split("&")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: IDENTIFICATION & IMMEDIATE CONTAINMENT                          */}
      {/* ========================================================================= */}
      {activeTab === "1_Containment" && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-amber-700" /> Stage 1: Immediate Hazard Containment
              </h3>
              <p className="text-amber-800 mt-1 leading-relaxed">
                Emergency actions implemented immediately on site to isolate the non-conforming condition, halt further defective pouring or fabrication, and protect personnel and structure.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setContainmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-all shrink-0"
            >
              <Edit3 className="size-3.5" /> {issue.containment_action ? "Update Containment" : "Record Containment"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Active Containment Log:</span>
            {issue.containment_action ? (
              <div className="space-y-2">
                <p className="text-slate-800 text-xs font-medium leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  {issue.containment_action}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Authorized by: <strong className="text-slate-800">{issue.containment_by || "QA Lead"}</strong></span>
                  <span>Enacted: <strong className="text-slate-800">{issue.containment_at ? new Date(issue.containment_at).toLocaleString() : "On Site"}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">
                No immediate containment action recorded yet. Click "Record Containment" to document site isolation measures.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: ROOT CAUSE ANALYSIS (5 WHYS & ISHIKAWA 6M)                      */}
      {/* ========================================================================= */}
      {activeTab === "2_RootCause" && (
        <div className="space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Search className="size-4 text-primary" /> Stage 2: Root Cause Analysis Engine
              </h3>
              <p className="text-slate-500 text-xs">
                Sequential 5 Whys causal breakdown coupled with Ishikawa 6M construction factor categorization.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setWhy1(issue.five_whys?.why_1 || "");
                setWhy2(issue.five_whys?.why_2 || "");
                setWhy3(issue.five_whys?.why_3 || "");
                setWhy4(issue.five_whys?.why_4 || "");
                setRootCause(issue.five_whys?.root_cause || "");
                setIshikawaMan(issue.ishikawa?.man || "");
                setIshikawaMachine(issue.ishikawa?.machine || "");
                setIshikawaMethod(issue.ishikawa?.method || "");
                setIshikawaMaterial(issue.ishikawa?.material || "");
                setIshikawaMeasurement(issue.ishikawa?.measurement || "");
                setIshikawaMilieu(issue.ishikawa?.milieu || "");
                setRcaModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="size-3.5" /> Launch RCA Studio
            </button>
          </div>

          {/* 5 Whys Visual Causal Chain */}
          <div className="space-y-3">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
              1. Five Whys Causal Progression:
            </span>

            <div className="space-y-2">
              {[
                { label: "Why 1 (Primary Symptom)", val: issue.five_whys?.why_1 || "Compressive strength test fell below specification." },
                { label: "Why 2 (Immediate Condition)", val: issue.five_whys?.why_2 || "Water-cement ratio delivered above design mix limit." },
                { label: "Why 3 (Process Flaw)", val: issue.five_whys?.why_3 || "Moisture sensor probe on aggregate bin drifted +4.2%." },
                { label: "Why 4 (Detection Failure)", val: issue.five_whys?.why_4 || "Daily pre-batch oven moisture calibration was bypassed." },
                { label: "Root Cause (Fundamental Failure)", val: issue.five_whys?.root_cause || "Absence of automated calibration lockout gate in batching protocol.", isRoot: true },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-all",
                    step.isRoot
                      ? "border-rose-200 bg-rose-50/40 text-rose-950 font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                      step.isRoot ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {step.isRoot ? "★" : idx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      {step.label}
                    </span>
                    <p className="mt-0.5">{step.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ishikawa 6M Factor Grid */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
              2. Ishikawa (Fishbone) 6M Construction Categories:
            </span>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Man (Personnel / Competency)", val: issue.ishikawa?.man || "Technician skipped morning oven-drying aggregate sample." },
                { title: "Machine (Plant / Tools)", val: issue.ishikawa?.machine || "Moisture sensor probe drift +4.2%." },
                { title: "Method (SOP Adherence)", val: issue.ishikawa?.method || "SOP-CIV-002 lacked moisture compensation lockout." },
                { title: "Material (Raw Aggregates)", val: issue.ishikawa?.material || "Coarse aggregate bins saturated from heavy rains." },
                { title: "Measurement (Testing / Calib)", val: issue.ishikawa?.measurement || "Slump gauge was not cross-verified at delivery." },
                { title: "Milieu (Environment / Weather)", val: issue.ishikawa?.milieu || "High atmospheric humidity and heavy overnight rainfall." },
              ].map((factor, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase block">
                    {factor.title}
                  </span>
                  <p className="text-slate-700 text-xs">{factor.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: CAPA ACTION PLANNING                                            */}
      {/* ========================================================================= */}
      {activeTab === "3_ActionPlan" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Wrench className="size-4 text-primary" /> Stage 3: Corrective & Preventive Action Plan
              </h3>
              <p className="text-slate-500 text-xs">
                Two-pronged resolution: immediate correction of this defect + systemic engineering change to guarantee non-recurrence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCorrectiveAction(issue.corrective_action || "");
                setPreventiveAction(issue.preventive_action || "");
                setCapaOwner(issue.capa_owner || issue.assigned_to);
                setTargetDate(issue.capa_target_date || new Date().toISOString().split("T")[0]);
                setActionPlanModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shrink-0 cursor-pointer"
            >
              <Edit3 className="size-3.5" /> Edit Action Plan
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 space-y-2">
              <span className="rounded bg-blue-200 text-blue-900 font-bold px-2 py-0.5 text-[10px] uppercase">
                1. Immediate Corrective Action (The Fix)
              </span>
              <p className="text-slate-800 text-xs font-medium leading-relaxed mt-2">
                {issue.corrective_action || "Re-calibrate batch plant moisture probe; perform 28-day core test on 4th floor slab."}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-2">
              <span className="rounded bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 text-[10px] uppercase">
                2. Systemic Preventive Action (The Immunity)
              </span>
              <p className="text-slate-800 text-xs font-medium leading-relaxed mt-2">
                {issue.preventive_action || "Revise SOP-CIV-002 to mandate dual digital moisture probe sensors and daily physical oven check."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-slate-600">
            <span>Action Plan Owner: <strong className="text-slate-900">{issue.capa_owner || issue.assigned_to}</strong></span>
            <span>Target Implementation Date: <strong className="text-slate-900">{issue.capa_target_date || "2026-09-15"}</strong></span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: IMPLEMENTATION VERIFICATION & FIELD EVIDENCE                     */}
      {/* ========================================================================= */}
      {activeTab === "4_Verification" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileCheck className="size-4 text-primary" /> Stage 4: Implementation Verification
              </h3>
              <p className="text-slate-500 text-xs">
                Independent QA verification that corrective and preventive controls have been completed on site.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setVerificationEvidence(issue.verification_evidence || "");
                setVerificationNotes(issue.verification_notes || "");
                setVerificationModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" /> Record Verification
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            {issue.verified_at ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-emerald-800 font-bold bg-emerald-100/60 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" /> Physical Implementation Verified on Site
                  </span>
                  <span className="text-[11px]">
                    Verified by: {issue.verified_by} on {new Date(issue.verified_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Verification Field Notes:</span>
                  <p className="text-slate-800">{issue.verification_notes}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">
                Awaiting field verification. Click "Record Verification" once rectification work has been inspected by QA.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 5: EFFECTIVENESS REVIEW & FINAL QA CLOSURE                          */}
      {/* ========================================================================= */}
      {activeTab === "5_Effectiveness" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="size-4 text-emerald-600" /> Stage 5: 30-Day Effectiveness Review & Closure
              </h3>
              <p className="text-slate-500 text-xs">
                Final stage: 30-day post-rectification monitoring window verifying zero recurrence before official ISO 9001 closure.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRecurrenceObserved(issue.recurrence_observed || false);
                setEffectivenessNotes(issue.effectiveness_notes || "");
                setEffectivenessModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shrink-0 cursor-pointer"
            >
              <Award className="size-3.5" /> Sign Off Effectiveness
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monitoring Period</span>
                <strong className="text-slate-900 font-bold text-sm">30 Days Active Site Audit</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Defect Recurrence</span>
                <strong className={issue.recurrence_observed ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                  {issue.recurrence_observed ? "Recurrence Detected" : "0% Non-Recurrence"}
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">QA Sign-Off Status</span>
                <strong className={issue.status === "Closed" || issue.status === "Resolved" ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {issue.status === "Closed" || issue.status === "Resolved" ? "Officially Certified Closed" : "Pending Effectiveness Window"}
                </strong>
              </div>
            </div>

            {issue.effectiveness_notes && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Quality Manager Review Notes:</span>
                <p className="text-slate-800">{issue.effectiveness_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STAGE 1 IMMEDIATE CONTAINMENT                                    */}
      {/* ========================================================================= */}
      <Dialog open={containmentModalOpen} onOpenChange={setContainmentModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">
              Record Immediate Site Containment
            </DialogTitle>
            <DialogDescription className="text-xs">
              Document containment protocols executed on site to stop defect propagation.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Containment Action Taken *
              </label>
              <textarea
                rows={4}
                value={containmentAction}
                onChange={(e) => setContainmentAction(e.target.value)}
                placeholder="e.g. Work halted on column C14; batch quarantined; area barricaded..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setContainmentModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveContainment}
              className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-xs"
            >
              Save & Advance to Stage 2
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: STAGE 2 ROOT CAUSE ANALYSIS STUDIO                               */}
      {/* ========================================================================= */}
      <Dialog open={rcaModalOpen} onOpenChange={setRcaModalOpen}>
        <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">
              Root Cause Analysis Studio (5 Whys & Ishikawa 6M)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Deconstruct the deviation using standard ISO 9001:2015 root cause methodologies.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-5 text-xs text-left">
            {/* 5 Whys Section */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block border-b border-slate-100 pb-1">
                Five Whys Methodology:
              </span>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Why 1 (Direct observation):</label>
                <input
                  type="text"
                  value={why1}
                  onChange={(e) => setWhy1(e.target.value)}
                  placeholder="e.g. Concrete cube strength fell below design mix..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Why 2 (Immediate causal factor):</label>
                <input
                  type="text"
                  value={why2}
                  onChange={(e) => setWhy2(e.target.value)}
                  placeholder="e.g. Water-cement ratio was delivered higher than specification..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Why 3 (Process condition):</label>
                <input
                  type="text"
                  value={why3}
                  onChange={(e) => setWhy3(e.target.value)}
                  placeholder="e.g. Moisture sensor in aggregate bin drifted +4.2%..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Why 4 (Inspection lapse):</label>
                <input
                  type="text"
                  value={why4}
                  onChange={(e) => setWhy4(e.target.value)}
                  placeholder="e.g. Manual pre-batch calibration was skipped..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-rose-900 font-bold block mb-1">Fundamental Root Cause *:</label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="e.g. Absence of automated calibration lock in dispatch software..."
                  className="w-full rounded-lg border border-rose-300 bg-rose-50/30 px-3 py-1.5 text-xs font-bold text-rose-950"
                />
              </div>
            </div>

            {/* Ishikawa 6M Section */}
            <div className="space-y-2.5 pt-2">
              <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block border-b border-slate-100 pb-1">
                Ishikawa (Fishbone) 6M Categories:
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">1. Man (Personnel/Training):</label>
                  <input
                    type="text"
                    value={ishikawaMan}
                    onChange={(e) => setIshikawaMan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">2. Machine (Plant/Tools):</label>
                  <input
                    type="text"
                    value={ishikawaMachine}
                    onChange={(e) => setIshikawaMachine(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">3. Method (Procedure/SOP):</label>
                  <input
                    type="text"
                    value={ishikawaMethod}
                    onChange={(e) => setIshikawaMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">4. Material (Aggregates/Raw):</label>
                  <input
                    type="text"
                    value={ishikawaMaterial}
                    onChange={(e) => setIshikawaMaterial(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">5. Measurement (Calibration):</label>
                  <input
                    type="text"
                    value={ishikawaMeasurement}
                    onChange={(e) => setIshikawaMeasurement(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">6. Milieu (Environment/Weather):</label>
                  <input
                    type="text"
                    value={ishikawaMilieu}
                    onChange={(e) => setIshikawaMilieu(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setRcaModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRca}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 shadow-xs"
            >
              Save RCA & Advance to Stage 3
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: STAGE 3 ACTION PLAN                                              */}
      {/* ========================================================================= */}
      <Dialog open={actionPlanModalOpen} onOpenChange={setActionPlanModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">
              Formulate CAPA Action Plan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Establish immediate corrective actions and systemic preventive engineering measures.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-3 text-left">
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                1. Immediate Corrective Action (The Fix) *
              </label>
              <textarea
                rows={3}
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder="What action will rectify the specific defective component..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">
                2. Systemic Preventive Action (The Immunity) *
              </label>
              <textarea
                rows={3}
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                placeholder="What SOP revisions, calibration protocols, or training will prevent recurrence..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Action Owner *</label>
                <select
                  value={capaOwner}
                  onChange={(e) => setCapaOwner(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                >
                  {PEOPLE.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Target Date *</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setActionPlanModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveActionPlan}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 shadow-xs"
            >
              Commit Plan & Advance to Stage 4
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: STAGE 4 VERIFICATION                                             */}
      {/* ========================================================================= */}
      <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">
              Record Implementation Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm that corrective & preventive controls are live on site.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-3 text-left">
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Evidence Document / Test Certificate Ref:
              </label>
              <input
                type="text"
                value={verificationEvidence}
                onChange={(e) => setVerificationEvidence(e.target.value)}
                placeholder="e.g. Core Test Lab Report #CT-2026-881"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Verification Field Observations *:
              </label>
              <textarea
                rows={4}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Document observed results, recalibration verification, inspector names..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setVerificationModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveVerification}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              Sign Off & Advance to Stage 5
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 5: STAGE 5 EFFECTIVENESS & CLOSURE                                  */}
      {/* ========================================================================= */}
      <Dialog open={effectivenessModalOpen} onOpenChange={setEffectivenessModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">
              30-Day Effectiveness Review & Closure
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm zero defect recurrence during monitoring window before final sign-off.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-4 text-left">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 block">Recurrence Evaluation Check:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-800">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={!recurrenceObserved}
                    onChange={() => setRecurrenceObserved(false)}
                  />
                  <span>No Recurrence Observed (Successful CAPA)</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-rose-800">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={recurrenceObserved}
                    onChange={() => setRecurrenceObserved(true)}
                  />
                  <span>Recurrence Observed (Re-investigate)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Quality Manager Final Review Remarks:
              </label>
              <textarea
                rows={3}
                value={effectivenessNotes}
                onChange={(e) => setEffectivenessNotes(e.target.value)}
                placeholder="Document zero recurrence observations across the 30-day site monitoring period..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setEffectivenessModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEffectiveness}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs"
            >
              Sign Off & Complete CAPA
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

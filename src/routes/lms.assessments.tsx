import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useSiteflow, CURRENT_USER, actions,
  type PracticalAssessment, type AssessmentCriterion
} from "@/lib/siteflow-store";
import {
  GraduationCap, Plus, Search, CheckCircle2, AlertTriangle, Clock,
  FileCheck, Edit2, Trash2, Eye, ShieldCheck, UserCheck, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/lms/assessments")({
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const state = useSiteflow();
  const [activeTab, setActiveTab] = useState<"master" | "evaluations">("master");
  const [search, setSearch] = useState("");

  // Create / Edit Assessment Modal
  const [editingAssessment, setEditingAssessment] = useState<Partial<PracticalAssessment> | null>(null);

  // Evaluation / Grading Modal
  const [gradingAssessment, setGradingAssessment] = useState<PracticalAssessment | null>(null);
  const [gradingScore, setGradingScore] = useState(85);
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [criteriaResults, setCriteriaResults] = useState<Record<string, "Pass" | "Fail">>({});

  // Employee Submission Modal
  const [submittingAssessment, setSubmittingAssessment] = useState<PracticalAssessment | null>(null);
  const [submittedNotes, setSubmittedNotes] = useState("");

  // Filtered Assessments
  const filteredMaster = state.assessments.filter((a) => {
    const sop = state.sops.find((s) => s.id === a.sop_id);
    const text = `${a.title} ${a.assessment_type ?? ""} ${sop?.name ?? ""} ${a.user_name}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Open Grading Modal
  const openGrading = (assessment: PracticalAssessment) => {
    setGradingAssessment(assessment);
    setGradingScore(assessment.evaluator_score ?? 85);
    setGradingFeedback(assessment.evaluator_feedback ?? "");
    const initialCriteria: Record<string, "Pass" | "Fail"> = {};
    const defaultCriteria = assessment.criteria && assessment.criteria.length > 0
      ? assessment.criteria
      : [
          { id: "c-1", name: "Pre-execution site & hazard verification" },
          { id: "c-2", name: "Correct tool/equipment deployment & calibration" },
          { id: "c-3", name: "Execution conformance to SOP tolerances" },
          { id: "c-4", name: "Documentation & sign-off compliance" },
        ];
    defaultCriteria.forEach((c) => {
      initialCriteria[c.id] = c.result ?? "Pass";
    });
    setCriteriaResults(initialCriteria);
  };

  // Submit Grade
  const handleGrade = (passed: boolean) => {
    if (!gradingAssessment) return;
    actions.evaluatePracticalAssessment(
      gradingAssessment.sop_id,
      gradingScore,
      passed,
      gradingFeedback || (passed ? "Demonstrated sound engineering standards and execution control." : "Failed required criteria benchmarks.")
    );
    toast.success(`Assessment graded as ${passed ? "PASSED" : "FAILED"}.`);
    setGradingAssessment(null);
  };

  // Submit Employee Work
  const handleSubmitPractical = () => {
    if (!submittingAssessment) return;
    if (!submittedNotes.trim()) {
      toast.error("Please enter your observation and verification evidence log.");
      return;
    }
    actions.submitPracticalAssessment(submittingAssessment.sop_id, submittedNotes);
    toast.success("Assessment submitted to QA Lead for evaluation.");
    setSubmittingAssessment(null);
    setSubmittedNotes("");
  };

  // Save / Create Assessment
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment || !editingAssessment.title || !editingAssessment.sop_id) {
      toast.error("Please provide an Assessment Title and SOP.");
      return;
    }

    const sop = state.sops.find((s) => s.id === editingAssessment.sop_id);

    actions.saveAssessment({
      id: editingAssessment.id,
      sop_id: editingAssessment.sop_id,
      title: editingAssessment.title,
      scenario_description: editingAssessment.scenario_description || "Real-world site execution verification scenario.",
      expected_outputs: editingAssessment.expected_outputs || "Field checklist, photographs, and dimensional verification log.",
      user_name: editingAssessment.user_name || CURRENT_USER.name,
      assessment_type: editingAssessment.assessment_type || "Simulation",
      evaluator_name: editingAssessment.evaluator_name || "Quality Manager",
      due_date: editingAssessment.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: editingAssessment.status || "Not Submitted",
      criteria: [
        { id: "c-1", name: "Safety & PPE Verification", result: null },
        { id: "c-2", name: "SOP Step Sequence Adherence", result: null },
        { id: "c-3", name: "Quality Checkpoint Measurement", result: null },
        { id: "c-4", name: "NCR / Deviation Reporting", result: null },
      ],
    });

    toast.success("Assessment configured successfully!");
    setEditingAssessment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Practical & Simulation Assessments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Validate on-site competence through scenario observations, simulation rubrics, and QA lead evaluations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setEditingAssessment({
                title: "",
                sop_id: state.sops[0]?.id ?? "",
                assessment_type: "Simulation",
                scenario_description: "",
                expected_outputs: "",
                user_name: CURRENT_USER.name,
                evaluator_name: "Quality Manager",
                due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                status: "Not Submitted",
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="size-3.5" /> Create Assessment
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("master")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "master"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Assessment Master ({state.assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("evaluations")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "evaluations"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Evaluations & Submissions ({state.assessments.filter((a) => a.status !== "Not Submitted").length})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assessments, SOPs or learners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ASSESSMENT MASTER LIST                                             */}
      {/* ========================================================================= */}
      {activeTab === "master" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Assessment Title</th>
                  <th className="px-4 py-3">Linked SOP</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Assigned Learner</th>
                  <th className="px-4 py-3">Evaluator</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaster.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No practical assessments configured. Click "Create Assessment" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredMaster.map((a) => {
                    const sop = state.sops.find((s) => s.id === a.sop_id);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{a.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{a.scenario_description}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">{sop?.name ?? "General SOP"}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{sop?.version_number ?? "V1.0"}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-800 font-semibold text-[10px]">
                            {a.assessment_type || "Simulation"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {a.user_name}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {a.evaluator_name || "Quality Lead"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {a.status === "Passed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 className="size-3" /> Passed ({a.evaluator_score}%)
                            </span>
                          ) : a.status === "Under Evaluation" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <Clock className="size-3" /> Under Review
                            </span>
                          ) : a.status === "Failed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                              <AlertTriangle className="size-3" /> Failed ({a.evaluator_score}%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              Not Submitted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1">
                          {a.status === "Not Submitted" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSubmittingAssessment(a);
                                setSubmittedNotes(a.submitted_data || "");
                              }}
                              title="Submit Field Observation"
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                              <FileCheck className="size-3" /> Submit
                            </button>
                          )}
                          {a.status === "Under Evaluation" && (
                            <button
                              type="button"
                              onClick={() => openGrading(a)}
                              title="Grade Assessment"
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-xs"
                            >
                              <ShieldCheck className="size-3" /> Grade
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingAssessment(a)}
                            title="Edit Assessment"
                            className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete assessment "${a.title}"?`)) {
                                actions.deleteAssessment(a.id);
                                toast.success("Assessment deleted.");
                              }
                            }}
                            title="Delete Assessment"
                            className="inline-flex items-center justify-center size-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVALUATIONS & SUBMISSION LOG                                       */}
      {/* ========================================================================= */}
      {activeTab === "evaluations" && (
        <div className="space-y-4">
          {state.assessments.filter((a) => a.status !== "Not Submitted").length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              No learner submissions submitted for evaluation yet.
            </div>
          ) : (
            state.assessments
              .filter((a) => a.status !== "Not Submitted")
              .map((a) => {
                const sop = state.sops.find((s) => s.id === a.sop_id);
                return (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {sop?.name} · {a.assessment_type || "Simulation"}
                        </span>
                        <h3 className="font-display text-base font-bold text-slate-900">{a.title}</h3>
                        <p className="text-xs text-slate-500">Learner: <strong className="text-slate-800">{a.user_name}</strong></p>
                      </div>

                      <div className="flex items-center gap-2">
                        {a.status === "Passed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="size-3.5" /> Passed ({a.evaluator_score}%)
                          </span>
                        ) : a.status === "Failed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                            <AlertTriangle className="size-3.5" /> Failed ({a.evaluator_score}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            <Clock className="size-3.5" /> Awaiting QA Grade
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => openGrading(a)}
                          className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                        >
                          {a.status === "Under Evaluation" ? "Evaluate Now" : "Re-evaluate"}
                        </button>
                      </div>
                    </div>

                    {/* Submitted Evidence */}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Submitted Observation Log:</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{a.submitted_data}</p>
                    </div>

                    {/* Evaluator Feedback if available */}
                    {a.evaluator_feedback && (
                      <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-3 text-xs">
                        <span className="font-bold text-emerald-900 block mb-0.5">QA Lead Evaluation Notes:</span>
                        <p className="text-slate-700">{a.evaluator_feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT PRACTICAL OBSERVATION (LEARNER)                             */}
      {/* ========================================================================= */}
      <Dialog open={!!submittingAssessment} onOpenChange={(open) => !open && setSubmittingAssessment(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-slate-900">
              Submit Practical Site Observation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record physical observation findings, checklist verification notes, and execution proof.
            </DialogDescription>
          </DialogHeader>

          {submittingAssessment && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                <span className="font-bold text-blue-900 block mb-1">Mandatory Deliverables:</span>
                <p className="text-blue-800 leading-relaxed">{submittingAssessment.expected_outputs}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Observation Log & Verification Notes *
                </label>
                <textarea
                  rows={6}
                  value={submittedNotes}
                  onChange={(e) => setSubmittedNotes(e.target.value)}
                  placeholder="Enter observation timestamps, tool IDs, dimensional readings, and safety checks..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSubmittingAssessment(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPractical}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                >
                  Submit for QA Review
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: GRADE / EVALUATE ASSESSMENT (QA LEAD)                             */}
      {/* ========================================================================= */}
      <Dialog open={!!gradingAssessment} onOpenChange={(open) => !open && setGradingAssessment(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-slate-900">
              Evaluate Practical Simulation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Grade learner's submitted site observations against ISO 9001:2015 competency rubrics.
            </DialogDescription>
          </DialogHeader>

          {gradingAssessment && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <span className="font-bold text-slate-700 block mb-1">Learner Submission:</span>
                <p className="text-slate-600 whitespace-pre-line max-h-32 overflow-y-auto">
                  {gradingAssessment.submitted_data || "No text submitted."}
                </p>
              </div>

              {/* Rubric Criteria Checklist */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">Rubric Evaluation Criteria:</label>
                <div className="space-y-2">
                  {Object.keys(criteriaResults).map((cId, idx) => {
                    const labels = [
                      "Pre-execution site & hazard verification",
                      "Correct tool/equipment deployment & calibration",
                      "Execution conformance to SOP tolerances",
                      "Documentation & sign-off compliance",
                    ];
                    const label = labels[idx] || `Checkpoint ${idx + 1}`;
                    const currentVal = criteriaResults[cId] || "Pass";

                    return (
                      <div key={cId} className="flex items-center justify-between rounded-xl border border-slate-200 p-2.5 bg-white">
                        <span className="font-medium text-slate-700">{label}</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCriteriaResults({ ...criteriaResults, [cId]: "Pass" })}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer",
                              currentVal === "Pass"
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => setCriteriaResults({ ...criteriaResults, [cId]: "Fail" })}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer",
                              currentVal === "Fail"
                                ? "bg-rose-100 border-rose-300 text-rose-800"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            Fail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Score (0-100%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gradingScore}
                    onChange={(e) => setGradingScore(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Benchmark Status</label>
                  <div className="py-2">
                    {gradingScore >= 80 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-4" /> Qualifies (&ge; 80%)
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="size-4" /> Below Pass Mark
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">QA Lead Evaluation Feedback</label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Feedback on observation rigor and non-conformance detection..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleGrade(false)}
                  className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                >
                  Fail & Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleGrade(true)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Pass & Certify
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT ASSESSMENT                                           */}
      {/* ========================================================================= */}
      <Dialog open={!!editingAssessment} onOpenChange={(open) => !open && setEditingAssessment(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-slate-900">
              {editingAssessment?.id ? "Edit Assessment" : "Create Practical Assessment"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure practical field simulation checkpoints and assign evaluators.
            </DialogDescription>
          </DialogHeader>

          {editingAssessment && (
            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={editingAssessment.title || ""}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment, title: e.target.value })}
                  placeholder="e.g., Pre-pour Shuttering & Rebar Simulation"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Linked SOP *</label>
                  <select
                    required
                    value={editingAssessment.sop_id || ""}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, sop_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    {state.sops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assessment Type</label>
                  <select
                    value={editingAssessment.assessment_type || "Simulation"}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, assessment_type: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    <option value="Simulation">Simulation</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Scenario-based">Scenario-based</option>
                    <option value="Evaluator-led">Evaluator-led</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scenario Description</label>
                <textarea
                  rows={2}
                  value={editingAssessment.scenario_description || ""}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment, scenario_description: e.target.value })}
                  placeholder="Detail the active work zone scenario presented to the candidate..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandatory Submission Deliverables</label>
                <textarea
                  rows={2}
                  value={editingAssessment.expected_outputs || ""}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment, expected_outputs: e.target.value })}
                  placeholder="e.g., Slump test reading, cover block photo, signed check-sheet..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Candidate / Learner</label>
                  <input
                    type="text"
                    value={editingAssessment.user_name || CURRENT_USER.name}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, user_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Evaluator</label>
                  <input
                    type="text"
                    value={editingAssessment.evaluator_name || "Quality Lead"}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, evaluator_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAssessment(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                >
                  Save Assessment
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

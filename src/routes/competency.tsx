import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  HelpCircle,
  FileText,
  Printer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { QuizRunnerModal } from "@/components/QuizRunnerModal";
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
  useSiteflow,
  type Quiz,
  type QuizQuestion,
  type PracticalAssessment,
  type EmployeeQualification,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/competency")({
  component: CompetencyPage,
});

function CompetencyPage() {
  const state = useSiteflow();
  const [activeTab, setActiveTab] = useState<"assigned" | "practical" | "certificates" | "qa_admin">("assigned");

  // Quiz Runner Modal State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    scorePct: number;
    passed: boolean;
    isLocked: boolean;
    attemptNum: number;
  } | null>(null);

  // Practical Assessment Modal State
  const [submittingAssessment, setSubmittingAssessment] = useState<PracticalAssessment | null>(null);
  const [practicalNotes, setPracticalNotes] = useState("");

  // QA Grading Modal State
  const [gradingAssessment, setGradingAssessment] = useState<PracticalAssessment | null>(null);
  const [gradingScore, setGradingScore] = useState(85);
  const [gradingFeedback, setGradingFeedback] = useState("");

  // Certificate Preview Modal State
  const [viewingCertificate, setViewingCertificate] = useState<EmployeeQualification | null>(null);

  // SOP Learning / Study Modal State
  const [studyingSop, setStudyingSop] = useState<typeof state.sops[0] | null>(null);

  // Filter quizzes and qualifications for CURRENT_USER
  const userQualifications = state.qualifications.filter((q) => q.user_name === CURRENT_USER.name);
  const userAssessments = state.assessments.filter((a) => a.user_name === CURRENT_USER.name);

  // Helper to get quiz state for an SOP
  const getSopQuizMeta = (sopId: string) => {
    const quiz = state.quizzes.find((q) => q.sop_id === sopId);
    if (!quiz) return null;

    const attempts = state.quizAttempts.filter(
      (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name
    );
    const passedAttempt = attempts.find((a) => a.passed);
    const attemptsCount = attempts.length;
    const isLocked = !passedAttempt && attemptsCount >= quiz.max_attempts;

    return {
      quiz,
      attempts,
      attemptsCount,
      passedAttempt,
      isLocked,
      passed: Boolean(passedAttempt),
    };
  };

  // Start Quiz
  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    // Check that all questions have been answered
    const unanswered = activeQuiz.questions.some((q) => !selectedAnswers[q.id]);
    if (unanswered) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }

    let earned = 0;
    let total = 0;
    activeQuiz.questions.forEach((q) => {
      total += q.marks;
      if (selectedAnswers[q.id]?.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
        earned += q.marks;
      }
    });

    const scorePct = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = scorePct >= activeQuiz.passing_pct;
    const attempts = state.quizAttempts.filter(
      (a) => a.sop_id === activeQuiz.sop_id && a.user_name === CURRENT_USER.name
    );
    const attemptNum = attempts.length + 1;
    const isLocked = !passed && attemptNum >= activeQuiz.max_attempts;

    actions.submitQuizAttempt(activeQuiz.sop_id, selectedAnswers);

    setQuizResult({
      scorePct,
      passed,
      isLocked,
      attemptNum,
    });

    if (passed) {
      toast.success(`Exam Passed (${scorePct}%)! Certification updated.`);
    } else if (isLocked) {
      toast.error(`Exam Failed (${scorePct}%). Maximum attempts exhausted.`);
    } else {
      toast.error(`Exam Failed (${scorePct}%). ${activeQuiz.max_attempts - attemptNum} attempts remaining.`);
    }
  };

  // Submit Practical Assessment
  const handleSubmitPractical = () => {
    if (!submittingAssessment) return;
    if (!practicalNotes.trim()) {
      toast.error("Please enter your scenario observations and field verification log.");
      return;
    }

    actions.submitPracticalAssessment(submittingAssessment.sop_id, practicalNotes);
    toast.success("Practical simulation checklist submitted to QA Lead for grading.");
    setSubmittingAssessment(null);
    setPracticalNotes("");
  };

  // Grade Practical Assessment (QA Lead Action)
  const handleGradePractical = (passed: boolean) => {
    if (!gradingAssessment) return;
    actions.evaluatePracticalAssessment(
      gradingAssessment.sop_id,
      gradingScore,
      passed,
      gradingFeedback || (passed ? "Demonstrated sound compliance with field controls." : "Non-conformances noted; rework required.")
    );
    toast.success(`Graded assessment as ${passed ? "PASSED" : "FAILED"}`);
    setGradingAssessment(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Workforce Competency & Learning Portal"
        subtitle="Mandatory ISO 9001:2015 competency qualifications, interactive exam runner, and practical site assessments."
      />

      {/* Top Learner Scorecard Banner */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Practitioner
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <p className="font-display text-xl font-bold text-slate-900 mt-2">{CURRENT_USER.name}</p>
          <span className="text-xs font-semibold text-primary">{CURRENT_USER.role}</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Qualified SOPs
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-emerald-950 mt-2">
            {userQualifications.length}
          </p>
          <span className="text-xs text-emerald-700 font-medium">100% Compliance Verified</span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Competency Exams
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Award className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-blue-950 mt-2">
            {state.quizzes.length} Available
          </p>
          <span className="text-xs text-blue-700 font-medium">80% Passing Threshold (BR-04)</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Simulation Checks
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FileCheck className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-amber-950 mt-2">
            {userAssessments.filter((a) => a.status === "Passed").length} / {state.assessments.length}
          </p>
          <span className="text-xs text-amber-700 font-medium">Field Observations</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="mb-6 flex border-b border-slate-200 space-x-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("assigned")}
          className={cn(
            "flex items-center gap-2 pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "assigned"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <BookOpen className="size-4" />
          <span>My SOPs & Quizzes ({state.sops.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("practical")}
          className={cn(
            "flex items-center gap-2 pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "practical"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <FileCheck className="size-4" />
          <span>Practical Simulation Assessments ({state.assessments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certificates")}
          className={cn(
            "flex items-center gap-2 pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "certificates"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <Award className="size-4" />
          <span>Digital Certificates ({userQualifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qa_admin")}
          className={cn(
            "flex items-center gap-2 pb-3 px-4 border-b-2 transition-all cursor-pointer ml-auto",
            activeTab === "qa_admin"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>QA Lead Exam Center</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY SOPS & QUIZZES (BRD SECTION 7.8 & 7.10)                        */}
      {/* ========================================================================= */}
      {activeTab === "assigned" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs flex items-start gap-3">
            <Info className="size-4 text-slate-600 shrink-0 mt-0.5" />
            <p className="text-slate-600 leading-relaxed">
              Before signing off construction checklists on site, engineers must qualify the SOP competency exam with a minimum score of <strong>80%</strong>. Per Rule <strong>BR-05</strong>, you have a maximum of <strong>3 attempts</strong>. If all 3 attempts fail, the exam is locked until unlocked by a Quality Manager.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.sops.map((sop) => {
              const meta = getSopQuizMeta(sop.id);
              const steps = state.steps.filter((st) => st.sop_id === sop.id);
              const qual = userQualifications.find((q) => q.sop_id === sop.id);

              return (
                <div
                  key={sop.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all text-left"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
                        {sop.version_number || "V1.0"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {sop.department} Works
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug mb-1">
                      {sop.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {sop.description}
                    </p>

                    {/* Competency Status Banner */}
                    <div className="mb-4 rounded-xl p-3 border text-xs">
                      {meta?.passed ? (
                        <div className="flex items-center justify-between text-emerald-800 bg-emerald-50/50 -m-1 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            Qualified ({meta.passedAttempt?.score_pct}%)
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            Passed in Attempt #{meta.passedAttempt?.attempt_number}
                          </span>
                        </div>
                      ) : meta?.isLocked ? (
                        <div className="flex items-center justify-between text-rose-800 bg-rose-50 -m-1 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Lock className="size-4 text-rose-600" />
                            Exam Locked
                          </span>
                          <span className="text-[10px] font-semibold text-rose-600">
                            3 of 3 attempts used
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-slate-700 bg-slate-50 -m-1 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <HelpCircle className="size-4 text-slate-400" />
                            Not Qualified
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Attempts: {meta?.attemptsCount || 0} / {meta?.quiz.max_attempts || 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setStudyingSop(sop)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <BookOpen className="size-3" /> Study SOP
                    </button>

                    {meta?.passed ? (
                      qual ? (
                        <button
                          type="button"
                          onClick={() => setViewingCertificate(qual)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                        >
                          <Award className="size-3.5" /> View Certificate
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Qualified
                        </span>
                      )
                    ) : meta?.isLocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          toast.error("Contact your Quality Manager in the QA Lead tab to unlock your attempts.");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                      >
                        <Lock className="size-3.5 text-rose-500" /> Locked
                      </button>
                    ) : meta?.quiz ? (
                      <button
                        type="button"
                        onClick={() => startQuiz(meta.quiz)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        <Play className="size-3" /> Start Exam
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No Quiz Set</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRACTICAL SIMULATION ASSESSMENTS (BRD SECTION 7.11)                */}
      {/* ========================================================================= */}
      {activeTab === "practical" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs flex items-start gap-3">
            <FileCheck className="size-4 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-blue-900 leading-relaxed">
              Practical Scenario Observations test an engineer's ability to identify physical hazards, deviations, and correct execution protocols on active sites. Submissions are reviewed and graded by the Quality Manager before certification is issued (Rule <strong>BR-06</strong>).
            </p>
          </div>

          <div className="space-y-4">
            {state.assessments.map((assessment) => {
              const sop = state.sops.find((s) => s.id === assessment.sop_id);

              return (
                <div
                  key={assessment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Practical Simulation · {sop?.name}
                      </span>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {assessment.title}
                      </h3>
                    </div>

                    <div>
                      {assessment.status === "Passed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="size-3.5" /> Passed ({assessment.evaluator_score}%)
                        </span>
                      ) : assessment.status === "Under Evaluation" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          <Clock className="size-3.5" /> Under QA Review
                        </span>
                      ) : assessment.status === "Failed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                          <AlertTriangle className="size-3.5" /> Failed ({assessment.evaluator_score}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Not Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                        Scenario Description:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {assessment.scenario_description}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                        Mandatory Submission Deliverables:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {assessment.expected_outputs}
                      </p>
                    </div>
                  </div>

                  {/* Submission details if already provided */}
                  {assessment.submitted_data && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span>Submitted Observation Log:</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          {assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {assessment.submitted_data}
                      </p>
                      {assessment.evaluator_feedback && (
                        <div className="mt-2 pt-2 border-t border-emerald-200/60 text-slate-600">
                          <strong>QA Lead Feedback:</strong> {assessment.evaluator_feedback}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {assessment.status === "Not Submitted" || assessment.status === "Failed" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSubmittingAssessment(assessment);
                          setPracticalNotes(assessment.submitted_data || "");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        <FileText className="size-3.5" />
                        {assessment.status === "Failed" ? "Re-submit Field Checklist" : "Submit Field Observation Checklist"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIGITAL CERTIFICATES (BRD SECTION 7.8.3 & BR-06)                   */}
      {/* ========================================================================= */}
      {activeTab === "certificates" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs flex items-start gap-3">
            <Award className="size-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-emerald-950 leading-relaxed">
              Digital Qualification Certificates are cryptographically generated when both the <strong>Theory Exam (≥80%)</strong> and the <strong>Practical Observation</strong> criteria are met. Certificates carry an official serial number and are valid for 12 months.
            </p>
          </div>

          {userQualifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <Award className="size-12 text-slate-300 mx-auto" />
              <h4 className="font-display text-base font-bold text-slate-800">No Certificates Earned Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Complete the competency exams and practical scenario checklists in the "My SOPs & Quizzes" tab to earn official site credentials.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("assigned")}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Go to Exam Center →
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userQualifications.map((qual) => (
                <div
                  key={qual.id}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 p-6 shadow-xs flex flex-col justify-between text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 size-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Accredited Practitioner
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {qual.certificate_number}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900 leading-tight mb-1">
                      {qual.sop_title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mb-4">
                      Specification Version: <strong className="font-mono text-indigo-700">{qual.version_number}</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-xl border border-slate-100 mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Score</span>
                        <strong className="text-emerald-700 font-bold text-sm">{qual.quiz_score_pct}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Valid Until</span>
                        <strong className="text-slate-800 font-bold text-sm">{qual.expires_at}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Awarded to: <strong className="text-slate-700">{qual.user_name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingCertificate(qual)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Award className="size-3.5" /> View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QA LEAD EXAM CENTER & ATTEMPT OVERRIDE                             */}
      {/* ========================================================================= */}
      {activeTab === "qa_admin" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs flex items-start gap-3">
            <ShieldCheck className="size-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold text-sm">
                Quality Assurance Lead & System Administrator Gateway
              </strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                As a QA Lead or Admin, you can evaluate submitted practical scenario checklists, review attempt histories, and unlock engineers whose attempts have been locked after 3 failures (Rule <strong>BR-05</strong>).
              </p>
            </div>
          </div>

          {/* Section: Pending Practical Evaluations */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="size-4 text-primary" /> Pending Practical Evaluations
            </h3>

            {state.assessments.filter((a) => a.status === "Under Evaluation").length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                No practical submissions currently pending evaluation.
              </div>
            ) : (
              <div className="space-y-3">
                {state.assessments
                  .filter((a) => a.status === "Under Evaluation")
                  .map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase text-primary">
                          Candidate: {a.user_name}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{a.submitted_data}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setGradingAssessment(a);
                          setGradingScore(90);
                          setGradingFeedback("Verified checklist accuracy and field controls.");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shrink-0"
                      >
                        <FileCheck className="size-3.5" /> Grade & Sign Off
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section: Locked Exams & Attempt Overrides */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="size-4 text-primary" /> Exam Attempt Unlocking & Reset
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {state.sops.map((sop) => {
                const meta = getSopQuizMeta(sop.id);

                return (
                  <div
                    key={sop.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500">{sop.version_number || "V1.0"}</span>
                        <span className="text-[10px] font-bold text-slate-400">{sop.department}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{sop.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Attempts by {CURRENT_USER.name}: <strong>{meta?.attemptsCount || 0} / 3</strong>
                      </p>
                      {meta?.isLocked && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ⚠️ LOCKED OUT
                        </span>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          actions.resetQuizAttempts(sop.id);
                          toast.success(`Exam attempts reset for ${sop.name}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <RotateCcw className="size-3" /> Reset Attempts
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE QUIZ RUNNER (UNIFIED SLEEK UI)                       */}
      {/* ========================================================================= */}
      <QuizRunnerModal
        quiz={activeQuiz}
        onClose={() => setActiveQuiz(null)}
      />

      {/* ========================================================================= */}
      {/* MODAL 2: PRACTICAL SCENARIO SUBMISSION                                    */}
      {/* ========================================================================= */}
      <Dialog open={!!submittingAssessment} onOpenChange={(open) => !open && setSubmittingAssessment(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          {submittingAssessment && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-slate-900">
                  Submit Field Observation: {submittingAssessment.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Provide your technical checklist, slope/compaction logs, and corrective notes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-relaxed">
                  <strong>Required Deliverable:</strong> {submittingAssessment.expected_outputs}
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    Your Field Observation & Protocol Actions:
                  </label>
                  <textarea
                    rows={6}
                    value={practicalNotes}
                    onChange={(e) => setPracticalNotes(e.target.value)}
                    placeholder="Document equipment used, pump flow rates, cover spacers replaced, reduced levels measured, and sign-off names..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSubmittingAssessment(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPractical}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
                >
                  Submit for QA Evaluation
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: QA LEAD EVALUATION                                               */}
      {/* ========================================================================= */}
      <Dialog open={!!gradingAssessment} onOpenChange={(open) => !open && setGradingAssessment(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {gradingAssessment && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-slate-900">
                  QA Evaluation: {gradingAssessment.user_name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {gradingAssessment.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Candidate Submission</span>
                  <p className="text-slate-800 mt-1 whitespace-pre-line">{gradingAssessment.submitted_data}</p>
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    Evaluation Score Percentage (0-100%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gradingScore}
                    onChange={(e) => setGradingScore(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    QA Feedback / Non-Conformance Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleGradePractical(false)}
                  className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Reject / Fail
                </button>
                <button
                  type="button"
                  onClick={() => handleGradePractical(true)}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Pass & Certify
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: SOP LEARNING / STUDY CONTENT                                        */}
      {/* ========================================================================= */}
      <Dialog open={!!studyingSop} onOpenChange={(open) => !open && setStudyingSop(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {studyingSop && (() => {
            const steps = state.steps.filter((st) => st.sop_id === studyingSop.id);
            const quizMeta = getSopQuizMeta(studyingSop.id);
            return (
              <>
                <DialogHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-primary/10 text-primary font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {studyingSop.department} · {studyingSop.version_number || "V1.0"}
                    </span>
                  </div>
                  <DialogTitle className="font-display text-xl font-bold text-slate-900 leading-tight">
                    {studyingSop.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs leading-relaxed">
                    {studyingSop.description}
                  </DialogDescription>
                </DialogHeader>

                {/* Learning Banner */}
                <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs">
                  <BookOpen className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-blue-900 leading-relaxed">
                    <strong>Study this SOP thoroughly</strong> before attempting the competency exam. Understanding each step is mandatory before site deployment per ISO 9001:2015 Clause 7.2.
                  </p>
                </div>

                {/* SOP Steps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Standard Operating Procedure — {steps.length} Steps
                  </h4>
                  {steps.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <FileText className="size-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">SOP content is being authored by the Process Owner. Check back later.</p>
                    </div>
                  ) : (
                    steps.map((step, idx) => (
                      <div key={step.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{step.instructions}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Department</span>
                    <span className="font-bold text-slate-800">{studyingSop.department}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Criticality</span>
                    <span className={cn("font-bold", studyingSop.criticality === "Critical" ? "text-rose-600" : studyingSop.criticality === "High" ? "text-amber-600" : "text-slate-800")}>
                      {studyingSop.criticality || "Standard"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Steps</span>
                    <span className="font-bold text-slate-800">{steps.length} Steps</span>
                  </div>
                </div>

                <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setStudyingSop(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  {quizMeta?.quiz && !quizMeta.passed && !quizMeta.isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudyingSop(null);
                        startQuiz(quizMeta.quiz);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all"
                    >
                      <Play className="size-3" /> I've Studied — Start Exam
                    </button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: OFFICIAL DIGITAL QUALIFICATION CERTIFICATE                       */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingCertificate} onOpenChange={(open) => !open && setViewingCertificate(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 shadow-2xl" style={{ borderRadius: "16px" }}>
          {viewingCertificate && (
            <div
              className="relative bg-white"
              style={{
                background: "linear-gradient(160deg, #fffdf5 0%, #ffffff 40%, #f8f9ff 100%)",
              }}
            >
              {/* Gold top stripe */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #b7791f, #d69e2e, #f6e05e, #d69e2e, #b7791f)" }} />

              {/* Outer decorative border */}
              <div className="m-4 rounded-xl border-2 border-amber-300/60 p-6 space-y-5">

                {/* Header: Logo + ISO badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-sm shadow-md">
                      SF
                    </div>
                    <div>
                      <p className="font-display text-[15px] font-extrabold text-slate-900 leading-tight">SiteFlow Global Construction</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Quality Compliance & Workforce Accreditation</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck className="size-3" /> ISO 9001:2015
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">ACCREDITED</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-amber-200" />

                {/* Certificate Title */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">✦ Official Credential of Competency ✦</p>
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                    Certificate of Technical Competency
                  </h2>
                  <p className="text-xs text-slate-500">This official document certifies that</p>
                </div>

                {/* Recipient Name */}
                <div className="text-center">
                  <p className="font-display text-3xl font-black text-primary" style={{ letterSpacing: "-0.02em" }}>
                    {viewingCertificate.user_name}
                  </p>
                  <div className="mt-1 h-0.5 w-32 mx-auto" style={{ background: "linear-gradient(90deg, transparent, #d69e2e, transparent)" }} />
                </div>

                {/* Description */}
                <div className="text-center">
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    has demonstrated rigorous mastery of engineering standards, safe execution controls, and quality verification checkpoints for:
                  </p>
                  <p className="font-display text-base font-bold text-slate-900 mt-2">
                    {viewingCertificate.sop_title}
                  </p>
                  <span className="inline-block mt-1 font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {viewingCertificate.version_number}
                  </span>
                </div>

                {/* Score badges */}
                <div className="grid grid-cols-3 gap-2 bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-center text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Exam Score</p>
                    <p className="text-lg font-extrabold text-emerald-700">{viewingCertificate.quiz_score_pct}%</p>
                  </div>
                  <div className="border-x border-amber-200">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Certificate No.</p>
                    <p className="font-bold text-slate-900 font-mono text-[10px] leading-tight">{viewingCertificate.certificate_number}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Valid Until</p>
                    <p className="font-bold text-slate-900 text-[11px]">{viewingCertificate.expires_at}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-end justify-between border-t border-amber-200 pt-4 text-xs">
                  <div className="text-left">
                    <div className="h-8 border-b border-slate-400 w-28 mb-1" />
                    <p className="font-bold text-slate-800">K. Iyer</p>
                    <p className="text-[10px] text-slate-500">Head of Quality Assurance</p>
                  </div>
                  <div className="text-center">
                    <div className="size-12 mx-auto flex items-center justify-center">
                      <Award className="size-8 text-amber-500" />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Official Seal</p>
                  </div>
                  <div className="text-right">
                    <div className="h-8 border-b border-slate-400 w-28 mb-1 ml-auto" />
                    <p className="font-bold text-slate-800">{viewingCertificate.user_name}</p>
                    <p className="text-[10px] text-slate-500">Project Director & Admin</p>
                  </div>
                </div>
              </div>

              {/* Gold bottom stripe */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #b7791f, #d69e2e, #f6e05e, #d69e2e, #b7791f)" }} />

              {/* Action buttons outside the decorative border */}
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                >
                  <Printer className="size-3.5" /> Print / Save Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCertificate(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

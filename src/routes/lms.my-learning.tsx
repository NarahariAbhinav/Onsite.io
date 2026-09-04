import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useSiteflow, CURRENT_USER, actions,
  type Sop, type SopStep, type LearningProgress, type Quiz,
} from "@/lib/siteflow-store";
import {
  BookOpen, Play, CheckCircle2, Lock, Clock, Search,
  ChevronRight, ChevronLeft, Award, FileText, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { QuizRunnerModal } from "@/components/QuizRunnerModal";

export const Route = createFileRoute("/lms/my-learning")({
  component: MyLearning,
});

type FilterTab = "All" | "Not Started" | "In Progress" | "Completed" | "Overdue";

function MyLearning() {
  const state = useSiteflow();
  const [filter, setFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [learningModal, setLearningModal] = useState<{
    sop: Sop;
    steps: SopStep[];
    progress: LearningProgress | null;
    currentStepIdx: number;
  } | null>(null);
  const [activeQuizRunner, setActiveQuizRunner] = useState<Quiz | null>(null);

  // Helper: get learning progress for current user + sop
  const getProgress = (sopId: string) =>
    state.learningProgress.find(
      (lp) => lp.sop_id === sopId && lp.user_name === CURRENT_USER.name
    ) ?? null;

  // Helper: get quiz metadata
  const getQuizMeta = (sopId: string) => {
    const quiz = state.quizzes.find((q) => q.sop_id === sopId);
    if (!quiz) return null;
    const attempts = state.quizAttempts.filter(
      (a) => a.sop_id === sopId && a.user_name === CURRENT_USER.name
    );
    const passed = attempts.find((a) => a.passed);
    const isLocked = !passed && attempts.length >= quiz.max_attempts;
    return { quiz, attempts, passed, isLocked };
  };

  const openLearning = (sop: Sop) => {
    const steps = state.steps.filter((st) => st.sop_id === sop.id);
    const progress = getProgress(sop.id);
    actions.ensureLearningProgress(sop.id);
    setLearningModal({ sop, steps, progress, currentStepIdx: 0 });
  };

  const markRead = () => {
    if (!learningModal) return;
    const { sop, steps, currentStepIdx } = learningModal;
    const step = steps[currentStepIdx];
    if (!step) return;
    actions.markStepRead(sop.id, step.id);
    // refresh progress in modal
    const newProgress = state.learningProgress.find(
      (lp) => lp.sop_id === sop.id && lp.user_name === CURRENT_USER.name
    ) ?? null;
    if (currentStepIdx < steps.length - 1) {
      setLearningModal((prev) =>
        prev ? { ...prev, currentStepIdx: currentStepIdx + 1, progress: newProgress } : prev
      );
    } else {
      toast.success("All steps read! Quiz is now unlocked.");
      setLearningModal((prev) => prev ? { ...prev, progress: newProgress } : prev);
    }
  };

  // Build card list from all SOPs
  const cards = state.sops.map((sop) => {
    const progress = getProgress(sop.id);
    const quizMeta = getQuizMeta(sop.id);
    const steps = state.steps.filter((st) => st.sop_id === sop.id);
    const status = progress?.status ?? "Not Started";
    const progressPct = progress?.progress_pct ?? 0;
    return { sop, progress, quizMeta, steps, status, progressPct };
  });

  const filtered = cards.filter((c) => {
    const matchFilter = filter === "All" || c.status === filter;
    const matchSearch = search === "" ||
      c.sop.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sop.department.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const FILTER_TABS: FilterTab[] = ["All", "Not Started", "In Progress", "Completed", "Overdue"];

  const statusColor = (status: string) => {
    if (status === "Completed") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (status === "In Progress") return "text-blue-700 bg-blue-50 border-blue-200";
    if (status === "Overdue") return "text-rose-700 bg-rose-50 border-rose-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  // In the modal
  const modalProgress = learningModal
    ? state.learningProgress.find(
        (lp) => lp.sop_id === learningModal.sop.id && lp.user_name === CURRENT_USER.name
      ) ?? null
    : null;

  const isCurrentStepRead = (stepId: string) =>
    modalProgress?.steps_read.some((r) => r.step_id === stepId) ?? false;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Learning</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Study each SOP before taking the competency quiz. Reading all steps unlocks the exam.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              "pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all",
              filter === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab}
            <span className="ml-1.5 text-[10px] font-normal text-slate-400">
              ({cards.filter((c) => tab === "All" || c.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="size-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No SOPs found for this filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ sop, progress, quizMeta, steps, status, progressPct }) => {
            const qual = state.qualifications.find(
              (q) => q.sop_id === sop.id && q.user_name === CURRENT_USER.name
            );
            return (
              <div
                key={sop.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-3 hover:shadow-md transition-all"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-600">
                        {sop.version_number ?? "V1.0"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{sop.department}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-slate-900 leading-snug">{sop.name}</h3>
                  </div>
                  <span className={cn("text-[10px] font-bold border rounded-full px-2 py-0.5 shrink-0", statusColor(status))}>
                    {status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Overall Progress</span>
                    <span className="font-bold text-slate-700">{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", progressPct >= 100 ? "bg-emerald-500" : "bg-primary")}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  {/* Sub-progress indicators */}
                  <div className="flex gap-2 mt-2 text-[10px]">
                    <span className={cn("flex items-center gap-0.5 font-semibold", progress?.all_steps_read ? "text-emerald-600" : "text-slate-400")}>
                      {progress?.all_steps_read ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                      Content
                    </span>
                    <span className={cn("flex items-center gap-0.5 font-semibold", quizMeta?.passed ? "text-emerald-600" : "text-slate-400")}>
                      {quizMeta?.passed ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                      Quiz
                    </span>
                    <span className={cn("flex items-center gap-0.5 font-semibold", qual ? "text-emerald-600" : "text-slate-400")}>
                      {qual ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                      Certified
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">{steps.length} steps</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openLearning(sop)}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <BookOpen className="size-3" />
                      {progress?.all_steps_read ? "Review" : "Study"}
                    </button>
                    {qual ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800">
                        <Award className="size-3" /> Certified
                      </span>
                    ) : quizMeta?.quiz && progress?.all_steps_read && !quizMeta.passed && !quizMeta.isLocked ? (
                      <button
                        type="button"
                        onClick={() => setActiveQuizRunner(quizMeta.quiz)}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
                      >
                        <Play className="size-3" /> Quiz Ready
                      </button>
                    ) : quizMeta?.isLocked ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600">
                        <Lock className="size-3" /> Locked
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Learning Detail Modal */}
      <Dialog open={!!learningModal} onOpenChange={(open) => !open && setLearningModal(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {learningModal && (() => {
            const { sop, steps, currentStepIdx } = learningModal;
            const currentStep = steps[currentStepIdx];
            const quizMeta = getQuizMeta(sop.id);
            const allRead = modalProgress?.all_steps_read ?? false;
            const stepRead = currentStep ? isCurrentStepRead(currentStep.id) : false;

            return (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">{sop.department} · {sop.version_number ?? "V1.0"}</p>
                    <DialogTitle className="font-display text-lg font-bold text-slate-900">{sop.name}</DialogTitle>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-500">Progress</p>
                    <p className="font-bold text-slate-900 text-base">{modalProgress?.progress_pct ?? 0}%</p>
                  </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Left Step Navigator */}
                  <aside className="w-44 shrink-0 border-r border-slate-100 overflow-y-auto p-2 space-y-0.5 bg-slate-50/50">
                    {steps.map((st, idx) => {
                      const isRead = isCurrentStepRead(st.id);
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setLearningModal((prev) => prev ? { ...prev, currentStepIdx: idx } : prev)}
                          className={cn(
                            "w-full text-left flex items-start gap-2 rounded-lg px-2 py-2 text-xs transition-all",
                            isCurrent ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <span className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5",
                            isCurrent ? "bg-white/20 text-white" : isRead ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                          )}>
                            {isRead && !isCurrent ? <CheckCircle2 className="size-3" /> : idx + 1}
                          </span>
                          <span className="leading-tight line-clamp-2">{st.title}</span>
                        </button>
                      );
                    })}
                    {/* Quiz Step */}
                    <div className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-xs mt-1 border",
                      allRead ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-100 text-slate-400"
                    )}>
                      <Play className="size-3 shrink-0" />
                      <span className="font-semibold">{allRead ? "Quiz Unlocked" : "Quiz (locked)"}</span>
                    </div>
                  </aside>

                  {/* Right Content Area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {currentStep ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step {currentStepIdx + 1} of {steps.length}</p>
                            <h3 className="font-display text-lg font-bold text-slate-900">{currentStep.title}</h3>
                          </div>
                          {stepRead && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 text-[11px] font-bold">
                              <CheckCircle2 className="size-3" /> Read
                            </span>
                          )}
                        </div>

                        {/* Learning Content */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Standard Instructions</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{currentStep.instructions}</p>
                        </div>

                        {/* Rich Learning Content if available */}
                        {currentStep.learning_content && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                            <h4 className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <BookOpen className="size-3" /> Detailed Learning Content
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{currentStep.learning_content}</p>
                          </div>
                        )}

                        {/* Nav Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            disabled={currentStepIdx === 0}
                            onClick={() => setLearningModal((prev) => prev ? { ...prev, currentStepIdx: currentStepIdx - 1 } : prev)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronLeft className="size-3.5" /> Previous
                          </button>
                          {!stepRead ? (
                            <button
                              type="button"
                              onClick={markRead}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
                            >
                              <CheckCircle2 className="size-3.5" /> Mark as Read & Continue
                            </button>
                          ) : currentStepIdx < steps.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setLearningModal((prev) => prev ? { ...prev, currentStepIdx: currentStepIdx + 1 } : prev)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                            >
                              Next <ChevronRight className="size-3.5" />
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="size-4" /> All steps read!
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-slate-400">Select a step to start learning.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
                  <p className="text-[11px] text-slate-500">
                    {modalProgress?.steps_read.length ?? 0} of {steps.length} steps read
                    {allRead ? " — Quiz is unlocked!" : " — Read all steps to unlock the quiz."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLearningModal(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Close
                    </button>
                    {allRead && quizMeta?.quiz && !quizMeta.passed && !quizMeta.isLocked && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetQuiz = quizMeta.quiz;
                          setLearningModal(null);
                          setActiveQuizRunner(targetQuiz);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer shadow-xs"
                      >
                        <Play className="size-3" /> Start Quiz Now
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Unified Quiz Runner Modal */}
      <QuizRunnerModal
        quiz={activeQuizRunner}
        onClose={() => setActiveQuizRunner(null)}
      />
    </div>
  );
}

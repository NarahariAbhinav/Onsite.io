import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useSiteflow, CURRENT_USER, actions,
  type Quiz, type QuizQuestion,
} from "@/lib/siteflow-store";
import {
  ClipboardList, Plus, Search, Play, RotateCcw, Edit2, Copy, Trash2,
  CheckCircle2, XCircle, Lock, Award, HelpCircle, ChevronRight, Filter, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { QuizRunnerModal } from "@/components/QuizRunnerModal";

export const Route = createFileRoute("/lms/quizzes")({
  component: QuizMasterPage,
});

function QuizMasterPage() {
  const state = useSiteflow();
  const [activeTab, setActiveTab] = useState<"master" | "results">("master");
  const [search, setSearch] = useState("");

  // Quiz Modal (Create / Edit)
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);

  // Active Quiz Runner
  const [runnerQuiz, setRunnerQuiz] = useState<Quiz | null>(null);

  // Filtered Quizzes
  const filteredQuizzes = state.quizzes.filter((q) => {
    const sop = state.sops.find((s) => s.id === q.sop_id);
    const text = `${q.title} ${q.quiz_code ?? ""} ${sop?.name ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Filtered Results
  const filteredResults = state.quizAttempts.filter((att) => {
    const quiz = state.quizzes.find((q) => q.id === att.quiz_id || q.sop_id === att.sop_id);
    const sop = state.sops.find((s) => s.id === att.sop_id);
    const text = `${att.user_name} ${quiz?.title ?? ""} ${sop?.name ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Handle Duplicate
  const handleDuplicate = (quiz: Quiz) => {
    actions.saveQuiz({
      sop_id: quiz.sop_id,
      title: `${quiz.title} (Copy)`,
      quiz_code: quiz.quiz_code ? `${quiz.quiz_code}-COPY` : undefined,
      description: quiz.description,
      passing_pct: quiz.passing_pct,
      max_attempts: quiz.max_attempts,
      questions: quiz.questions.map((q, idx) => ({ ...q, id: `q-copy-${Date.now()}-${idx}` })),
      status: "Draft",
    });
    toast.success("Quiz duplicated successfully as Draft.");
  };

  // Handle Toggle Status
  const handleToggleStatus = (quiz: Quiz) => {
    const nextStatus = quiz.status === "Active" ? "Inactive" : "Active";
    actions.saveQuiz({
      ...quiz,
      status: nextStatus,
    });
    toast.info(`Quiz status updated to ${nextStatus}.`);
  };

  // Start Quiz Runner
  const startQuizRunner = (quiz: Quiz) => {
    setRunnerQuiz(quiz);
  };

  // Save Quiz Form
  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !editingQuiz.title || !editingQuiz.sop_id) {
      toast.error("Please fill in the Quiz Title and SOP.");
      return;
    }

    const questions: QuizQuestion[] = editingQuiz.questions && editingQuiz.questions.length > 0
      ? editingQuiz.questions
      : [
          {
            id: `q-${Date.now()}-1`,
            order_index: 1,
            question_text: "Verify the safety and technical protocol prior to commencing site execution.",
            options: [
              "Review approved drawing and verify edge protection/barricades",
              "Commence work without checklist",
              "Skip PPE inspection",
              "Handover verbally without record"
            ],
            correct_answer: "Review approved drawing and verify edge protection/barricades",
            explanation: "Formal pre-start verification prevents non-conformances and worksite hazards.",
            marks: 25,
          },
        ];

    actions.saveQuiz({
      id: editingQuiz.id,
      sop_id: editingQuiz.sop_id,
      title: editingQuiz.title,
      quiz_code: editingQuiz.quiz_code || `QZ-${Math.floor(Math.random() * 900 + 100)}`,
      description: editingQuiz.description || "Mandatory SOP technical evaluation.",
      passing_pct: Number(editingQuiz.passing_pct) || 80,
      max_attempts: Number(editingQuiz.max_attempts) || 3,
      time_limit_mins: Number(editingQuiz.time_limit_mins) || 15,
      status: editingQuiz.status || "Active",
      questions,
    });

    toast.success("Quiz saved successfully!");
    setEditingQuiz(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Quiz Master & Results</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure technical question banks, set passing thresholds, and manage employee attempts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setEditingQuiz({
                title: "",
                sop_id: state.sops[0]?.id ?? "",
                quiz_code: `QZ-${Math.floor(Math.random() * 900 + 100)}`,
                passing_pct: 80,
                max_attempts: 3,
                time_limit_mins: 15,
                status: "Active",
                questions: [],
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="size-3.5" /> Create Quiz
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
            Quiz Master List ({state.quizzes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "results"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Quiz Attempts & Results ({state.quizAttempts.length})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === "master" ? "Search quizzes or SOPs..." : "Search learners or SOPs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUIZ MASTER LIST                                                   */}
      {/* ========================================================================= */}
      {activeTab === "master" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Quiz / Code</th>
                  <th className="px-4 py-3">Linked SOP</th>
                  <th className="px-4 py-3 text-center">Questions</th>
                  <th className="px-4 py-3 text-center">Pass %</th>
                  <th className="px-4 py-3 text-center">Max Attempts</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No quizzes configured yet. Click "Create Quiz" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredQuizzes.map((quiz) => {
                    const sop = state.sops.find((s) => s.id === quiz.sop_id);
                    const qCount = quiz.questions?.length ?? 0;
                    const isActive = quiz.status !== "Inactive";

                    return (
                      <tr key={quiz.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{quiz.title}</p>
                          <span className="text-[10px] font-mono text-slate-400">{quiz.quiz_code || quiz.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">{sop?.name ?? "General SOP"}</p>
                          <span className="text-[10px] text-slate-500">{sop?.department ?? "Civil"}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                          {qCount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-800 font-bold text-[11px]">
                            {quiz.passing_pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">
                          {quiz.max_attempts}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(quiz)}
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer",
                              isActive
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => startQuizRunner(quiz)}
                            title="Run / Test Exam"
                            className="inline-flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                          >
                            <Play className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuiz(quiz)}
                            title="Edit Quiz"
                            className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(quiz)}
                            title="Duplicate Quiz"
                            className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete quiz "${quiz.title}"?`)) {
                                actions.deleteQuiz(quiz.id);
                                toast.success("Quiz deleted.");
                              }
                            }}
                            title="Delete Quiz"
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
      {/* TAB 2: QUIZ RESULTS & ATTEMPTS                                            */}
      {/* ========================================================================= */}
      {activeTab === "results" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-4 py-3">SOP / Exam Title</th>
                  <th className="px-4 py-3 text-center">Attempt #</th>
                  <th className="px-4 py-3 text-center">Score %</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Date / Time</th>
                  <th className="px-4 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No exam attempts logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((att) => {
                    const sop = state.sops.find((s) => s.id === att.sop_id);
                    const quiz = state.quizzes.find((q) => q.id === att.quiz_id || q.sop_id === att.sop_id);

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {att.user_name}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">{quiz?.title ?? sop?.name ?? "SOP Exam"}</p>
                          <span className="text-[10px] text-slate-400">{sop?.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                          #{att.attempt_number}
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold">
                          <span className={cn(att.passed ? "text-emerald-700" : "text-rose-600")}>
                            {att.score_pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {att.passed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 className="size-3" /> Passed
                            </span>
                          ) : att.is_locked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                              <Lock className="size-3" /> Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <XCircle className="size-3" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {new Date(att.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              actions.resetQuizAttempts(att.sop_id);
                              toast.success(`Reset attempts for ${att.user_name} on ${sop?.name}`);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="size-3 text-slate-500" /> Reset Attempts
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
      {/* MODAL: CREATE / EDIT QUIZ                                                 */}
      {/* ========================================================================= */}
      <Dialog open={!!editingQuiz} onOpenChange={(open) => !open && setEditingQuiz(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-slate-900">
              {editingQuiz?.id ? "Edit Quiz" : "Create New Technical Quiz"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Define quiz parameters, passing score threshold, and link to an existing controlled SOP.
            </DialogDescription>
          </DialogHeader>

          {editingQuiz && (
            <form onSubmit={handleSaveQuiz} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    value={editingQuiz.title || ""}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    placeholder="e.g., Safe Scaffolding & Fall Arrest Quiz"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Quiz Code</label>
                  <input
                    type="text"
                    value={editingQuiz.quiz_code || ""}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, quiz_code: e.target.value })}
                    placeholder="e.g., QZ-SAFE-01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Linked SOP *</label>
                <select
                  required
                  value={editingQuiz.sop_id || ""}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, sop_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white"
                >
                  {state.sops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department}) - {s.version_number ?? "V1.0"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingQuiz.description || ""}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  placeholder="Summary of knowledge checkpoints tested in this exam..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passing %</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={editingQuiz.passing_pct ?? 80}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, passing_pct: parseInt(e.target.value) || 80 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Attempts</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editingQuiz.max_attempts ?? 3}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, max_attempts: parseInt(e.target.value) || 3 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time Limit (mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={editingQuiz.time_limit_mins ?? 15}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, time_limit_mins: parseInt(e.target.value) || 15 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQuiz(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                >
                  Save Quiz
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: LIVE QUIZ RUNNER (UNIFIED SLEEK UI)                                */}
      {/* ========================================================================= */}
      <QuizRunnerModal
        quiz={runnerQuiz}
        onClose={() => setRunnerQuiz(null)}
      />
    </div>
  );
}

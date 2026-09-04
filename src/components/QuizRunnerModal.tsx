import { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCcw,
  Lock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  actions,
  CURRENT_USER,
  useSiteflow,
  type Quiz,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

interface QuizRunnerModalProps {
  quiz: Quiz | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuizRunnerModal({
  quiz,
  onClose,
  onSuccess,
}: QuizRunnerModalProps) {
  const state = useSiteflow();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    scorePct: number;
    passed: boolean;
    isLocked: boolean;
    attemptNum: number;
  } | null>(null);

  if (!quiz) return null;

  const q = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const currentSelected = q ? selectedAnswers[q.id] : undefined;

  const handleSelect = (option: string) => {
    if (!q) return;
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleSubmit = () => {
    // Check that all questions have been answered
    const unanswered = quiz.questions.some((item) => !selectedAnswers[item.id]);
    if (unanswered) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }

    let earned = 0;
    let total = 0;
    quiz.questions.forEach((item) => {
      total += item.marks;
      if (
        selectedAnswers[item.id]?.trim().toLowerCase() ===
        item.correct_answer.trim().toLowerCase()
      ) {
        earned += item.marks;
      }
    });

    const scorePct = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = scorePct >= quiz.passing_pct;
    const attempts = state.quizAttempts.filter(
      (a) => a.sop_id === quiz.sop_id && a.user_name === CURRENT_USER.name
    );
    const attemptNum = attempts.length + 1;
    const isLocked = !passed && attemptNum >= quiz.max_attempts;

    actions.submitQuizAttempt(quiz.sop_id, selectedAnswers);
    actions.syncQuizPassedToLearning(quiz.sop_id, scorePct, passed);

    setQuizResult({
      scorePct,
      passed,
      isLocked,
      attemptNum,
    });

    if (passed) {
      toast.success(`Exam Passed (${scorePct}%)! Certificate generated.`);
      onSuccess?.();
    } else if (isLocked) {
      toast.error(`Exam Locked (${scorePct}%). Maximum 3 attempts exhausted.`);
    } else {
      toast.error(
        `Exam Failed (${scorePct}%). ${quiz.max_attempts - attemptNum} attempts remaining.`
      );
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResult(null);
  };

  return (
    <Dialog open={!!quiz} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white text-left">
        <div>
          {/* Top Navy Header Banner */}
          <div className="bg-slate-900 text-white px-6 pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
                  <Award className="size-5 text-white" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold leading-tight text-white">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
                    Pass Mark: <strong className="text-white font-bold">{quiz.passing_pct}%</strong> · Candidate: {CURRENT_USER.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Close Quiz"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Progress Bar Row */}
            {!quizResult && (
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-300 font-medium">
                <span className="shrink-0">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-7">
            {!quizResult ? (
              q ? (
                <div className="space-y-4">
                  {/* Question Title */}
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-900 mt-0.5">
                      {currentQuestionIndex + 1}
                    </span>
                    <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.question_text}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = currentSelected === opt;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(opt)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-2xl border p-4 text-sm font-semibold transition-all text-left cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/5 text-slate-900 shadow-xs ring-2 ring-primary/20"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80"
                          )}
                        >
                          <span className="pr-3 leading-relaxed">{opt}</span>
                          <span
                            className={cn(
                              "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-slate-300 bg-white"
                            )}
                          >
                            {isSelected && (
                              <span className="size-2 rounded-full bg-white" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null
            ) : (
              /* Exam Result View */
              <div className="py-4 text-center space-y-4">
                <div
                  className={cn(
                    "size-16 rounded-full mx-auto flex items-center justify-center shadow-md",
                    quizResult.passed
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  )}
                >
                  {quizResult.passed ? (
                    <CheckCircle2 className="size-8" />
                  ) : (
                    <AlertTriangle className="size-8" />
                  )}
                </div>

                <div>
                  <h4 className="font-display text-xl font-bold text-slate-900">
                    {quizResult.passed
                      ? "Congratulations! You Passed"
                      : "Minimum Passing Score Not Achieved"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Required: <strong>{quiz.passing_pct}%</strong> · Your Score:{" "}
                    <strong
                      className={cn(
                        "text-sm",
                        quizResult.passed ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {quizResult.scorePct}%
                    </strong>
                  </p>
                </div>

                {quizResult.isLocked && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 text-left">
                    <strong className="block mb-1 font-bold">Rule BR-05 Enforced: Maximum 3 Attempts Exhausted</strong>
                    Your competency exam has been locked. Per quality protocol, contact your Quality Manager in the QA Lead Center to unlock your attempts after reviewing the SOP.
                  </div>
                )}

                {/* Explanations List */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-3 max-h-60 overflow-y-auto text-xs">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                    Technical Answer Key & Explanations:
                  </span>
                  {quiz.questions.map((item, i) => (
                    <div key={item.id} className="border-b border-slate-200/80 pb-2.5 last:border-0">
                      <p className="font-semibold text-slate-800">
                        {i + 1}. {item.question_text}
                      </p>
                      <p className="text-emerald-700 font-bold mt-0.5">
                        Correct: {item.correct_answer}
                      </p>
                      {item.explanation && (
                        <p className="text-slate-500 text-[11px] mt-0.5">{item.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            {!quizResult ? (
              <>
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  ← Previous
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Submit Exam Now
                  </button>
                )}
              </>
            ) : (
              <div className="w-full flex items-center justify-end gap-2">
                {!quizResult.passed && !quizResult.isLocked && (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="size-3.5" /> Retake Exam
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

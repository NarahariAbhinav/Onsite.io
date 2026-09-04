import { Response, NextFunction } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { QualificationStatus, Role } from "@prisma/client";

export async function getQuizForSop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sopVersionId = req.params.sopVersionId as string;

    const quiz = await prisma.quiz.findFirst({
      where: { sopVersionId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: "No quiz configured for this SOP version" });
      return;
    }

    // If student/learner, hide correct answers from payload
    const isLearner = req.user?.role === Role.EMPLOYEE_LEARNER;
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      orderIndex: q.orderIndex,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      marks: q.marks,
      ...(isLearner ? {} : { correctAnswer: q.correctAnswer, explanation: q.explanation }),
    }));

    // Fetch employee attempt history if available
    let employeeAttempts: any[] = [];
    let isLocked = false;

    if (req.user?.employeeId) {
      employeeAttempts = await prisma.quizAttempt.findMany({
        where: { quizId: quiz.id, employeeId: req.user.employeeId },
        orderBy: { attemptNumber: "desc" },
      });

      const attemptsCount = employeeAttempts.length;
      const hasPassed = employeeAttempts.some((a) => a.passed);
      isLocked = !hasPassed && attemptsCount >= quiz.maxAttempts;
    }

    res.json({
      id: quiz.id,
      title: quiz.title,
      passingPct: quiz.passingPct,
      maxAttempts: quiz.maxAttempts,
      timeLimitMins: quiz.timeLimitMins,
      questions: sanitizedQuestions,
      attemptsUsed: employeeAttempts.length,
      isLocked,
      previousAttempts: employeeAttempts,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitQuizAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const quizId = req.params.quizId as string;
    const { answers, durationSecs } = req.body; // map of questionId -> selectedOption

    if (!req.user?.employeeId) {
      res.status(400).json({ error: "User is not mapped to an employee profile" });
      return;
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, sopVersion: true },
    });

    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    // Check existing attempts
    const existingAttempts = await prisma.quizAttempt.findMany({
      where: { quizId, employeeId: req.user.employeeId },
    });

    if (existingAttempts.some((a) => a.passed)) {
      res.status(400).json({ error: "You have already passed this quiz!" });
      return;
    }

    if (existingAttempts.length >= quiz.maxAttempts) {
      res.status(403).json({
        error: `Maximum attempts (${quiz.maxAttempts}) exhausted. Please contact your Quality Manager for an attempt reset.`,
        isLocked: true,
      });
      return;
    }

    // Grade attempt
    let totalMarks = 0;
    let earnedMarks = 0;

    quiz.questions.forEach((q) => {
      totalMarks += q.marks;
      const submitted = answers[q.id];
      if (submitted && String(submitted).trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        earnedMarks += q.marks;
      }
    });

    const scorePct = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const passed = scorePct >= quiz.passingPct;
    const attemptNumber = existingAttempts.length + 1;
    const isLocked = !passed && attemptNumber >= quiz.maxAttempts;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        employeeId: req.user.employeeId,
        attemptNumber,
        scorePct,
        passed,
        durationSecs: durationSecs || 0,
        submittedAnswers: answers,
        isLocked,
      },
    });

    // Check if practical assessment exists; if not, award qualification immediately!
    const practicalAssessment = await prisma.assessmentTemplate.findFirst({
      where: { sopVersionId: quiz.sopVersionId },
    });

    if (passed && !practicalAssessment) {
      const certNo = `CERT-${quiz.sopVersion.versionNumber}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await prisma.qualification.upsert({
        where: {
          employeeId_sopVersionId: {
            employeeId: req.user.employeeId,
            sopVersionId: quiz.sopVersionId,
          },
        },
        create: {
          employeeId: req.user.employeeId,
          sopVersionId: quiz.sopVersionId,
          status: QualificationStatus.QUALIFIED,
          quizScorePct: scorePct,
          certificateNumber: certNo,
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
        },
        update: {
          status: QualificationStatus.QUALIFIED,
          quizScorePct: scorePct,
        },
      });
    }

    res.json({
      attemptId: attempt.id,
      attemptNumber,
      scorePct,
      passed,
      isLocked,
      attemptsRemaining: Math.max(0, quiz.maxAttempts - attemptNumber),
      message: passed ? "Congratulations! You passed the quiz." : "You did not achieve the passing score.",
    });
  } catch (error) {
    next(error);
  }
}

export async function resetQuizAttempts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId, employeeId } = req.body;

    await prisma.quizAttempt.deleteMany({
      where: { quizId, employeeId },
    });

    res.json({ message: "Quiz attempts successfully reset for employee" });
  } catch (error) {
    next(error);
  }
}

// Practical / Simulation Assessment
export async function getAssessmentTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sopVersionId = req.params.sopVersionId as string;

    const assessment = await prisma.assessmentTemplate.findFirst({
      where: { sopVersionId },
      include: {
        submissions: req.user?.employeeId
          ? {
              where: { employeeId: req.user.employeeId },
              include: { evaluator: { select: { fullName: true } } },
            }
          : undefined,
      },
    });

    if (!assessment) {
      res.status(404).json({ error: "No practical assessment configured for this SOP version" });
      return;
    }

    res.json(assessment);
  } catch (error) {
    next(error);
  }
}

export async function submitAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const assessmentTemplateId = req.params.assessmentTemplateId as string;
    const { submittedData } = req.body;

    if (!req.user?.employeeId) {
      res.status(400).json({ error: "User is not linked to an employee profile" });
      return;
    }

    const submission = await prisma.assessmentSubmission.create({
      data: {
        assessmentTemplateId,
        employeeId: req.user.employeeId,
        submittedData,
      },
    });

    res.status(201).json({
      message: "Practical scenario assessment submitted for QA evaluation",
      submission,
    });
  } catch (error) {
    next(error);
  }
}

export async function evaluateAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const submissionId = req.params.submissionId as string;
    const { score, passed, feedback } = req.body;

    const updated = await prisma.assessmentSubmission.update({
      where: { id: submissionId },
      data: {
        evaluatorId: req.user!.id,
        score,
        passed,
        evaluatorFeedback: feedback,
        evaluatedAt: new Date(),
      },
      include: { template: true },
    });

    // If passed practical assessment, check if quiz is also passed to award official qualification certificate!
    if (passed) {
      const quiz = await prisma.quiz.findFirst({
        where: { sopVersionId: updated.template.sopVersionId },
      });

      const passedQuizAttempt = quiz
        ? await prisma.quizAttempt.findFirst({
            where: { quizId: quiz.id, employeeId: updated.employeeId, passed: true },
          })
        : null;

      const isQuizSatisfied = !quiz || Boolean(passedQuizAttempt);

      if (isQuizSatisfied) {
        const certNo = `CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.qualification.upsert({
          where: {
            employeeId_sopVersionId: {
              employeeId: updated.employeeId,
              sopVersionId: updated.template.sopVersionId,
            },
          },
          create: {
            employeeId: updated.employeeId,
            sopVersionId: updated.template.sopVersionId,
            status: QualificationStatus.QUALIFIED,
            assessmentScore: score,
            quizScorePct: passedQuizAttempt?.scorePct ?? 100,
            certificateNumber: certNo,
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          update: {
            status: QualificationStatus.QUALIFIED,
            assessmentScore: score,
          },
        });
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

// Employee Learner Portal: "My SOPs" (BRD Section 7.8)
export async function getMySops(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.employeeId) {
      res.status(400).json({ error: "User is not linked to an employee profile" });
      return;
    }

    const assignments = await prisma.employeeSopAssignment.findMany({
      where: { employeeId: req.user.employeeId },
      include: {
        project: { select: { id: true, code: true, name: true, location: true } },
        sopVersion: {
          include: {
            sop: true,
            quizzes: {
              include: {
                attempts: {
                  where: { employeeId: req.user.employeeId },
                  orderBy: { attemptNumber: "desc" },
                },
              },
            },
            assessments: {
              include: {
                submissions: {
                  where: { employeeId: req.user.employeeId },
                },
              },
            },
            qualifications: {
              where: { employeeId: req.user.employeeId },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = assignments.map((a) => {
      const version = a.sopVersion;
      const quiz = version.quizzes[0];
      const assessment = version.assessments[0];
      const qualification = version.qualifications[0];

      const bestQuizAttempt = quiz?.attempts.find((at) => at.passed) || quiz?.attempts[0];
      const bestAssessmentSubmission = assessment?.submissions[0];

      return {
        assignmentId: a.id,
        projectId: a.project.id,
        projectName: a.project.name,
        projectCode: a.project.code,
        sopId: version.sop.id,
        sopName: version.sop.title,
        versionNumber: version.versionNumber,
        assignedDate: a.assignedDate,
        dueDate: a.dueDate,
        progressPct: a.progressPct,
        status: a.status,
        quiz: quiz
          ? {
              quizId: quiz.id,
              passed: Boolean(bestQuizAttempt?.passed),
              bestScorePct: bestQuizAttempt?.scorePct ?? null,
              attemptsUsed: quiz.attempts.length,
              maxAttempts: quiz.maxAttempts,
              isLocked: !bestQuizAttempt?.passed && quiz.attempts.length >= quiz.maxAttempts,
            }
          : null,
        assessment: assessment
          ? {
              assessmentId: assessment.id,
              status: bestAssessmentSubmission
                ? bestAssessmentSubmission.passed
                  ? "Passed"
                  : bestAssessmentSubmission.score !== null
                  ? "Failed"
                  : "Pending Evaluation"
                : "Not Submitted",
              score: bestAssessmentSubmission?.score ?? null,
            }
          : null,
        qualification: qualification
          ? {
              status: qualification.status,
              certificateNumber: qualification.certificateNumber,
              issuedAt: qualification.issuedAt,
              expiresAt: qualification.expiresAt,
            }
          : null,
      };
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
}

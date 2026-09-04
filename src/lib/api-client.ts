/**
 * SiteFlow REST API Client
 * Connects frontend TanStack components to the Node.js + Express.js backend
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

class ApiClient {
  private tokenKey = "siteflow_jwt_token";

  public getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  public clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- Auth Endpoints ---
  public auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    register: (payload: { email: string; password: string; fullName: string; role?: string; department?: string }) =>
      this.request<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    me: () => this.request<any>("/auth/me"),

    switchPersona: (role: string) =>
      this.request<{ token: string; user: any }>("/auth/switch-persona", {
        method: "POST",
        body: JSON.stringify({ role }),
      }),
  };

  // --- Project Endpoints ---
  public projects = {
    list: (params?: { status?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/projects${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string) => this.request<any>(`/projects/${id}`),

    create: (data: any) =>
      this.request<any>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      this.request<any>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<any>(`/projects/${id}`, {
        method: "DELETE",
      }),
  };

  // --- SOP Governance & Version Control ---
  public sops = {
    list: (params?: { department?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/sops${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string) => this.request<any>(`/sops/${id}`),

    create: (data: any) =>
      this.request<any>("/sops", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    revise: (id: string, data: { revisionReason: string; changeSummary: string; steps: any[] }) =>
      this.request<any>(`/sops/${id}/revise`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    transitionLifecycle: (versionId: string, targetStatus: string, remarks?: string) =>
      this.request<any>(`/sops/versions/${versionId}/transition`, {
        method: "POST",
        body: JSON.stringify({ targetStatus, remarks }),
      }),

    assignToProject: (data: { projectId: string; sopVersionId: string; assignedLeadId?: string; dueDate?: string; previousSopId?: string }) =>
      this.request<any>("/sops/assign-project", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<any>(`/sops/${id}`, {
        method: "DELETE",
      }),
  };

  // --- Competency, Quizzes & Practical Assessment ---
  public competency = {
    getMySops: () => this.request<any[]>("/competency/my-sops"),

    getQuizForSop: (sopVersionId: string) => this.request<any>(`/competency/quizzes/${sopVersionId}`),

    submitQuiz: (quizId: string, answers: Record<string, string>, durationSecs?: number) =>
      this.request<any>(`/competency/quizzes/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers, durationSecs }),
      }),

    resetQuizAttempts: (quizId: string, employeeId: string) =>
      this.request<any>("/competency/quizzes/reset-attempts", {
        method: "POST",
        body: JSON.stringify({ quizId, employeeId }),
      }),

    getAssessmentTemplate: (sopVersionId: string) =>
      this.request<any>(`/competency/assessments/${sopVersionId}`),

    submitAssessment: (assessmentTemplateId: string, data: { projectId?: string; submittedData: string }) =>
      this.request<any>(`/competency/assessments/${assessmentTemplateId}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    evaluateAssessment: (submissionId: string, data: { score: number; passed: boolean; feedback?: string }) =>
      this.request<any>(`/competency/assessments/submissions/${submissionId}/evaluate`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // --- Audits ---
  public audits = {
    list: (params?: { projectId?: string; status?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/audits${qs ? `?${qs}` : ""}`);
    },

    schedule: (data: { projectId: string; sopVersionId: string; auditorId?: string; scheduledDate: string }) =>
      this.request<any>("/audits/schedule", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    execute: (auditId: string, data: { remarks?: string; findings: any[] }) =>
      this.request<any>(`/audits/${auditId}/execute`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // --- CAPA & Issues ---
  public capa = {
    listIssues: (params?: { projectId?: string; severity?: string; status?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/capa/issues${qs ? `?${qs}` : ""}`);
    },

    getIssueById: (id: string) => this.request<any>(`/capa/issues/${id}`),

    createIssue: (data: any) =>
      this.request<any>("/capa/issues", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateIssueStatus: (id: string, status: string, assignedToId?: string) =>
      this.request<any>(`/capa/issues/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, assignedToId }),
      }),

    updateCapa: (issueId: string, data: any) =>
      this.request<any>(`/capa/issues/${issueId}/capa`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // --- Documents ---
  public documents = {
    listMasters: () => this.request<any[]>("/documents/masters"),

    listProjectDocs: (params?: { projectId?: string; sopVersionId?: string; status?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return this.request<any[]>(`/documents/project-docs${qs ? `?${qs}` : ""}`);
    },

    createProjectDoc: (data: any) =>
      this.request<any>("/documents/project-docs", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    uploadFile: (id: string, fileName: string, fileUrl: string) =>
      this.request<any>(`/documents/project-docs/${id}/upload`, {
        method: "PATCH",
        body: JSON.stringify({ fileName, fileUrl }),
      }),

    verify: (id: string, approved: boolean) =>
      this.request<any>(`/documents/project-docs/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ approved }),
      }),
  };

  // --- Dashboards ---
  public dashboard = {
    getManagement: () => this.request<any>("/dashboard/management"),
    getProject: (projectId: string) => this.request<any>(`/dashboard/project/${projectId}`),
  };
}

export const api = new ApiClient();

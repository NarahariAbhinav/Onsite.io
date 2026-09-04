import type { Issue, SiteflowState } from "@/lib/siteflow-store";
import { formatDate } from "@/lib/siteflow-store";

/**
 * Escapes a cell value for standard CSV formatting.
 */
function escapeCsv(val: unknown): string {
  if (val == null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a browser download of a generated text/csv file.
 */
function downloadFile(content: string, fileName: string, mimeType: string = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a list of construction defects / NCRs to a structured CSV file.
 */
export function exportIssuesToCSV(
  issues: Issue[],
  state: SiteflowState,
  filterName: string = "All",
) {
  const headers = [
    "Issue ID",
    "Project Code",
    "Project Name",
    "Linked SOP",
    "Title",
    "Description",
    "Priority",
    "Status",
    "Assigned To",
    "Created By",
    "Reported Date",
    "Resolved Date",
    "Attachment",
  ];

  const rows = issues.map((issue) => {
    const project = state.projects.find((p) => p.id === issue.project_id);
    const sop = issue.sop_id ? state.sops.find((s) => s.id === issue.sop_id) : null;

    return [
      escapeCsv(issue.id),
      escapeCsv(project?.code ?? "—"),
      escapeCsv(project?.name ?? "—"),
      escapeCsv(sop?.name ?? "Site-wide / General"),
      escapeCsv(issue.title),
      escapeCsv(issue.description),
      escapeCsv(issue.priority),
      escapeCsv(issue.status),
      escapeCsv(issue.assigned_to),
      escapeCsv(issue.created_by),
      escapeCsv(formatDate(issue.created_at)),
      escapeCsv(issue.resolved_at ? formatDate(issue.resolved_at) : "Open"),
      escapeCsv(issue.attachment ?? "None"),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeFilter = filterName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `SiteFlow-NCR-Export-${safeFilter}-${dateStr}.csv`;

  downloadFile(csvContent, fileName);
}

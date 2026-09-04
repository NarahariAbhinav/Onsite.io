import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  actions,
  AMENITY_OPTIONS,
  DEPARTMENTS,
  PEOPLE,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/lib/siteflow-store";

type FormState = {
  name: string;
  code: string;
  status: ProjectStatus;
  project_type: ProjectType;
  client: string;
  description: string;
  admin: string;
  project_manager: string;
  project_owner: string;
  department: string;
  location: string;
  map: string;
  area: string;
  floors: string;
  flats: string;
  amenities: string[];
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
};

type ProjectFormErrors = {
  name?: string;
  code?: string;
  location?: string;
  start_date?: string;
};

const empty: FormState = {
  name: "",
  code: "",
  status: "Planning",
  project_type: "Commercial",
  client: "",
  description: "",
  admin: PEOPLE[0] ?? "R. Menon",
  project_manager: PEOPLE[0] ?? "R. Menon",
  project_owner: "Central QA/QC Directorate",
  department: "Civil & Infrastructure",
  location: "",
  map: "",
  area: "",
  floors: "",
  flats: "",
  amenities: [],
  start_date: "",
  end_date: "",
  actual_start_date: "",
  actual_end_date: "",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">{title}</h3>
      {children}
    </section>
  );
}

export function ProjectFormDrawer({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: Project | null | undefined;
}) {
  const [form, setForm] = useState<FormState>(
    project
      ? {
          name: project.name,
          code: project.code,
          status: project.status,
          project_type: project.project_type || "Commercial",
          client: project.client || "",
          description: project.description || "",
          admin: project.admin,
          project_manager: project.project_manager || project.admin,
          project_owner: project.project_owner || "Central QA/QC Directorate",
          department: project.department || "Civil & Infrastructure",
          location: project.location,
          map: `${project.lat}, ${project.lng}`,
          area: String(project.area),
          floors: String(project.floors),
          flats: String(project.flats),
          amenities: project.amenities,
          start_date: project.start_date,
          end_date: project.end_date,
          actual_start_date: project.actual_start_date || "",
          actual_end_date: project.actual_end_date || "",
        }
      : empty,
  );
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [customAmenity, setCustomAmenity] = useState("");
  const [options, setOptions] = useState<string[]>(
    Array.from(new Set([...AMENITY_OPTIONS, ...(project?.amenities ?? [])])),
  );

  const upd = (k: keyof FormState, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const e: ProjectFormErrors = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (!form.code.trim()) e.code = "Project code is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.start_date) e.start_date = "Start date is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    const parts = form.map.split(",").map((n) => Number(n.trim()));
    const lat = parts[0];
    const lng = parts[1];
    actions.saveProject({
      id: project?.id ?? undefined,
      name: form.name,
      code: form.code,
      status: form.status,
      project_type: form.project_type,
      client: form.client || undefined,
      description: form.description || undefined,
      admin: form.admin,
      project_manager: form.project_manager || form.admin,
      project_owner: form.project_owner || undefined,
      department: form.department || undefined,
      location: form.location,
      lat: lat !== undefined && Number.isFinite(lat) ? lat : 0,
      lng: lng !== undefined && Number.isFinite(lng) ? lng : 0,
      area: Number(form.area) || 0,
      floors: Number(form.floors) || 0,
      flats: Number(form.flats) || 0,
      amenities: form.amenities,
      start_date: form.start_date,
      end_date: form.end_date,
      actual_start_date: form.actual_start_date || null,
      actual_end_date: form.actual_end_date || null,
    });
    toast.success(project ? "Project updated" : "Project created");
    onOpenChange(false);
    if (!project) setForm(empty);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl bg-white border-l border-slate-200">
        <SheetHeader>
          <SheetTitle className="font-display text-slate-900 text-lg">
            {project ? "Edit Project Workspace" : "Create Construction Project"}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Define project metadata, classification, site scale, and governance ownership.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-1 pb-6 pt-4 text-xs">
          {/* Section 1: Basic Information */}
          <Section title="Basic Information">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="p-name" className="text-xs font-semibold text-slate-700">Project Name *</Label>
                <Input
                  id="p-name"
                  placeholder="e.g. KNS Clubhouse Phase 1"
                  value={form.name}
                  onChange={(e) => upd("name", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
                {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="p-code" className="text-xs font-semibold text-slate-700">Project Code / ID *</Label>
                <Input
                  id="p-code"
                  placeholder="e.g. KNS-101"
                  value={form.code}
                  onChange={(e) => upd("code", e.target.value.toUpperCase())}
                  className="h-9 text-xs mt-1 font-mono uppercase"
                />
                {errors.code && <p className="mt-1 text-[11px] text-rose-600">{errors.code}</p>}
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Project Type</Label>
                <Select value={form.project_type} onValueChange={(v) => upd("project_type", v as ProjectType)}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Residential", "Commercial", "Industrial", "Infrastructure", "Renovation", "Other"] as const).map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="p-client" className="text-xs font-semibold text-slate-700">Client / Developer</Label>
                <Input
                  id="p-client"
                  placeholder="e.g. KNS Infrastructure Ltd"
                  value={form.client}
                  onChange={(e) => upd("client", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Project Status</Label>
                <Select value={form.status} onValueChange={(v) => upd("status", v as ProjectStatus)}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Planning", "In Progress", "On Hold", "Completed", "Closed"] as const).map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="p-desc" className="text-xs font-semibold text-slate-700">Scope & Description</Label>
                <Textarea
                  id="p-desc"
                  rows={2}
                  placeholder="Brief summary of construction scope and site objectives..."
                  value={form.description}
                  onChange={(e) => upd("description", e.target.value)}
                  className="text-xs mt-1 resize-none"
                />
              </div>
            </div>
          </Section>

          {/* Section 2: Management & Ownership */}
          <Section title="Management & Governance">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Project Manager / Lead Admin</Label>
                <Select value={form.admin} onValueChange={(v) => { upd("admin", v); upd("project_manager", v); }}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEOPLE.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="p-dept" className="text-xs font-semibold text-slate-700">Department / BU</Label>
                <Select value={form.department} onValueChange={(v) => upd("department", v)}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...DEPARTMENTS, "Civil & Infrastructure", "General Building"].map((d) => (
                      <SelectItem key={d} value={d} className="text-xs">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="p-owner" className="text-xs font-semibold text-slate-700">Project Quality Owner</Label>
                <Input
                  id="p-owner"
                  value={form.project_owner}
                  onChange={(e) => upd("project_owner", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
          </Section>

          {/* Section 3: Location */}
          <Section title="Location & Map Coordinates">
            <div className="space-y-3">
              <div>
                <Label htmlFor="p-loc" className="text-xs font-semibold text-slate-700">Site Location Address *</Label>
                <Input
                  id="p-loc"
                  placeholder="e.g. KNS Infrastructure, Bengaluru"
                  value={form.location}
                  onChange={(e) => upd("location", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
                {errors.location && <p className="mt-1 text-[11px] text-rose-600">{errors.location}</p>}
              </div>
              <div>
                <Label htmlFor="p-map" className="text-xs font-semibold text-slate-700">Google Map Coordinates (lat, lng)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="p-map"
                    placeholder="e.g. 12.9716, 77.5946"
                    value={form.map}
                    onChange={(e) => upd("map", e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-xs shrink-0"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.map || form.location)}`,
                        "_blank",
                      )
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1" /> Preview
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          {/* Section 4: Scale Parameters */}
          <Section title="Site Scale">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="p-area" className="text-xs font-semibold text-slate-700">Area (Acres)</Label>
                <Input
                  id="p-area"
                  type="number"
                  step="0.1"
                  value={form.area}
                  onChange={(e) => upd("area", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-floors" className="text-xs font-semibold text-slate-700">Floors</Label>
                <Input
                  id="p-floors"
                  type="number"
                  value={form.floors}
                  onChange={(e) => upd("floors", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-flats" className="text-xs font-semibold text-slate-700">Flats / Units</Label>
                <Input
                  id="p-flats"
                  type="number"
                  value={form.flats}
                  onChange={(e) => upd("flats", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
          </Section>

          {/* Section 5: Amenities */}
          <Section title="Amenities & Site Facilities">
            <div className="flex flex-wrap gap-1.5">
              {options.map((a) => {
                const on = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      upd(
                        "amenities",
                        on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a],
                      )
                    }
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      on
                        ? "bg-slate-900 text-white shadow-xs"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {a}
                    {on && <X className="ml-1 inline size-3" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Add custom facility / amenity"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                className="h-8 text-xs shrink-0"
                onClick={() => {
                  const v = customAmenity.trim();
                  if (!v) return;
                  setOptions((o) => (o.includes(v) ? o : [...o, v]));
                  upd("amenities", Array.from(new Set([...form.amenities, v])));
                  setCustomAmenity("");
                }}
              >
                Add
              </Button>
            </div>
          </Section>

          {/* Section 6: Timeline */}
          <Section title="Project Schedule & Milestones">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-start" className="text-xs font-semibold text-slate-700">Planned Start Date *</Label>
                <Input
                  id="p-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => upd("start_date", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
                {errors.start_date && <p className="mt-1 text-[11px] text-rose-600">{errors.start_date}</p>}
              </div>
              <div>
                <Label htmlFor="p-end" className="text-xs font-semibold text-slate-700">Planned End Date</Label>
                <Input
                  id="p-end"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => upd("end_date", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-act-start" className="text-xs font-semibold text-slate-700">Actual Start Date</Label>
                <Input
                  id="p-act-start"
                  type="date"
                  value={form.actual_start_date}
                  onChange={(e) => upd("actual_start_date", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-act-end" className="text-xs font-semibold text-slate-700">Actual End Date</Label>
                <Input
                  id="p-act-end"
                  type="date"
                  value={form.actual_end_date}
                  onChange={(e) => upd("actual_end_date", e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button variant="ghost" className="text-xs" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit} className="text-xs bg-primary text-white hover:bg-primary/90">
              Save Project
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

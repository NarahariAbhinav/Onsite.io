import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PEOPLE,
  type Project,
  type ProjectStatus,
} from "@/lib/siteflow-store";

type FormState = {
  name: string;
  code: string;
  status: ProjectStatus;
  admin: string;
  location: string;
  map: string;
  area: string;
  floors: string;
  flats: string;
  amenities: string[];
  start_date: string;
  end_date: string;
};

const empty: FormState = {
  name: "",
  code: "",
  status: "Planning",
  admin: PEOPLE[0],
  location: "",
  map: "",
  area: "",
  floors: "",
  flats: "",
  amenities: [],
  start_date: "",
  end_date: "",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold tracking-widest text-steel uppercase">{title}</h3>
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
  project?: Project;
}) {
  const [form, setForm] = useState<FormState>(
    project
      ? {
          name: project.name,
          code: project.code,
          status: project.status,
          admin: project.admin,
          location: project.location,
          map: `${project.lat}, ${project.lng}`,
          area: String(project.area),
          floors: String(project.floors),
          flats: String(project.flats),
          amenities: project.amenities,
          start_date: project.start_date,
          end_date: project.end_date,
        }
      : empty,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customAmenity, setCustomAmenity] = useState("");
  const [options, setOptions] = useState<string[]>(
    Array.from(new Set([...AMENITY_OPTIONS, ...(project?.amenities ?? [])])),
  );

  const upd = (k: keyof FormState, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (!form.code.trim()) e.code = "Project code is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.start_date) e.start_date = "Start date is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    const [lat, lng] = form.map.split(",").map((n) => Number(n.trim()));
    actions.saveProject({
      id: project?.id,
      name: form.name,
      code: form.code,
      status: form.status,
      admin: form.admin,
      location: form.location,
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
      area: Number(form.area) || 0,
      floors: Number(form.floors) || 0,
      flats: Number(form.flats) || 0,
      amenities: form.amenities,
      start_date: form.start_date,
      end_date: form.end_date,
    });
    toast.success(project ? "Project updated" : "Project created");
    onOpenChange(false);
    if (!project) setForm(empty);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-display text-steel">
            {project ? "Edit Project" : "Create Project"}
          </SheetTitle>
          <SheetDescription>Project record used across SOP execution and documents.</SheetDescription>
        </SheetHeader>

        <div className="space-y-7 px-4 pb-6">
          <Section title="Basic Info">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-name">Project Name *</Label>
                <Input id="p-name" value={form.name} onChange={(e) => upd("name", e.target.value)} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="p-code">Project Code *</Label>
                <Input id="p-code" value={form.code} onChange={(e) => upd("code", e.target.value)} />
                {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
              </div>
              <div>
                <Label>Project Status</Label>
                <Select value={form.status} onValueChange={(v) => upd("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Planning", "In Progress", "Completed"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project Admin</Label>
                <Select value={form.admin} onValueChange={(v) => upd("admin", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEOPLE.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div>
              <Label htmlFor="p-loc">Location *</Label>
              <Input id="p-loc" value={form.location} onChange={(e) => upd("location", e.target.value)} />
              {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location}</p>}
            </div>
            <div>
              <Label htmlFor="p-map">Google Map Location (lat, lng or address)</Label>
              <div className="flex gap-2">
                <Input id="p-map" value={form.map} onChange={(e) => upd("map", e.target.value)} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.map || form.location)}`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="size-4" /> Preview
                </Button>
              </div>
            </div>
          </Section>

          <Section title="Scale">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="p-area">Total Area (Acres)</Label>
                <Input id="p-area" type="number" value={form.area} onChange={(e) => upd("area", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="p-floors">Floors</Label>
                <Input id="p-floors" type="number" value={form.floors} onChange={(e) => upd("floors", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="p-flats">Flats</Label>
                <Input id="p-flats" type="number" value={form.flats} onChange={(e) => upd("flats", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Amenities">
            <div className="flex flex-wrap gap-2">
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
                    className={
                      on
                        ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                        : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary"
                    }
                  >
                    {a}
                    {on && <X className="ml-1 inline size-3" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom amenity"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
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

          <Section title="Timeline">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-start">Project Start Date *</Label>
                <Input
                  id="p-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => upd("start_date", e.target.value)}
                />
                {errors.start_date && <p className="mt-1 text-xs text-destructive">{errors.start_date}</p>}
              </div>
              <div>
                <Label htmlFor="p-end">Expected Completion</Label>
                <Input
                  id="p-end"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => upd("end_date", e.target.value)}
                />
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save Project</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

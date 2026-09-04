import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  HardHat,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Users,
  Check,
  MapPin,
  Clock,
  Compass,
  Zap,
  Droplets,
  Calendar,
  Eye,
  Activity,
  Award,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useSiteflow, type Sop } from "@/lib/siteflow-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const state = useSiteflow();
  const [viewingSop, setViewingSop] = useState<Sop | null>(null);

  const featuredSops = state.sops.slice(0, 4);
  const viewingSteps = viewingSop
    ? state.steps.filter((st) => st.sop_id === viewingSop.id)
    : [];

  return (
    <AppShell fluid>
      {/* 1. FULL-WIDTH HERO SECTION (No card wrapper, covers entire hero viewport) */}
      <section className="relative overflow-hidden w-full bg-[#FAF7F2] border-b border-[#EAE3D6] min-h-[540px] sm:min-h-[600px] lg:min-h-[650px] flex items-center mb-16">
        {/* Background Hero Construction Image positioned seamlessly on the right */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 h-full overflow-hidden pointer-events-none">
          <img
            src="/crane-building-hero.jpg"
            alt="Tower Cranes and Active High-Rise Construction Site"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Seamless gradient overlay blending image into warm oat canvas */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/85 via-35% sm:via-30% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-transparent to-transparent lg:hidden" />
        </div>

        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 left-1/4 -mt-20 size-96 rounded-full bg-[#E07A5F]/10 blur-3xl pointer-events-none" />

        {/* Foreground Content constrained to max-w-7xl standard container */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl space-y-6 text-left animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Eyebrow Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D96B27]/40 bg-[#FAF7F2]/90 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-[#D96B27] shadow-2xs">
              <Sparkles className="size-3.5" />
              <span>Standard Operating Procedures</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              Where Site Engineers Meet Quality Standards
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-lg font-normal">
              Experience construction quality compliance like never before. Execute civil, electrical,
              safety, and MEP checklists in real-time, connect directly with site supervisors, and
              eliminate defect rework across all active development sites.
            </p>

            {/* Dual Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E27B38] to-[#D05B20] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:from-[#d86f2b] hover:to-[#bf5215] transition-all hover:scale-105 active:scale-95"
              >
                Explore Projects <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/sop-library"
                className="inline-flex items-center gap-2 rounded-full border border-[#D96B27]/50 bg-white/90 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-[#D96B27] shadow-xs hover:bg-[#D96B27]/10 transition-all hover:scale-105"
              >
                Browse SOP Library
              </Link>
            </div>

            {/* Live Telemetry Pill Strip */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#EAE3D6] shadow-2xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span><strong>100%</strong> Inspection Traceability</span>
              </div>
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#EAE3D6] shadow-2xs">
                <span className="flex size-4 items-center justify-center rounded-full bg-orange-100 text-[#E85D25] text-[10px] font-bold">
                  ✓
                </span>
                <span><strong>ISO 9001:2015</strong> Aligned Standards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area in Standard Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
        {/* 2. QUALITY PLANNING & SITE TOOLS SHOWCASE with the Blueprints Image */}
        <ScrollReveal variant="slide-up" delay={0}>
          <section className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-xs transition-all duration-300 hover:shadow-md">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* Blueprint & Hardhat Photo on Left */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                <img
                  src="/construction-site.jpg"
                  alt="Engineering blueprints, safety hardhat, and measurement tools"
                  className="w-full h-[280px] sm:h-[320px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                  <span className="font-bold block text-sm">Site Execution Kit</span>
                  <span className="text-slate-200 text-[11px]">Approved Structural Drawings & Quality Checklists</span>
                </div>
              </div>

              {/* Value Proposition on Right */}
              <div className="lg:col-span-7 space-y-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 uppercase tracking-wider inline-block">
                  Engineering Governance
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Rigorous Quality Control from Foundation to Handover
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every construction milestone requires mandatory verification. SiteFlow ensures that
                  structural cube tests, soil compaction reports, waterproofing ponding tests, and height safety
                  clearances are uploaded, reviewed, and signed off before next-stage work commences.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className="size-4 text-emerald-600" />
                      <strong className="text-xs font-bold text-slate-900">Mandatory Document Gate</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Blocks procedure closure until required lab test certificates are attached.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="size-4 text-[#E85D25]" />
                      <strong className="text-xs font-bold text-slate-900">Zero-Defect Audit Trail</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Full supervisor sign-off timestamps recorded for statutory compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* 3. FEATURED SITE LEADS / SUPERVISORS SECTION matching Reference Image 3 (Top) */}
        <section>
          <ScrollReveal variant="slide-up">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Site Engineering Leadership
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Supervised by Certified Site Leads
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Standard operating procedures are executed and signed off by qualified site engineers.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-3">
            <ScrollReveal variant="slide-up" delay={0}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs card-hover text-center space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="size-16 rounded-full bg-orange-100 text-[#E85D25] font-bold font-display text-xl flex items-center justify-center mx-auto shadow-xs border-2 border-white transition-transform hover:scale-110 duration-300">
                    RM
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">R. Menon</h3>
                    <p className="text-xs text-slate-500 font-medium">Chief Civil Engineer</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">8 SOPs</span> overseen ·
                  <span className="text-emerald-600 font-semibold">Verified Lead</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delay={150}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs card-hover text-center space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="size-16 rounded-full bg-blue-100 text-blue-700 font-bold font-display text-xl flex items-center justify-center mx-auto shadow-xs border-2 border-white transition-transform hover:scale-110 duration-300">
                    AS
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">A. Sharma</h3>
                    <p className="text-xs text-slate-500 font-medium">QA/QC Operations Lead</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">6 SOPs</span> overseen ·
                  <span className="text-emerald-600 font-semibold">ISO 9001 Auditor</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delay={300}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs card-hover text-center space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="size-16 rounded-full bg-emerald-100 text-emerald-800 font-bold font-display text-xl flex items-center justify-center mx-auto shadow-xs border-2 border-white transition-transform hover:scale-110 duration-300">
                    KI
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">K. Iyer</h3>
                    <p className="text-xs text-slate-500 font-medium">Senior MEP & Systems Lead</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">5 SOPs</span> overseen ·
                  <span className="text-emerald-600 font-semibold">MEP Certified</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 4. EXCLUSIVE SOP DROPS / FEATURED PROCEDURES matching Reference Image 3 (Middle) */}
        <section>
          <ScrollReveal variant="slide-up">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 mb-2">
                <span>Quality Inspection Standards</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Featured Master SOP Standards
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Standard engineering procedures executed across our active construction projects.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredSops.map((sop, i) => {
              const steps = state.steps.filter((st) => st.sop_id === sop.id);
              const badgeTones = [
                "bg-orange-50 text-orange-800 border-orange-200",
                "bg-blue-50 text-blue-800 border-blue-200",
                "bg-emerald-50 text-emerald-800 border-emerald-200",
                "bg-amber-50 text-amber-800 border-amber-200",
              ];

              return (
                <ScrollReveal key={sop.id} variant="slide-up" delay={i * 120}>
                  <div
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs card-hover h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${badgeTones[i % badgeTones.length]}`}
                        >
                          {sop.department}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {steps.length} Steps
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                        {sop.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {sop.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-5 flex items-center justify-between">
                      <button
                        onClick={() => setViewingSop(sop)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <Eye className="size-3.5" /> Preview Checklist
                      </button>
                      <Link
                        to="/sop-library"
                        className="size-7 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors"
                      >
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal variant="slide-up" delay={250}>
            <div className="text-center mt-10">
              <Link
                to="/sop-library"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E27B38] to-[#D05B20] px-7 py-3 text-xs font-semibold text-white shadow-md hover:from-[#d86f2b] hover:to-[#bf5215] transition-all hover:scale-105 active:scale-95"
              >
                Explore All Master SOPs <ArrowRight className="size-4" />
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* 5. CALL TO ACTION BANNER matching Reference Image 3 (Bottom) */}
        <ScrollReveal variant="scale-up" delay={100}>
          <section className="rounded-3xl bg-[#FAF7F2] border border-[#EFE9DF] p-10 sm:p-14 text-center shadow-xs">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Ready to Start Your Construction SOP Journey?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Whether you are managing high-rise residential towers or enterprise commercial tech parks,
                SiteFlow provides the quality execution framework your engineering teams need.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E27B38] to-[#D05B20] px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:from-[#d86f2b] hover:to-[#bf5215] transition-all hover:scale-105 active:scale-95"
                >
                  Start Managing Sites <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D96B27]/40 bg-white px-6 py-2.5 text-xs font-semibold text-[#D96B27] shadow-xs hover:bg-[#D96B27]/5 transition-all hover:scale-105 active:scale-95"
                >
                  View Operations Dashboard
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>

      {/* SOP Preview Modal */}
      <Dialog open={!!viewingSop} onOpenChange={(open) => !open && setViewingSop(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
          {viewingSop && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="size-4" />
                  </span>
                  <div>
                    <DialogTitle className="font-display text-lg text-slate-900">
                      {viewingSop.name}
                    </DialogTitle>
                    <DialogDescription>
                      Department: <strong>{viewingSop.department}</strong> · {viewingSteps.length} Sequential Steps
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-2 space-y-3">
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {viewingSop.description}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Standard Checklist Steps:
                  </h4>
                  <div className="space-y-2">
                    {viewingSteps.map((step) => (
                      <div
                        key={step.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-4.5 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">
                            {step.step_number}
                          </span>
                          <strong className="text-slate-900 font-bold">{step.title}</strong>
                        </div>
                        <p className="text-slate-600 pl-6">{step.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => setViewingSop(null)}
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

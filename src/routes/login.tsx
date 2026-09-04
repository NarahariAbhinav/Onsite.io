import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  HardHat,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Lock,
  Sparkles,
  ArrowLeft,
  Award,
  Zap,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/siteflow-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("r.menon@siteflow.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [confirmPassword, setConfirmPassword] = useState("••••••••••••");
  const [fullName, setFullName] = useState("R. Menon");
  const [department, setDepartment] = useState("Civil");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your work email");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome back, ${email.split("@")[0]}! Logged in successfully.`);
      navigate({ to: "/dashboard" });
    }, 500);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Account created for ${fullName}! Logged in as ${department} Lead.`);
      navigate({ to: "/dashboard" });
    }, 500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Authenticated via Enterprise Google Workspace SSO");
      navigate({ to: "/dashboard" });
    }, 500);
  };

  const selectDemoUser = (name: string, role: string, userEmail: string) => {
    setFullName(name);
    setEmail(userEmail);
    setPassword("siteflow2026!");
    toast.info(`Switched credentials to ${name} (${role})`);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email to receive recovery link");
      return;
    }
    setForgotModalOpen(false);
    toast.success(`Password reset instructions sent to ${forgotEmail}`);
    setForgotEmail("");
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white font-sans selection:bg-[#E85D25] selection:text-white flex">
      {/* ========================================================================= */}
      {/* 1. LEFT FORM CONTAINER (Sign-Up / Registration Form)                      */}
      {/* ========================================================================= */}
      <div
        className={`w-full lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden bg-white z-10 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isSignUp
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none scale-95 lg:scale-100"
        }`}
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs">
              <HardHat className="size-4" />
            </span>
            <span className="font-display text-base font-bold text-slate-900">SiteFlow</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <div className="space-y-1 mb-5 text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an Account
            </h2>
            <p className="text-xs text-slate-600">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-bold text-[#E85D25] underline underline-offset-4 hover:text-[#C84B19] transition-colors cursor-pointer"
              >
                Sign in here now
              </button>
            </p>
          </div>

          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Menon"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#E85D25] focus:outline-hidden transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-1.5 text-xs sm:text-sm text-slate-900 focus:border-[#E85D25] focus:outline-hidden transition-colors"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d} Quality
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="name@siteflow.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-slate-300 bg-transparent py-1.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#E85D25] focus:outline-hidden transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-1.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#E85D25] focus:outline-hidden transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Confirm
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-1.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#E85D25] focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-slate-950 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Create SiteFlow Account"
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <svg className="size-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google Workspace</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center text-[10px] text-slate-400">
          Protected by SiteFlow Enterprise Shield · End-to-end Encrypted
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT FORM CONTAINER (Sign-In / Login Form)                            */}
      {/* ========================================================================= */}
      <div
        className={`w-full lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden bg-white z-10 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          !isSignUp
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none scale-95 lg:scale-100"
        }`}
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-[#E85D25] hover:text-[#C84B19] transition-colors inline-flex items-center gap-1"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Form Body */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <div className="space-y-1 mb-6 text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-bold text-[#E85D25] underline underline-offset-4 hover:text-[#C84B19] transition-colors cursor-pointer"
              >
                Create a new account now
              </button>
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="name@siteflow.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-slate-300 bg-transparent py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#E85D25] focus:outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-2 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#E85D25] focus:outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 text-slate-400 hover:text-slate-700 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-slate-950 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Login Now"
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <svg className="size-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Login with Google</span>
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            Forgot password?{" "}
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="font-bold text-slate-900 underline underline-offset-2 hover:text-[#E85D25] transition-colors cursor-pointer"
            >
              Click here
            </button>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-3.5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
              Quick 1-Click Demo Profiles:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => selectDemoUser("R. Menon", "Project Admin", "r.menon@siteflow.internal")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                👷 R. Menon (Admin)
              </button>
              <button
                type="button"
                onClick={() => selectDemoUser("A. Sharma", "Quality Manager", "a.sharma@siteflow.internal")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🔍 A. Sharma (QA Lead)
              </button>
              <button
                type="button"
                onClick={() => selectDemoUser("K. Iyer", "Site Engineer", "k.iyer@siteflow.internal")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🏗️ K. Iyer (Site Eng)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Support */}
        <div className="text-center text-[10px] text-slate-400">
          Need assistance? Contact site operations at <span className="font-medium text-slate-600">ops@siteflow.internal</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PARALLAX SLIDING HERO OVERLAY (Buttery Smooth 60fps Curtained Motion)  */}
      {/* ========================================================================= */}
      <div
        className={`hidden lg:block absolute top-0 left-0 w-1/2 h-full z-30 overflow-hidden shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isSignUp ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Parallax Inner Double-Width Canvas */}
        <div
          className={`w-[200%] h-full flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            isSignUp ? "-translate-x-1/2" : "translate-x-0"
          }`}
        >
          {/* 3A. SIGN-IN HERO PANEL (Visible when isSignUp is false) */}
          <div className="relative w-1/2 h-full bg-[#0F172A] text-white p-10 lg:p-14 flex flex-col justify-between overflow-hidden">
            {/* Background Image with Amber Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/crane-building-hero.jpg"
                alt="Construction Crane Site"
                className="w-full h-full object-cover opacity-25 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-[#0F172A]/90 to-[#1E293B]/85" />
              <div className="absolute -top-20 -left-20 size-80 rounded-full bg-[#E85D25]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[#D96B27]/15 blur-3xl pointer-events-none" />
            </div>

            {/* Top Brand Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E85D25] to-[#C84B19] text-white shadow-lg shadow-[#E85D25]/30 border border-white/20">
                  <HardHat className="size-5" />
                </div>
                <div>
                  <span className="font-display text-lg font-bold tracking-tight text-white block leading-none">
                    SiteFlow
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#E85D25] tracking-widest mt-0.5 block">
                    Quality Systems
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/90">
                <Award className="size-3 text-[#E85D25]" /> ISO 9001:2015
              </span>
            </div>

            {/* Middle Value Proposition */}
            <div className="relative z-10 max-w-md space-y-5 my-auto py-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E85D25]/40 bg-[#E85D25]/15 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#FF8A50]">
                <Sparkles className="size-3" /> Standard Operating Procedures
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Where Site Engineers Meet Quality Standards.
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Digitize inspection checklists, eliminate defect rework, and enforce standardized milestone sign-offs across active sites.
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-2.5 text-center">
                  <span className="text-lg font-extrabold text-white block">100%</span>
                  <span className="text-[9px] uppercase font-semibold text-slate-400">Traceability</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-2.5 text-center">
                  <span className="text-lg font-extrabold text-[#FF8A50] block">Zero</span>
                  <span className="text-[9px] uppercase font-semibold text-slate-400">Defects</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-2.5 text-center">
                  <span className="text-lg font-extrabold text-emerald-400 block">6 Sites</span>
                  <span className="text-[9px] uppercase font-semibold text-slate-400">Active</span>
                </div>
              </div>

              {/* Switch Side Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-5 py-2 text-xs font-bold text-white hover:bg-white hover:text-slate-900 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>New to SiteFlow? Create Account</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-4">
              <span>© 2026 SiteFlow Quality Systems.</span>
              <span className="text-slate-500">Enterprise Edition v2.4</span>
            </div>
          </div>

          {/* 3B. SIGN-UP HERO PANEL (Visible when isSignUp is true) */}
          <div className="relative w-1/2 h-full bg-[#18110D] text-white p-10 lg:p-14 flex flex-col justify-between overflow-hidden">
            {/* Background Image with Deep Terracotta Tone */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/construction-site.jpg"
                alt="Blueprints and Tools"
                className="w-full h-full object-cover opacity-20 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#120B08] via-[#1C120C]/90 to-[#2A170F]/85" />
              <div className="absolute -top-20 -right-20 size-80 rounded-full bg-[#E85D25]/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[#C84B19]/20 blur-3xl pointer-events-none" />
            </div>

            {/* Top Brand Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E85D25] to-[#C84B19] text-white shadow-lg shadow-[#E85D25]/30 border border-white/20">
                  <HardHat className="size-5" />
                </div>
                <div>
                  <span className="font-display text-lg font-bold tracking-tight text-white block leading-none">
                    SiteFlow
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#FF8A50] tracking-widest mt-0.5 block">
                    Enterprise
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-emerald-300">
                <Zap className="size-3" /> Quick Setup
              </span>
            </div>

            {/* Middle Value Proposition */}
            <div className="relative z-10 max-w-md space-y-5 my-auto py-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 backdrop-blur-md px-3 py-1 text-xs font-semibold text-emerald-300">
                <Sparkles className="size-3" /> Zero-Friction Quality Assurance
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Build Faster. Build with Zero Defects.
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Empower your site civil leads and quality managers with instant milestone sign-offs, photo defect logs, and ISO 9001 compliance records.
              </p>

              {/* Feature Points */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="size-3.5 text-[#FF8A50] shrink-0" />
                  <span>Real-time milestone sign-offs with automatic timestamping</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="size-3.5 text-[#FF8A50] shrink-0" />
                  <span>Integrated non-conformance defect reporting & CSV export</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="size-3.5 text-[#FF8A50] shrink-0" />
                  <span>Mandatory quality document gatekeeper & instant PDF reports</span>
                </div>
              </div>

              {/* Switch Side Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-5 py-2 text-xs font-bold text-white hover:bg-white hover:text-slate-900 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Already have an account? Sign In</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-4">
              <span>© 2026 SiteFlow Quality Systems.</span>
              <span className="text-slate-500">Enterprise Edition v2.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-[#E85D25]">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Reset Account Password</h3>
                <p className="text-xs text-slate-500">We will send password recovery instructions to your email</p>
              </div>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Registered Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. r.menon@siteflow.internal"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#E85D25] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

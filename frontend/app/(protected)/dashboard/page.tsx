"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearTokens } from "@/lib/token";
import { cn } from "@/lib/utils";

import {
  Users,
  CalendarCheck2,
  Wallet,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ReceiptText,
  Building2,
  CreditCard,
  Layers,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  ArrowUpRight,
  Activity,
} from "lucide-react";

type Company = { id: string };

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function SoftCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function Pill({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: "gray" | "blue" | "green" | "orange";
  className?: string;
}) {
  const styles =
    tone === "green"
      ? "bg-green-50 text-green-700 border-green-100"
      : tone === "orange"
      ? "bg-orange-50 text-orange-700 border-orange-100"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-gray-50 text-gray-700 border-gray-100";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border",
        styles,
        className
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  title,
  value,
  meta,
  icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  meta: string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "orange" | "gray";
}) {
  const toneBox =
    tone === "green"
      ? "bg-green-50 border-green-100 text-green-700"
      : tone === "orange"
      ? "bg-orange-50 border-orange-100 text-orange-700"
      : tone === "gray"
      ? "bg-gray-50 border-gray-100 text-gray-700"
      : "bg-blue-50 border-blue-100 text-blue-700";

  return (
    <SoftCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <span className="text-xs text-gray-500 line-clamp-1">{meta}</span>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            {/* subtle progress bar for premium feel */}
            <div className="h-full w-[38%] rounded-full bg-gray-900/10" />
          </div>
        </div>

        <div
          className={cn(
            "h-11 w-11 rounded-2xl border flex items-center justify-center",
            toneBox
          )}
        >
          {icon}
        </div>
      </div>
    </SoftCard>
  );
}

function BigAction({
  href,
  title,
  desc,
  icon,
  highlight = false,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border p-5 shadow-sm transition",
        "hover:shadow-md hover:-translate-y-px",
        highlight
          ? "border-blue-200 bg-linear-to-br from-blue-50 to-white"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-11 w-11 rounded-2xl border flex items-center justify-center",
            highlight
              ? "bg-blue-600 border-blue-700 text-white"
              : "bg-gray-50 border-gray-100 text-gray-700"
          )}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-gray-900">{title}</p>
            <ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{desc}</p>

          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityRow({
  icon,
  title,
  desc,
  badge,
  badgeTone = "gray",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge: string;
  badgeTone?: "green" | "orange" | "gray" | "blue";
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50/40 transition">
      <div className="h-10 w-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-gray-900 line-clamp-1">{title}</p>
          <Pill tone={badgeTone}>{badge}</Pill>
        </div>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

function Shortcut({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition",
        "hover:bg-gray-50 hover:shadow-md hover:-translate-y-px",
        "flex items-center gap-3"
      )}
    >
      <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
        {icon}
      </div>
      <span className="font-medium text-gray-900">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [companyOk, setCompanyOk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Security/flow check only (do not show company details)
        const res = await api.get("/company/me");
        const c: Company | null = res.data;

        if (!c?.id) {
          router.replace("/company/info");
          return;
        }

        setCompanyOk(true);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          clearTokens();
          router.replace("/login");
          return;
        }
        setError(err?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const stats = useMemo(
    () => [
      {
        title: "Employees",
        value: "—",
        meta: "Connect employee module to view totals",
        icon: <Users className="h-5 w-5" />,
        tone: "blue" as const,
      },
      {
        title: "Attendance",
        value: "—",
        meta: "This month coverage not available yet",
        icon: <CalendarCheck2 className="h-5 w-5" />,
        tone: "gray" as const,
      },
      {
        title: "Payroll Status",
        value: "Pending",
        meta: "No payroll run detected",
        icon: <Clock className="h-5 w-5" />,
        tone: "orange" as const,
      },
      {
        title: "Payables",
        value: "—",
        meta: "Open payables report when configured",
        icon: <Wallet className="h-5 w-5" />,
        tone: "gray" as const,
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-6 py-8">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="h-7 w-56 rounded bg-gray-100" />
            <div className="mt-2 h-4 w-96 rounded bg-gray-100" />

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl border bg-white" />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="h-72 rounded-2xl border bg-white" />
              <div className="h-72 rounded-2xl border bg-white xl:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="px-6 py-10 max-w-3xl">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dashboard Error
                </h2>
                <p className="mt-2 text-sm text-gray-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 h-10 px-5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!companyOk) return null;

  return (
    <div className="w-full">
      {/* Premium background layer */}
      <div className="px-6 py-8">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-linear-to-br from-gray-50 via-white to-blue-50 p-6 shadow-sm">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl" />

          {/* Header */}
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Pill tone="blue">
                  <Sparkles className="h-3.5 w-3.5" />
                  Payroll Overview
                </Pill>
                <Pill tone="gray">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  System Ready
                </Pill>
              </div>

              <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">
                Payroll Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                Clean payroll control center for employees, attendance, payroll runs, and compliance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/settings/employees"
                className="h-10 px-5 rounded-xl border bg-white/80 backdrop-blur text-gray-800 font-medium hover:bg-white transition inline-flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Add Employee
              </Link>
              <Link
                href="/attendance"
                className="h-10 px-5 rounded-xl border bg-white/80 backdrop-blur text-gray-800 font-medium hover:bg-white transition inline-flex items-center gap-2"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Mark Attendance
              </Link>
              <Link
                href="/monthly-salary"
                className="h-10 px-5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Run Payroll
              </Link>
            </div>
          </div>

          {/* KPI row */}
          <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard
                key={s.title}
                title={s.title}
                value={s.value}
                meta={s.meta}
                icon={s.icon}
                tone={s.tone}
              />
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: Action hub */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Action Hub
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Start with the essentials. Keep payroll clean and consistent.
                </p>
              </div>
              <Pill tone="blue">
                <Activity className="h-3.5 w-3.5" />
                Recommended
              </Pill>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <BigAction
                href="/settings/employees"
                title="Employee Records"
                desc="Create employees, set salary details, and assign payroll settings."
                icon={<Users className="h-5 w-5" />}
                highlight
              />
              <BigAction
                href="/attendance"
                title="Attendance Setup"
                desc="Track monthly attendance to avoid salary errors and rework."
                icon={<CalendarCheck2 className="h-5 w-5" />}
              />
              <BigAction
                href="/monthly-salary"
                title="Monthly Payroll"
                desc="Run payroll, generate payslips, and finalize your payroll month."
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <BigAction
                href="/payables/report"
                title="Payables Report"
                desc="Review outstanding payables and confirm payment schedule."
                icon={<ReceiptText className="h-5 w-5" />}
              />
            </div>
          </Card>

          {/* Right: Activity + shortcuts */}
          <Card className="p-6 xl:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Readiness Checklist
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  These items keep your payroll workflow stable and audit-friendly.
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/accounting-journal"
                  className="h-10 px-5 rounded-xl border bg-white text-gray-800 font-medium hover:bg-gray-50 transition inline-flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Journals
                </Link>
                <Link
                  href="/settings/company"
                  className="h-10 px-5 rounded-xl border bg-white text-gray-800 font-medium hover:bg-gray-50 transition inline-flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Company Setup
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ActivityRow
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Payroll month not finalized"
                desc="Finalize payroll after attendance is updated and reviewed."
                badge="Pending"
                badgeTone="orange"
              />
              <ActivityRow
                icon={<Users className="h-5 w-5" />}
                title="Employee list is empty"
                desc="Add employees to start attendance and payroll processing."
                badge="Setup"
                badgeTone="blue"
              />
              <ActivityRow
                icon={<CreditCard className="h-5 w-5" />}
                title="Payment methods not configured"
                desc="Configure cash/bank methods used for payroll payments."
                badge="Settings"
                badgeTone="gray"
              />
              <ActivityRow
                icon={<Layers className="h-5 w-5" />}
                title="Departments not defined"
                desc="Create departments to enable clean reporting and grouping."
                badge="Optional"
                badgeTone="gray"
              />
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Settings Shortcuts
                </h3>
                <span className="text-xs text-gray-500">
                  Fast access to core configuration
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <Shortcut
                  href="/settings/employees"
                  icon={<Users className="h-4 w-4" />}
                  label="Employee Records"
                />
                <Shortcut
                  href="/settings/company"
                  icon={<Building2 className="h-4 w-4" />}
                  label="Company Setup"
                />
                <Shortcut
                  href="/settings/payment-methods"
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Payment Methods"
                />
                <Shortcut
                  href="/settings/departments"
                  icon={<Layers className="h-4 w-4" />}
                  label="Departments"
                />
                <Shortcut
                  href="/settings/roles"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Roles"
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    Professional workflow, ready to scale
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    As you connect modules, this dashboard will automatically become data-driven.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

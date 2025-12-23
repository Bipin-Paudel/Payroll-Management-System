"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearTokens } from "@/lib/token";
import { cn } from "@/lib/utils";

import {
  Users,
  CalendarCheck2,
  FileText,
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
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
      className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)}
    >
      {children}
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function TaskRow({
  icon,
  title,
  desc,
  done = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div
        className={cn(
          "h-10 w-10 rounded-xl border flex items-center justify-center",
          done ? "bg-green-50 border-green-100 text-green-700" : "bg-gray-50 border-gray-100 text-gray-700"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [companyOk, setCompanyOk] = useState(false);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      // ✅ Only check company exists (do not show details)
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
  }, [router]);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  const stats = useMemo(
    () => [
      { title: "Employees", value: "—", icon: <Users className="h-5 w-5" /> },
      { title: "Attendance (This Month)", value: "—", icon: <CalendarCheck2 className="h-5 w-5" /> },
      { title: "Payroll Run", value: "Pending", icon: <Clock className="h-5 w-5" /> },
      { title: "Payables", value: "—", icon: <Wallet className="h-5 w-5" /> },
    ],
    []
  );

  if (loading) {
    return (
      <div className="w-full px-6 py-8">
        <Card className="p-6">
          <div className="h-7 w-60 rounded bg-gray-100" />
          <div className="mt-2 h-4 w-[520px] max-w-full rounded bg-gray-100" />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[104px] rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="h-56 rounded-2xl border border-gray-200 bg-white" />
            <div className="h-56 rounded-2xl border border-gray-200 bg-white" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-10">
        <Card className="p-6 max-w-3xl">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard Error</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    router.refresh();
                    setRefreshTick((v) => v + 1);
                  }}
                  className="h-11 px-5 rounded-xl bg-blue-600 text-white font-medium hover:opacity-90 transition inline-flex items-center gap-2
                             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50 transition
                             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Hard Reload
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!companyOk) return null;

  return (
    <div className="w-full px-6 py-8">
      {/* ===== Top Header (clean) ===== */}
      <div className="max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              System Ready
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">
              Payroll Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              A simple control center for employees, attendance, and monthly payroll.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                router.refresh();
                setRefreshTick((v) => v + 1);
              }}
              className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50 transition inline-flex items-center gap-2
                         focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              href="/monthly-salary"
              className="h-11 px-5 rounded-xl bg-blue-600 text-white font-medium hover:opacity-90 transition inline-flex items-center gap-2
                         focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <FileText className="h-4 w-4" />
              Run Payroll
            </Link>
          </div>
        </div>

        {/* ===== KPI row (small & clean) ===== */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Stat key={s.title} title={s.title} value={s.value} icon={s.icon} />
          ))}
        </div>

        {/* ===== Two clean cards only ===== */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-gray-600">
              Do the 3 core steps in order to keep payroll accurate.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <Link
                href="/settings/employees-records"
                className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 font-medium hover:bg-gray-50 transition inline-flex items-center gap-3
                           focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Users className="h-4 w-4 text-gray-700" />
                Add / Manage Employees
              </Link>

              <Link
                href="/attendance"
                className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 font-medium hover:bg-gray-50 transition inline-flex items-center gap-3
                           focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <CalendarCheck2 className="h-4 w-4 text-gray-700" />
                Mark Attendance
              </Link>

              <Link
                href="/monthly-salary"
                className="h-11 rounded-xl bg-blue-600 px-4 text-white font-medium hover:opacity-90 transition inline-flex items-center gap-3
                           focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <FileText className="h-4 w-4" />
                Run Monthly Payroll
              </Link>
            </div>
          </Card>

          {/* Tasks (minimal checklist) */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Setup Checklist</h2>
            <p className="mt-1 text-sm text-gray-600">
              Keep these settings ready to avoid payroll delays.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <TaskRow
                icon={<Users className="h-5 w-5" />}
                title="Create employees"
                desc="Add employee records with salary and joining details."
              />
              <TaskRow
                icon={<CalendarCheck2 className="h-5 w-5" />}
                title="Start attendance tracking"
                desc="Update attendance monthly before running payroll."
              />
              <TaskRow
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Run and finalize payroll"
                desc="Generate salary and confirm payouts for the month."
                done={false}
              />
            </div>
          </Card>
        </div>

        {/* Small footer note (optional, clean) */}
        <div className="mt-6 text-xs text-gray-500">
          Note: This dashboard is intentionally minimal. More widgets can be added later only when your modules are fully connected.
        </div>
      </div>
    </div>
  );
}

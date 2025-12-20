import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-white text-gray-900">
      {/* Background decoration (full screen) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-105 w-275 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-100 via-blue-100 to-purple-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-45 -right-30 h-105 w-105 rounded-full bg-indigo-100 blur-3xl opacity-60" />
      </div>

      {/* -------------------- HEADER (FULL WIDTH) -------------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
              <Image
                src="/logo.png"
                alt="KBA Payroll Logo"
                width={34}
                height={34}
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg sm:text-xl font-bold">
                KBA{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-600">
                  Payroll
                </span>
              </h1>
              <p className="text-xs text-gray-500">Payroll Management System</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Signup
            </Link>
          </nav>
        </div>
      </header>

      {/* -------------------- HERO (FULL WIDTH) -------------------- */}
      <section className="w-full px-4 sm:px-8 lg:px-16 pt-12 lg:pt-20 pb-14">
        <div className="w-full grid gap-10 lg:grid-cols-2 items-center">
          {/* Left */}
          <div className="max-w-2xl">
            

            <h2 className="mt-5 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Run payroll confidently 
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-600">
                accurate, fast, and organized.
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Manage employees, salary structures, allowances, deductions, and payroll summaries in one place.
              Designed to stay simple for users — while staying structured for real business needs.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition"
              >
                Login
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["Payroll Accuracy", "Structured payroll inputs reduce errors."],
                ["Employee Records", "Keep payroll history linked with employees."],
                ["Fast Summaries", "Instant totals, deductions, and net pay."],
                ["Professional UI", "Clean screens that look modern and trustworthy."],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview Card (FULL WIDTH on mobile, aligned right on lg) */}
          <div className="w-full lg:justify-self-end">
            <div className="w-full lg:max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">KBA Payroll Dashboard</p>
                  <p className="text-xs text-gray-500">Overview • Employees • Payroll Runs</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Secure
                </span>
              </div>

              <div className="p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Total Employees", "128"],
                    ["This Month Payroll", "—"],
                    ["Total Deductions", "—"],
                    ["Net Payable", "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">{k}</p>
                      <p className="mt-2 text-2xl font-bold">{v}</p>
                      <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 w-2/3 rounded-full bg-indigo-600" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm font-semibold">Recent Payroll Runs</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[
                      ["Monthly Payroll", "Processed", "Employees: 120"],
                      ["Contract Payouts", "Processed", "Employees: 18"],
                      ["Bonus Batch", "Pending", "Employees: 6"],
                    ].map(([a, b, c]) => (
                      <div key={a} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{a}</p>
                          <p className="text-xs text-gray-500">{c}</p>
                        </div>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            b === "Processed"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 p-4 text-white">
                  <p className="text-sm font-semibold">Ready to start?</p>
                  <p className="mt-1 text-sm text-white/90">
                    Create your account and set up payroll in minutes.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- FEATURES (FULL WIDTH STRIP) -------------------- */}
      <section className="w-full bg-gray-50 border-t border-b border-gray-100">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-14">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-2xl font-bold">What KBA Payroll includes</h3>
            <p className="mt-2 max-w-3xl text-gray-600">
              Everything you need for a clean payroll flow — designed to stay simple and professional.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["Employee Management", "Add employees, store profiles, maintain payroll history."],
                ["Salary Structure", "Define basic pay and allowances clearly."],
                ["Deductions Handling", "Track deductions and calculate net pay reliably."],
                ["Payroll Summary", "See totals and breakdowns per payroll run."],
                ["Audit-friendly Records", "Clean entries and consistent payroll runs."],
                ["Scalable Architecture", "Built to add more payroll features later."],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- FOOTER (FULL WIDTH) -------------------- */}
      <footer className="w-full border-t border-gray-100 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">KBA Payroll</p>
            <p className="mt-1">A modern payroll management system built for clean workflows.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition">
              Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/signup" className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition">
              Signup
            </Link>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} KBA</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

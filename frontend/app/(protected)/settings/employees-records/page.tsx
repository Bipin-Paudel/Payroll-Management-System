"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import NewEmployeePage from "@/components/settings/NewEmployeeCreationForm";

type EmployeeRow = {
  id: string;
  employeeId?: number;
  name: string;
  panNo?: string | null;
  disability?: boolean | null;
  gender?: string | null;

  // ✅ BS date comes from backend, show as-is
  dateOfJoiningBs?: string | null;

  role?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;

  lifeInsurance?: number | null;
  healthInsurance?: number | null;
  houseInsurance?: number | null;
};

function safeNum(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

export default function EmployeeListPage() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/employees");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Disable background scroll when modal is open
  useEffect(() => {
    if (!openNew) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openNew]);

  // ✅ ESC to close
  useEffect(() => {
    if (!openNew) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenNew(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNew]);

  const viewRows = useMemo(() => {
    return rows.map((r, idx) => {
      const life = safeNum(r.lifeInsurance);
      const health = safeNum(r.healthInsurance);
      const house = safeNum(r.houseInsurance);
      const total = life + health + house;

      return {
        ...r,
        _idx: idx + 1,
        _life: life,
        _health: health,
        _house: house,
        _total: total,
      };
    });
  }, [rows]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage employees, roles, departments and insurance values.
          </p>
        </div>

        <button
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition"
        >
          + Add Employee
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="kp-table w-full min-w-[1300px]">
          <thead>
            <tr>
              <th className="kp-th w-[80px]">ID</th>
              <th className="kp-th">Role</th>
              <th className="kp-th">Department</th>
              <th className="kp-th min-w-[220px]">Employee Name</th>
              <th className="kp-th min-w-[140px]">PAN No.</th>
              <th className="kp-th min-w-[120px]">Disability</th>
              <th className="kp-th min-w-[110px]">Gender</th>

              {/* ✅ BS */}
              <th className="kp-th min-w-[180px]">Date of Joining (BS)</th>

              <th className="kp-th min-w-[160px]">Life Insurance</th>
              <th className="kp-th min-w-[170px]">Health Insurance</th>
              <th className="kp-th min-w-[170px]">House Insurance</th>
              <th className="kp-th min-w-[170px]">Total Insurance</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="kp-td" colSpan={12}>
                  <div className="py-6 text-center text-slate-600">
                    Loading employees...
                  </div>
                </td>
              </tr>
            ) : viewRows.length === 0 ? (
              <tr>
                <td className="kp-td" colSpan={12}>
                  <div className="py-10 text-center">
                    <div className="text-slate-900 font-medium">
                      No employees found
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Click <span className="font-medium">Add Employee</span> to
                      create your first employee.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              viewRows.map((r: any) => (
                <tr key={r.id} className="kp-tr">
                  <td className="kp-td text-center font-semibold">
                    {r.employeeId ?? r._idx}
                  </td>

                  <td className="kp-td">
                    {r.role?.name ? (
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-800">
                        {r.role.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="kp-td">
                    {r.department?.name ? (
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-800">
                        {r.department.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="kp-td font-semibold">{r.name}</td>

                  <td className="kp-td">
                    {r.panNo ? (
                      <span className="font-medium text-slate-900">
                        {r.panNo}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="kp-td">
                    {r.disability === true ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        No
                      </span>
                    )}
                  </td>

                  <td className="kp-td">
                    {r.gender ? (
                      <span className="text-slate-900 font-medium">
                        {r.gender}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* ✅ Show BS date exactly from backend */}
                  <td className="kp-td text-center font-medium">
                    {r.dateOfJoiningBs ?? "—"}
                  </td>

                  <td className="kp-td text-right font-medium">{r._life}</td>
                  <td className="kp-td text-right font-medium">{r._health}</td>
                  <td className="kp-td text-right font-medium">{r._house}</td>

                  <td className="kp-td text-right font-semibold">
                    {r._total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ MODAL (Scrollable + Always on top) */}
      {openNew && (
        <div className="fixed inset-0 z-[99999]">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/55"
            onClick={() => setOpenNew(false)}
          />

          {/* modal wrapper */}
          <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
            <div className="w-full max-w-5xl">
              <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                {/* modal header (sticky) */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Add New Employee
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Create employee inside your company.
                    </p>
                  </div>

                  <button
                    onClick={() => setOpenNew(false)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                {/* ✅ scroll area */}
                <div className="max-h-[78vh] overflow-y-auto p-5">
                  <NewEmployeePage
                    onClose={() => setOpenNew(false)}
                    onCreated={async () => {
                      setOpenNew(false);
                      await fetchEmployees();
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 text-center text-xs text-white/80">
                Tip: Press <span className="font-semibold">ESC</span> to close
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import NewEmployeePage from "@/components/settings/NewEmployeeCreationForm";
import { cn } from "@/lib/utils";
import { NepaliDateInput } from "@/components/ui/nepali-date-input";

type EmployeeRow = {
  id: string;
  employeeId?: number;

  name: string;
  panNo?: string | null;
  disability?: boolean | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | string | null;

  // ✅ backend values
  dateOfJoiningBs?: string | null;
  dateOfJoiningAd?: string | null;

  role?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;

  lifeInsurance?: number | null;
  healthInsurance?: number | null;
  houseInsurance?: number | null;
};

type Option = { id: string; name: string };

function safeNum(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

const inputBase =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs placeholder:text-muted-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const selectBase =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function useAutoBanner() {
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  return { banner, setBanner };
}

/* ------------------------------ EDIT MODAL ------------------------------ */
function EditEmployeeModal({
  open,
  onClose,
  employee,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  employee: EmployeeRow | null;
  onUpdated: () => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const { banner, setBanner } = useAutoBanner();

  const [form, setForm] = useState<{
    name: string;
    panNo: string;

    roleId: string;
    departmentId: string;

    gender: "MALE" | "FEMALE" | "OTHER" | "";
    disability: boolean;

    joiningAd: string;
    joiningBs: string;

    lifeInsurance: string;
    healthInsurance: string;
    houseInsurance: string;
  }>({
    name: "",
    panNo: "",
    roleId: "",
    departmentId: "",
    gender: "",
    disability: false,
    joiningAd: "",
    joiningBs: "",
    lifeInsurance: "",
    healthInsurance: "",
    houseInsurance: "",
  });

  // ✅ hydrate form from employee (use employee?.id to avoid stale updates)
  useEffect(() => {
    if (!open || !employee) return;

    setForm({
      name: employee.name ?? "",
      panNo: employee.panNo ?? "",

      roleId: employee.role?.id ?? "",
      departmentId: employee.department?.id ?? "",

      gender:
        employee.gender === "MALE" ||
        employee.gender === "FEMALE" ||
        employee.gender === "OTHER"
          ? (employee.gender as any)
          : "",

      disability: Boolean(employee.disability),

      // ✅ ALWAYS take backend values on open
      joiningAd: employee.dateOfJoiningAd ?? "",
      joiningBs: employee.dateOfJoiningBs ?? "",

      lifeInsurance:
        employee.lifeInsurance === null || employee.lifeInsurance === undefined
          ? ""
          : String(employee.lifeInsurance),
      healthInsurance:
        employee.healthInsurance === null ||
        employee.healthInsurance === undefined
          ? ""
          : String(employee.healthInsurance),
      houseInsurance:
        employee.houseInsurance === null ||
        employee.houseInsurance === undefined
          ? ""
          : String(employee.houseInsurance),
    });
  }, [open, employee?.id]);

  useEffect(() => {
    if (!open) return;

    const run = async () => {
      setLoadingOptions(true);
      try {
        const [rRes, dRes] = await Promise.all([
          api.get("/roles"),
          api.get("/departments"),
        ]);
        setRoles(Array.isArray(rRes.data) ? rRes.data : []);
        setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
      } catch (e: any) {
        setRoles([]);
        setDepartments([]);
        setBanner({
          type: "error",
          message:
            e?.response?.data?.message || "Failed to load roles/departments.",
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    run();
  }, [open, setBanner]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !employee) return null;

  const totalInsurance =
    safeNum(form.lifeInsurance) +
    safeNum(form.healthInsurance) +
    safeNum(form.houseInsurance);

  const onSave = async () => {
    const name = form.name.trim();
    if (!name) {
      setBanner({ type: "error", message: "Employee name is required." });
      return;
    }
    if (!form.roleId) {
      setBanner({ type: "error", message: "Role is required." });
      return;
    }
    if (!form.departmentId) {
      setBanner({ type: "error", message: "Department is required." });
      return;
    }
    if (!form.gender) {
      setBanner({ type: "error", message: "Gender is required." });
      return;
    }
    if (!form.joiningBs) {
      setBanner({
        type: "error",
        message: "Date of joining (BS) is required.",
      });
      return;
    }

    const payload: any = {
      name,
      panNo: form.panNo.trim() ? form.panNo.trim() : null,

      roleId: form.roleId,
      departmentId: form.departmentId,

      gender: form.gender,
      disability: form.disability,

      dateOfJoiningAd: form.joiningAd || null,
      dateOfJoiningBs: form.joiningBs || null,

      lifeInsurance: form.lifeInsurance === "" ? 0 : Number(form.lifeInsurance),
      healthInsurance:
        form.healthInsurance === "" ? 0 : Number(form.healthInsurance),
      houseInsurance:
        form.houseInsurance === "" ? 0 : Number(form.houseInsurance),
    };

    for (const k of ["lifeInsurance", "healthInsurance", "houseInsurance"]) {
      if (!Number.isFinite(payload[k])) {
        setBanner({
          type: "error",
          message: "Insurance values must be valid numbers.",
        });
        return;
      }
      if (payload[k] < 0) {
        setBanner({
          type: "error",
          message: "Insurance values cannot be negative.",
        });
        return;
      }
    }

    setSaving(true);
    try {
      await api.patch(`/employees/${employee.id}`, payload);
      await onUpdated();
      onClose();
    } catch (e: any) {
      setBanner({
        type: "error",
        message: e?.response?.data?.message || "Failed to update employee.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl">
          <div className="rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
            <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Edit Employee
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update employee details inside your company.
              </p>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Employee Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className={inputBase}
                      placeholder="e.g., John Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      PAN No.
                    </label>
                    <input
                      value={form.panNo}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, panNo: e.target.value }))
                      }
                      className={inputBase}
                      placeholder="Optional (stored as text)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter exactly as issued (no formatting required).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Role <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={form.roleId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, roleId: e.target.value }))
                      }
                      className={selectBase}
                      disabled={loadingOptions}
                    >
                      <option value="">
                        {loadingOptions ? "Loading..." : "Select role"}
                      </option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Department <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={form.departmentId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, departmentId: e.target.value }))
                      }
                      className={selectBase}
                      disabled={loadingOptions}
                    >
                      <option value="">
                        {loadingOptions ? "Loading..." : "Select department"}
                      </option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Gender <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          gender: e.target.value as any,
                        }))
                      }
                      className={selectBase}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* ✅ Date picker: remount per employee + backend fallback */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Date of Joining{" "}
                      <span className="text-destructive">*</span>
                    </label>

                    <NepaliDateInput
                      key={employee.id} // ✅ ensures correct initial date when switching rows
                      valueAd={form.joiningAd || employee.dateOfJoiningAd || ""}
                      valueBs={form.joiningBs || employee.dateOfJoiningBs || ""}
                      placeholder="Select date"
                      className="w-full"
                      onChangeAd={(ad, bs) => {
                        setForm((p) => ({
                          ...p,
                          joiningAd: ad || "",
                          joiningBs: bs || "",
                        }));
                      }}
                    />

                    <p className="text-xs text-muted-foreground">
                      {/* Uses Nepali date from the picker (BS) and stores AD if
                      available. */}
                      date of joining: {form.joiningBs}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Disability
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enable this if the employee qualifies for disability
                          status.
                        </p>
                      </div>

                      <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={form.disability}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              disability: e.target.checked,
                            }))
                          }
                          className="h-5 w-5 rounded border-input"
                        />
                        Enabled
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Life Insurance
                    </label>
                    <input
                      inputMode="numeric"
                      type="number"
                      min={0}
                      value={form.lifeInsurance}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          lifeInsurance: e.target.value,
                        }))
                      }
                      className={inputBase}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Health Insurance
                    </label>
                    <input
                      inputMode="numeric"
                      type="number"
                      min={0}
                      value={form.healthInsurance}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          healthInsurance: e.target.value,
                        }))
                      }
                      className={inputBase}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      House Insurance
                    </label>
                    <input
                      inputMode="numeric"
                      type="number"
                      min={0}
                      value={form.houseInsurance}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          houseInsurance: e.target.value,
                        }))
                      }
                      className={inputBase}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Total Insurance
                    </label>
                    <input
                      readOnly
                      value={totalInsurance}
                      className={cn(
                        inputBase,
                        "bg-muted/30 text-right font-semibold"
                      )}
                    />
                  </div>
                </div>
              </div>

              {banner && (
                <div
                  className={cn(
                    "mt-4 rounded-lg border px-4 py-3 text-sm",
                    banner.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-destructive/20 bg-destructive/10 text-destructive"
                  )}
                >
                  {banner.message}
                </div>
              )}

              <div className="mt-3 text-center text-xs text-muted-foreground">
                Tip: Press <span className="font-semibold">ESC</span> to close
              </div>
            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className={cn(
                    "h-11 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                    "transition-colors hover:bg-muted/50",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  Close
                </button>

                <button
                  onClick={onSave}
                  disabled={saving}
                  className={cn(
                    "h-11 inline-flex items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
                    "transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- DELETE MODAL ----------------------------- */
function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  employeeName,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string;
  loading: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Delete Employee
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone. The employee will be removed from
              your company.
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <div className="text-sm text-destructive">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {employeeName}
                </span>
                ?
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className={cn(
                  "h-11 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                  "transition-colors hover:bg-muted/50",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  "h-11 rounded-md bg-destructive px-4 text-sm font-medium text-white shadow-xs",
                  "transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="mt-3 text-center text-xs text-muted-foreground">
              Tip: Press <span className="font-semibold">ESC</span> to close
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ MAIN PAGE ------------------------------ */
export default function EmployeeListPage() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [openNew, setOpenNew] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<EmployeeRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { banner, setBanner } = useAutoBanner();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setBanner({
        type: "error",
        message: e?.response?.data?.message || "Failed to load employees.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!openNew) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openNew]);

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

  const onOpenEdit = async (r: EmployeeRow) => {
  setEditMode(false);

  try {
    // ✅ Always fetch fresh employee before opening edit modal
    const res = await api.get(`/employees/${r.id}`);

    setEditing(res.data); // ✅ this will contain exact backend dateOfJoiningBs
    setOpenEdit(true);
  } catch (e: any) {
    setBanner({
      type: "error",
      message: e?.response?.data?.message || "Failed to load employee for edit.",
    });
  }
};

  const onOpenDelete = (r: EmployeeRow) => {
    setEditMode(false);
    setDeleting(r);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/employees/${deleting.id}`);
      setBanner({ type: "success", message: "Employee deleted successfully." });
      setOpenDelete(false);
      setDeleting(null);
      await fetchEmployees();
    } catch (e: any) {
      setBanner({
        type: "error",
        message: e?.response?.data?.message || "Failed to delete employee.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employees, roles, departments and insurance values.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode((p) => !p)}
            className={cn(
              "h-11 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
              "transition-colors hover:bg-muted/50",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            {editMode ? "Done" : "Edit"}
          </button>

          <button
            onClick={() => setOpenNew(true)}
            className={cn(
              "h-11 inline-flex items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
              "transition-colors hover:opacity-90",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="kp-table w-full min-w-[1450px]">
          <thead>
            <tr>
              {editMode && <th className="kp-th w-[170px]">Actions</th>}
              <th className="kp-th w-[80px]">ID</th>
              <th className="kp-th">Role</th>
              <th className="kp-th">Department</th>
              <th className="kp-th min-w-[220px]">Employee Name</th>
              <th className="kp-th min-w-[140px]">PAN No.</th>
              <th className="kp-th min-w-[120px]">Disability</th>
              <th className="kp-th min-w-[110px]">Gender</th>
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
                <td className="kp-td" colSpan={editMode ? 13 : 12}>
                  <div className="py-6 text-center text-muted-foreground">
                    Loading employees...
                  </div>
                </td>
              </tr>
            ) : viewRows.length === 0 ? (
              <tr>
                <td className="kp-td" colSpan={editMode ? 13 : 12}>
                  <div className="py-10 text-center">
                    <div className="text-foreground font-medium">
                      No employees found
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Click <span className="font-medium">Add Employee</span> to
                      create your first employee.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              viewRows.map((r: any) => (
                <tr key={r.id} className="kp-tr">
                  {editMode && (
                    <td className="kp-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenEdit(r)}
                          className={cn(
                            "h-11 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs",
                            "transition-colors hover:bg-muted/50",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          )}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onOpenDelete(r)}
                          className={cn(
                            "h-11 inline-flex items-center justify-center rounded-md bg-destructive px-3 text-sm font-medium text-white shadow-xs",
                            "transition-colors hover:opacity-90",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          )}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}

                  <td className="kp-td text-center font-semibold">
                    {r.employeeId ?? r._idx}
                  </td>
                  <td className="kp-td font-medium text-foreground">
                    {r.role?.name ?? "—"}
                  </td>
                  <td className="kp-td font-medium text-foreground">
                    {r.department?.name ?? "—"}
                  </td>
                  <td className="kp-td font-semibold">{r.name}</td>

                  <td className="kp-td">
                    {r.panNo ? (
                      <span className="font-medium text-foreground">
                        {r.panNo}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="kp-td font-medium text-foreground">
                    {r.disability === true ? "Yes" : "No"}
                  </td>

                  <td className="kp-td font-medium text-foreground">
                    {r.gender ?? "—"}
                  </td>

                  <td className="kp-td text-center font-medium">
                    {r.dateOfJoiningBs ?? "—"}
                  </td>

                  <td className="kp-td text-right font-medium">{r._life}</td>
                  <td className="kp-td text-right font-medium">{r._health}</td>
                  <td className="kp-td text-right font-medium">{r._house}</td>
                  <td className="kp-td text-right font-semibold">{r._total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {banner && (
        <div
          className={cn(
            "mt-4 rounded-lg border px-4 py-3 text-sm",
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          {banner.message}
        </div>
      )}

      {/* NEW EMPLOYEE MODAL */}
      {openNew && (
        <div className="fixed inset-0 z-[99999]">
          <div
            className="absolute inset-0 bg-black/55"
            onClick={() => setOpenNew(false)}
          />
          <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
            <div className="w-full max-w-6xl">
              <div className="rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
                <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Add New Employee
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Create employee inside your company.
                    </p>
                  </div>

                  <button
                    onClick={() => setOpenNew(false)}
                    className={cn(
                      "h-11 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                      "transition-colors hover:bg-muted/50",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    )}
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-[78vh] overflow-y-auto p-5">
                  <NewEmployeePage
                    hideHeader
                    onClose={() => setOpenNew(false)}
                    onCreated={async () => {
                      setOpenNew(false);
                      setBanner({
                        type: "success",
                        message: "Employee created successfully.",
                      });
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

      {/* EDIT MODAL */}
      <EditEmployeeModal
        open={openEdit}
        employee={editing}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        onUpdated={async () => {
          await fetchEmployees();
          setBanner({
            type: "success",
            message: "Employee updated successfully.",
          });
        }}
      />

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        open={openDelete}
        employeeName={deleting?.name ?? "this employee"}
        loading={deleteLoading}
        onClose={() => {
          if (deleteLoading) return;
          setOpenDelete(false);
          setDeleting(null);
        }}
        onConfirm={async () => {
          await onDelete();
        }}
      />
    </div>
  );
}

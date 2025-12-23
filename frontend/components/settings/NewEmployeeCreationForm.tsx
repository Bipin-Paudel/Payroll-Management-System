"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import DepartmentCreateForm from "@/components/settings/DepartmentCreateForm";
import RoleCreateForm from "@/components/settings/RoleCreateForm";
import { NepaliDateInput } from "@/components/ui/nepali-date-input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Dept = { id: string; name: string };
type Role = { id: string; name: string };

type Props = {
  onClose?: () => void;
  onCreated?: () => void | Promise<void>;
  /** ✅ When used inside a modal that already has a title, hide internal header */
  hideHeader?: boolean;
};

export default function NewEmployeeCreationForm({
  onClose,
  onCreated,
  hideHeader = false,
}: Props) {
  const router = useRouter();

  const [employeeName, setEmployeeName] = React.useState("");
  const [panNo, setPanNo] = React.useState("");

  const [departmentId, setDepartmentId] = React.useState("");
  const [roleId, setRoleId] = React.useState("");

  const [gender, setGender] = React.useState("");
  const [disability, setDisability] = React.useState(false);

  const [joiningAd, setJoiningAd] = React.useState("");
  const [joiningBs, setJoiningBs] = React.useState("");

  const [lifeInsurance, setLifeInsurance] = React.useState<string>("0");
  const [healthInsurance, setHealthInsurance] = React.useState<string>("0");
  const [houseInsurance, setHouseInsurance] = React.useState<string>("0");

  const totalInsurance =
    (Number(lifeInsurance) || 0) +
    (Number(healthInsurance) || 0) +
    (Number(houseInsurance) || 0);

  const [departments, setDepartments] = React.useState<Dept[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loadingMeta, setLoadingMeta] = React.useState(true);

  const [deptOpen, setDeptOpen] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    if (!serverMsg) return;
    const t = setTimeout(() => setServerMsg(null), 6000);
    return () => clearTimeout(t);
  }, [serverMsg]);

  async function fetchMeta() {
    setLoadingMeta(true);
    try {
      const [dRes, rRes] = await Promise.all([
        api.get("/departments"),
        api.get("/roles"),
      ]);

      setDepartments(
        Array.isArray(dRes.data) ? dRes.data : dRes.data?.data ?? []
      );
      setRoles(Array.isArray(rRes.data) ? rRes.data : rRes.data?.data ?? []);
    } catch {
      // keep stable
    } finally {
      setLoadingMeta(false);
    }
  }

  React.useEffect(() => {
    fetchMeta();
  }, []);

  function validate() {
    const e: Record<string, string> = {};

    if (!employeeName.trim()) e.employeeName = "Employee name is required.";
    if (!departmentId) e.departmentId = "Department is required.";
    if (!roleId) e.roleId = "Role is required.";
    if (!gender) e.gender = "Gender is required.";
    if (!joiningBs) e.joiningBs = "Date of joining is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerMsg(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post("/employees", {
        name: employeeName.trim(),
        panNo: panNo.trim() || null,
        departmentId,
        roleId,
        gender,
        disability,
        dateOfJoiningAd: joiningAd || null,
        dateOfJoiningBs: joiningBs || null,
        lifeInsurance: Number(lifeInsurance) || 0,
        healthInsurance: Number(healthInsurance) || 0,
        houseInsurance: Number(houseInsurance) || 0,
      });

      setServerMsg({ type: "success", text: "Employee created successfully." });

      setEmployeeName("");
      setPanNo("");
      setDepartmentId("");
      setRoleId("");
      setGender("");
      setDisability(false);
      setJoiningAd("");
      setJoiningBs("");
      setLifeInsurance("0");
      setHealthInsurance("0");
      setHouseInsurance("0");

      if (onCreated) await onCreated();
    } catch (e: any) {
      setServerMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to create employee.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (onClose) return onClose();
    router.back();
  };

  return (
    <div className="w-full">
      {/* ✅ Hide this header when inside modal */}
      {!hideHeader && (
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Create Employee
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new employee record. Departments and roles are company-specific.
          </p>
        </div>
      )}

      <div className="w-full rounded-xl border border-border bg-card shadow-sm">
        <form onSubmit={onSubmit}>
          <div className="p-5 sm:p-6 md:p-8">
            {/* Section: Employee Details */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-foreground">
                Employee Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in the employee’s basic information and joining date.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Employee Name */}
              <div>
                <label className="ui-label">
                  Employee Name <span className="text-destructive">*</span>
                </label>
                <div className="mt-2">
                  <input
                    className={cn(
                      "ui-control",
                      errors.employeeName &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                  {errors.employeeName && (
                    <p className="mt-2 ui-error">{errors.employeeName}</p>
                  )}
                </div>
              </div>

              {/* PAN */}
              <div>
                <label className="ui-label">PAN No.</label>
                <div className="mt-2">
                  <input
                    className="ui-control"
                    value={panNo}
                    onChange={(e) => setPanNo(e.target.value)}
                    placeholder="Optional (stored as text)"
                  />
                  <p className="mt-2 ui-help">
                    Enter exactly as issued (no formatting required).
                  </p>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="ui-label">
                  Department <span className="text-destructive">*</span>
                </label>

                <div className="mt-2 flex items-center gap-3">
                  <select
                    className={cn(
                      "ui-control",
                      errors.departmentId &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={loadingMeta}
                  >
                    <option value="">
                      {loadingMeta ? "Loading..." : "Select department"}
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  {/* ✅ Updated button */}
                  <button
                    type="button"
                    className={cn(
                      "h-11 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
                      "transition-colors hover:opacity-90",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    )}
                    onClick={() => setDeptOpen(true)}
                  >
                    + Add Department
                  </button>
                </div>

                {errors.departmentId && (
                  <p className="mt-2 ui-error">{errors.departmentId}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="ui-label">
                  Role <span className="text-destructive">*</span>
                </label>

                <div className="mt-2 flex items-center gap-3">
                  <select
                    className={cn(
                      "ui-control",
                      errors.roleId &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={loadingMeta}
                  >
                    <option value="">
                      {loadingMeta ? "Loading..." : "Select role"}
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>

                  {/* ✅ Updated button */}
                  <button
                    type="button"
                    className={cn(
                      "h-11 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
                      "transition-colors hover:opacity-90",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    )}
                    onClick={() => setRoleOpen(true)}
                  >
                    + Add Role
                  </button>
                </div>

                {errors.roleId && <p className="mt-2 ui-error">{errors.roleId}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="ui-label">
                  Gender <span className="text-destructive">*</span>
                </label>
                <div className="mt-2">
                  <select
                    className={cn(
                      "ui-control",
                      errors.gender &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>

                  {errors.gender && <p className="mt-2 ui-error">{errors.gender}</p>}
                </div>
              </div>

              {/* Date of Joining */}
              <div>
                <label className="ui-label">
                  Date of Joining <span className="text-destructive">*</span>
                </label>
                <div className="mt-2">
                  <NepaliDateInput
                    valueAd={joiningAd}
                    valueBs={joiningBs}
                    placeholder="Select date"
                    className="w-full"
                    onChangeAd={(ad, bs) => {
                      setJoiningAd(ad);
                      setJoiningBs(bs || "");
                    }}
                  />

                  {errors.joiningBs && (
                    <p className="mt-2 ui-error">{errors.joiningBs}</p>
                  )}
                  <p className="mt-2 ui-help">
                    Uses Nepali date from the picker (BS) .
                  </p>
                </div>
              </div>

              {/* Disability */}
              <div className="md:col-span-2">
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Disability
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enable this if the employee qualifies for disability status.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={disability}
                      onChange={(e) => setDisability(e.target.checked)}
                      className="h-5 w-5 rounded border-input"
                    />
                    Enabled
                  </label>
                </div>
              </div>
            </div>

            {/* Section: Insurance */}
            <div className="mt-10">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Insurance & Benefits
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter monthly insurance amounts (if applicable).
                  </p>
                </div>

                
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm p-5 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="ui-label">Life Insurance Amount</label>
                    <div className="mt-2">
                      <input
                        className="ui-control"
                        value={lifeInsurance}
                        onChange={(e) => setLifeInsurance(e.target.value)}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="ui-label">Health Insurance Amount</label>
                    <div className="mt-2">
                      <input
                        className="ui-control"
                        value={healthInsurance}
                        onChange={(e) => setHealthInsurance(e.target.value)}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="ui-label">House Insurance Amount</label>
                    <div className="mt-2">
                      <input
                        className="ui-control"
                        value={houseInsurance}
                        onChange={(e) => setHouseInsurance(e.target.value)}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="text-sm font-medium text-foreground">
                    Total Insurance
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {totalInsurance}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className={cn(
                  "h-11 w-full sm:w-auto rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                  "transition-colors hover:bg-muted/50",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  submitting && "opacity-60 cursor-not-allowed"
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "h-11 w-full sm:w-auto rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-xs",
                  "transition-colors hover:opacity-90",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  submitting && "opacity-60 cursor-not-allowed"
                )}
              >
                {submitting ? "Creating..." : "Create Employee"}
              </button>
            </div>

            {serverMsg && (
              <div
                className={cn(
                  "mt-5 rounded-lg border px-4 py-3 text-sm",
                  serverMsg.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                )}
              >
                {serverMsg.text}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Department Dialog */}
      <Dialog
        open={deptOpen}
        onOpenChange={(open) => {
          setDeptOpen(open);
          if (!open) fetchMeta();
        }}
      >
        <DialogContent className="w-[94vw] sm:w-[52vw] max-w-none rounded-xl border border-border bg-card p-6 shadow-sm">
          <DialogHeader>
            <VisuallyHidden.Root>
              <DialogTitle>Create Department</DialogTitle>
            </VisuallyHidden.Root>
          </DialogHeader>

          <DepartmentCreateForm
            // @ts-ignore
            onSuccess={() => {
              fetchMeta();
              setDeptOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog
        open={roleOpen}
        onOpenChange={(open) => {
          setRoleOpen(open);
          if (!open) fetchMeta();
        }}
      >
        <DialogContent className="w-[94vw] sm:w-[52vw] max-w-none rounded-xl border border-border bg-card p-6 shadow-sm">
          <DialogHeader>
            <VisuallyHidden.Root>
              <DialogTitle>Create Role</DialogTitle>
            </VisuallyHidden.Root>
          </DialogHeader>

          <RoleCreateForm
            // @ts-ignore
            onSuccess={() => {
              fetchMeta();
              setRoleOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

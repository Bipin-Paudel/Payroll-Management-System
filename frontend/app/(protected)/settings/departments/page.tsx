"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api"; // ✅ axios instance with interceptors

import DepartmentCreateForm from "@/components/settings/DepartmentCreateForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type DepartmentRow = {
  id: string;
  name: string;
  description?: string | null;
};

function toAxiosMessage(err: unknown, fallback: string) {
  const e = err as AxiosError<any>;
  const data = e?.response?.data;
  const msg = data?.message || data?.error || e?.message || fallback;
  return Array.isArray(msg) ? msg.join(", ") : String(msg);
}

function normalizeList(payload: any): DepartmentRow[] {
  const raw = payload?.data ?? payload ?? [];
  const arr = Array.isArray(raw) ? raw : raw?.items ?? raw?.rows ?? [];
  if (!Array.isArray(arr)) return [];
  return arr.map((r: any) => ({
    id: String(r?.id ?? ""),
    name: String(r?.name ?? ""),
    description: r?.description ?? null,
  }));
}

export default function DepartmentsPage() {
  const router = useRouter();

  const [rows, setRows] = React.useState<DepartmentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");

  const [editMode, setEditMode] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);

  // inline edit
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [savingId, setSavingId] = React.useState<string | null>(null);

  // inline delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // full-width banner
  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [fieldErrors, setFieldErrors] = React.useState<{
    name?: string;
    description?: string;
  }>({});

  React.useEffect(() => {
    if (!serverMsg) return;
    const t = setTimeout(() => setServerMsg(null), 6000);
    return () => clearTimeout(t);
  }, [serverMsg]);

  React.useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 6000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setRows(normalizeList(res.data));
    } catch (err) {
      setServerMsg({
        type: "error",
        text: toAxiosMessage(err, "Failed to load departments."),
      });
    } finally {
      setLoading(false);
    }
  }

  // ✅ Perfect refresh helper (client + app-router cache)
  async function reload() {
    await fetchDepartments();
    router.refresh();
  }

  React.useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const a = r.name?.toLowerCase() ?? "";
      const b = (r.description ?? "").toLowerCase();
      return a.includes(term) || b.includes(term);
    });
  }, [rows, q]);

  function startEdit(r: DepartmentRow) {
    setServerMsg(null);
    setConfirmDeleteId(null);
    setFieldErrors({});
    setEditingId(r.id);
    setEditName(r.name ?? "");
    setEditDesc(r.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
    setFieldErrors({});
  }

  function validateEdit() {
    const e: { name?: string; description?: string } = {};
    if (!editName.trim()) e.name = "Department name is required.";
    else if (editName.trim().length < 2)
      e.name = "Department name must be at least 2 characters.";
    if (editDesc.trim().length > 500)
      e.description = "Description must be 500 characters or less.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveEdit(id: string) {
    setServerMsg(null);
    if (!validateEdit()) return;

    setSavingId(id);
    try {
      await api.patch(`/departments/${id}`, {
        name: editName.trim(),
        description: editDesc.trim() || null,
      });

      setServerMsg({
        type: "success",
        text: "Department updated successfully.",
      });

      cancelEdit();
      await reload();
    } catch (err) {
      setServerMsg({
        type: "error",
        text: toAxiosMessage(err, "Failed to update department."),
      });
    } finally {
      setSavingId(null);
    }
  }

  async function deleteDepartment(id: string) {
    setServerMsg(null);
    setDeletingId(id);

    try {
      await api.delete(`/departments/${id}`);

      setServerMsg({
        type: "success",
        text: "Department deleted successfully.",
      });

      setConfirmDeleteId(null);
      if (editingId === id) cancelEdit();
      await reload();
    } catch (err) {
      setServerMsg({
        type: "error",
        text: toAxiosMessage(err, "Failed to delete department."),
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Departments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, edit, and manage departments used across your payroll system.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setServerMsg(null);
              setConfirmDeleteId(null);
              cancelEdit();
              setEditMode((v) => !v);
            }}
            className={cn(
              "h-11 w-full sm:w-auto rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
              "transition-colors hover:bg-muted/50",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            {editMode ? "Done" : "Edit Departments"}
          </button>

          <button
            type="button"
            onClick={() => {
              setServerMsg(null);
              setConfirmDeleteId(null);
              setOpenCreate(true);
            }}
            className={cn(
              "h-11 w-full sm:w-auto rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
              "transition-colors hover:opacity-90",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            + Create Department
          </button>
        </div>
      </div>

      <div className="w-full rounded-xl border border-border bg-card shadow-sm">
        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="ui-label">Search</label>
              <div className="mt-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by department name or description..."
                  className="ui-control"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filtered.length} department(s)`}
            </div>
          </div>

          {serverMsg && (
            <div
              className={cn(
                "mt-5 w-full rounded-lg border px-4 py-3 text-sm",
                serverMsg.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              )}
            >
              {serverMsg.text}
            </div>
          )}

          {/* ✅ Same table styling as Roles (kp-table + zebra + hover from global.css) */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-background">
            <table className="kp-table">
              <thead>
                <tr>
                  <th className="kp-th">Department Name</th>
                  <th className="kp-th">Description</th>
                  {editMode && <th className="kp-th w-[340px]">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="kp-tr">
                    <td
                      className="kp-td text-muted-foreground"
                      colSpan={editMode ? 3 : 2}
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr className="kp-tr">
                    <td
                      className="kp-td text-muted-foreground"
                      colSpan={editMode ? 3 : 2}
                    >
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const isEditing = editingId === r.id;
                    const isSaving = savingId === r.id;
                    const isConfirmingDelete = confirmDeleteId === r.id;
                    const isDeleting = deletingId === r.id;

                    return (
                      <tr key={r.id} className="kp-tr">
                        <td className="kp-td">
                          {isEditing ? (
                            <div>
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={cn(
                                  "ui-control",
                                  fieldErrors.name &&
                                    "border-destructive focus-visible:ring-destructive/20"
                                )}
                              />
                              {fieldErrors.name && (
                                <p className="mt-2 ui-error">
                                  {fieldErrors.name}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium text-foreground">
                              {r.name}
                            </span>
                          )}
                        </td>

                        <td className="kp-td">
                          {isEditing ? (
                            <div>
                              <input
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className={cn(
                                  "ui-control",
                                  fieldErrors.description &&
                                    "border-destructive focus-visible:ring-destructive/20"
                                )}
                              />
                              {fieldErrors.description && (
                                <p className="mt-2 ui-error">
                                  {fieldErrors.description}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {r.description ? r.description : "—"}
                            </span>
                          )}
                        </td>

                        {editMode && (
                          <td className="kp-td">
                            {isEditing ? (
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => saveEdit(r.id)}
                                  className={cn(
                                    "h-11 w-full sm:w-auto rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
                                    "transition-colors hover:opacity-90",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    isSaving && "opacity-70 cursor-not-allowed"
                                  )}
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>

                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => {
                                    cancelEdit();
                                    setConfirmDeleteId(null);
                                  }}
                                  className={cn(
                                    "h-11 w-full sm:w-auto rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                                    "transition-colors hover:bg-muted/50",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    isSaving && "opacity-60 cursor-not-allowed"
                                  )}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <button
                                  type="button"
                                  onClick={() => startEdit(r)}
                                  className={cn(
                                    "h-11 w-full sm:w-auto rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                                    "transition-colors hover:bg-muted/50",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                  )}
                                >
                                  Edit
                                </button>

                                {!isConfirmingDelete ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setServerMsg(null);
                                      setConfirmDeleteId(r.id);
                                    }}
                                    className={cn(
                                      "h-11 w-full sm:w-auto rounded-md bg-destructive px-4 text-sm font-medium text-white shadow-xs",
                                      "transition-colors hover:opacity-90",
                                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    )}
                                  >
                                    Delete
                                  </button>
                                ) : (
                                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => deleteDepartment(r.id)}
                                      className={cn(
                                        "h-11 w-full sm:w-auto rounded-md bg-destructive px-4 text-sm font-medium text-white shadow-xs",
                                        "transition-colors hover:opacity-90",
                                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        isDeleting && "opacity-70 cursor-not-allowed"
                                      )}
                                    >
                                      {isDeleting
                                        ? "Deleting..."
                                        : "Confirm Delete"}
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => setConfirmDeleteId(null)}
                                      className={cn(
                                        "h-11 w-full sm:w-auto rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                                        "transition-colors hover:bg-muted/50",
                                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        isDeleting && "opacity-60 cursor-not-allowed"
                                      )}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Create dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="w-[94vw] sm:w-[60vw] max-w-none rounded-xl border bg-card shadow-sm">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>
              Add a new department for your payroll system.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <DepartmentCreateForm
              inDialog
              onCancel={() => setOpenCreate(false)}
              onCreated={async () => {
                setServerMsg({
                  type: "success",
                  text: "Department created successfully.",
                });
                setOpenCreate(false);
                await reload(); // ✅ perfect refresh
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

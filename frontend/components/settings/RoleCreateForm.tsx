"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api"; 

type Props = {
  inDialog?: boolean;
  onCancel?: () => void;
  onCreated?: (role: { id: string; name: string }) => void;
};

function toErrorMessage(err: unknown, fallback: string) {
  const e = err as AxiosError<any>;
  const data = e?.response?.data;

  const msg = data?.message || data?.error || e?.message || fallback;
  return Array.isArray(msg) ? msg.join(", ") : String(msg);
}

export default function RoleCreateForm({
  inDialog = false,
  onCancel,
  onCreated,
}: Props) {
  const router = useRouter();

  const [roleName, setRoleName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [errors, setErrors] = React.useState<{
    roleName?: string;
    description?: string;
  }>({});

  const [submitting, setSubmitting] = React.useState(false);

  // ✅ only used when NOT in dialog (dialog uses parent banner)
  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    if (!serverMsg) return;
    const t = setTimeout(() => setServerMsg(null), 6000);
    return () => clearTimeout(t);
  }, [serverMsg]);

  function validate() {
    const e: { roleName?: string; description?: string } = {};
    if (!roleName.trim()) e.roleName = "Role name is required.";
    else if (roleName.trim().length < 2)
      e.roleName = "Role name must be at least 2 characters.";
    if (description.trim().length > 500)
      e.description = "Description must be 500 characters or less.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!inDialog) setServerMsg(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // ✅ Uses your axios api instance (token attach + refresh handled there)
      const res = await api.post("/roles", {
        name: roleName.trim(),
        description: description.trim() || null,
      });

      const created = (res.data?.data ?? res.data) as any;

      const createdRole = {
        id: created?.id || "",
        name: created?.name || roleName.trim(),
      };

      setRoleName("");
      setDescription("");

      // ✅ dialog: pass back to parent (parent shows banner + closes modal)
      if (inDialog && onCreated && createdRole.id) {
        onCreated(createdRole);
        return;
      }

      // ✅ page mode: show local banner + refresh page data
      if (!inDialog) {
        setServerMsg({ type: "success", text: "Role created successfully." });

        // ✅ App Router refresh (revalidates server components + data)
        router.refresh();
      }
    } catch (err) {
      if (!inDialog) {
        setServerMsg({
          type: "error",
          text: toErrorMessage(err, "Failed to create role."),
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (inDialog) {
      onCancel?.();
      return;
    }
    router.back();
  };

  return (
    <div className="w-full">
      {/* ✅ IMPORTANT: this header will NOT show in dialog */}
      {!inDialog && (
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Create Role
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a role to your payroll system (e.g., Accountant, Manager, Sales
            Executive).
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={cn(
          inDialog
            ? "w-full"
            : "w-full rounded-xl border border-border bg-card shadow-sm"
        )}
      >
        <div className={cn(inDialog ? "p-0" : "p-5 sm:p-6 md:p-8")}>
          <div className="grid grid-cols-1 gap-5 md:gap-6">
            <div>
              <label className="ui-label">
                Role Name <span className="text-destructive">*</span>
              </label>

              <div className="mt-2">
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Payroll Officer"
                  className={cn(
                    "ui-control",
                    errors.roleName &&
                      "border-destructive focus-visible:ring-destructive/20"
                  )}
                />
                {errors.roleName && (
                  <p className="mt-2 ui-error">{errors.roleName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="ui-label">Description</label>

              <div className="mt-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Optional"
                  className={cn(
                    "w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs",
                    "transition-colors outline-none resize-none",
                    "placeholder:text-muted-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    errors.description &&
                      "border-destructive focus-visible:ring-destructive/20"
                  )}
                />
                <div className="mt-2 flex items-start justify-between gap-3">
                  {errors.description ? (
                    <p className="ui-error">{errors.description}</p>
                  ) : (
                    <p className="ui-help">Optional (max 500 characters).</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {description.trim().length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(inDialog ? "mt-5" : "mt-7")}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
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
                  "h-11 w-full sm:w-auto rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs",
                  "transition-colors hover:opacity-90",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  submitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {submitting ? "Creating..." : "Create Role"}
              </button>
            </div>

            {/* ✅ page-mode only (not dialog) */}
            {!inDialog && serverMsg && (
              <div
                className={cn(
                  "mt-4 rounded-lg border px-4 py-3 text-sm",
                  serverMsg.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                )}
              >
                {serverMsg.text}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

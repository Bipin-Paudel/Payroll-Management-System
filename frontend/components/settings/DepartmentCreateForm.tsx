"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Props = {
  inDialog?: boolean;
  onCancel?: () => void;
  onCreated?: (dept: { id: string; name: string }) => void;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toErrorMessage(data: any, fallback: string) {
  const msg = data?.message || data?.error || fallback;
  return Array.isArray(msg) ? msg.join(", ") : String(msg);
}

export default function DepartmentCreateForm({
  inDialog = false,
  onCancel,
  onCreated,
}: Props) {
  const router = useRouter();

  const [departmentName, setDepartmentName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [errors, setErrors] = React.useState<{
    departmentName?: string;
    description?: string;
  }>({});

  const [submitting, setSubmitting] = React.useState(false);

  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // auto-hide msg after 6s
  React.useEffect(() => {
    if (!serverMsg) return;
    const t = setTimeout(() => setServerMsg(null), 6000);
    return () => clearTimeout(t);
  }, [serverMsg]);

  function validate() {
    const e: { departmentName?: string; description?: string } = {};

    if (!departmentName.trim()) e.departmentName = "Department name is required.";
    else if (departmentName.trim().length < 2)
      e.departmentName = "Department name must be at least 2 characters.";

    if (description.trim().length > 500)
      e.description = "Description must be 500 characters or less.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerMsg(null);

    if (!validate()) return;

    const token = getToken();
    if (!token) {
      setServerMsg({ type: "error", text: "Missing token. Please login again." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${baseURL}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: departmentName.trim(),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(toErrorMessage(data, "Failed to create department."));
      }

      const data = await safeJson(res);

      // try to extract created dept
      const created =
        data?.data ??
        data ??
        null;

      const createdDept = {
        id: created?.id || "",
        name: created?.name || departmentName.trim(),
      };

      setServerMsg({ type: "success", text: "Department created successfully." });

      // clear
      setDepartmentName("");
      setDescription("");

      // if in dialog, notify parent + close
      if (inDialog && onCreated && createdDept.id) {
        onCreated(createdDept);
      }
    } catch (err: any) {
      setServerMsg({
        type: "error",
        text: err?.message || "Something went wrong.",
      });
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
      {/* ✅ Show page header only when NOT in dialog */}
      {!inDialog && (
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Create Department
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Add a department to organize employees (e.g., HR, Finance, Operations).
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={cn(
          inDialog
            ? "w-full"
            : "w-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden"
        )}
      >
        <div className={cn(inDialog ? "px-0 py-0" : "px-4 py-6 sm:px-6 md:px-10 md:py-10")}>
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {/* Department Name */}
            <div>
              <label className="block text-base font-semibold text-gray-900">
                Department Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-3">
                <input
                  value={departmentName}
                  onChange={(e) => {
                    setDepartmentName(e.target.value);
                    if (serverMsg) setServerMsg(null);
                  }}
                  placeholder="e.g., Finance"
                  className={cn(
                    "w-full rounded-2xl border bg-white px-5 py-4 text-base outline-none transition",
                    "placeholder:text-gray-400",
                    errors.departmentName
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  )}
                />
                {errors.departmentName && (
                  <p className="mt-2 text-sm text-red-600">{errors.departmentName}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-semibold text-gray-900">
                Description
              </label>
              <div className="mt-3">
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (serverMsg) setServerMsg(null);
                  }}
                  rows={6}
                  placeholder="Optional"
                  className={cn(
                    "w-full rounded-2xl border bg-white px-5 py-4 text-base outline-none transition",
                    "resize-none placeholder:text-gray-400",
                    errors.description
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  )}
                />
                <div className="mt-2">
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={cn(inDialog ? "mt-6" : "mt-8")}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className={cn(
                  "w-full sm:w-auto",
                  "rounded-2xl border border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-700",
                  "hover:bg-gray-50 transition",
                  submitting && "opacity-60 cursor-not-allowed"
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full sm:w-auto",
                  "rounded-2xl px-8 py-3 text-base font-semibold text-white shadow-sm transition",
                  submitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {submitting ? "Creating..." : "Create Department"}
              </button>
            </div>

            {/* message bottom */}
            {serverMsg && (
              <div
                className={cn(
                  "mt-4 rounded-xl border px-4 py-3 text-sm",
                  serverMsg.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
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

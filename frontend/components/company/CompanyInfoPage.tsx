"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Status =
  | { type: ""; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function CompanyInfoPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "", message: "" });

  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    entityType: "",
    panVat: "",
    address: "",
    phone: "",
    email: "",
  });

  // Prefill if company exists (edit mode)
  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/company/me");
        if (res?.data?.id) {
          setForm({
            name: res.data.name || "",
            entityType: res.data.entityType || "",
            panVat: res.data.panVat || "",
            address: res.data.address || "",
            phone: res.data.phone || "",
            email: res.data.email || "",
          });
          setIsEdit(true);
        }
      } catch {
        // create mode
      } finally {
        setChecking(false);
      }
    };
    run();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isValid = useMemo(() => {
    return (
      form.name.trim() &&
      form.entityType.trim() &&
      form.panVat.trim() &&
      form.address.trim() &&
      form.phone.trim()
    );
  }, [form]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!isValid) {
      setStatus({ type: "error", message: "Please fill all required fields." });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        entityType: form.entityType,
        panVat: form.panVat.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
      };

      if (isEdit) {
        await api.patch("/company/me", payload);
        setStatus({ type: "success", message: "Company updated successfully." });
      } else {
        await api.post("/company", payload);
        setStatus({ type: "success", message: "Company created successfully." });
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message:
          err?.response?.data?.message ||
          (isEdit
            ? "Failed to update company. Please try again."
            : "Failed to create company. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const entityLabel = useMemo(() => {
    const map: Record<string, string> = {
      SOLE_PROPRIETOR: "Sole Proprietor",
      PARTNERSHIP: "Partnership",
      PVT_LTD: "Private Limited (PVT LTD)",
      NGO: "NGO",
      OTHER: "Other",
    };
    return map[form.entityType] || "—";
  }, [form.entityType]);

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="rounded-xl border border-border bg-card shadow-sm p-6 md:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 rounded bg-muted" />
              <div className="h-4 w-80 rounded bg-muted" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="h-11 rounded bg-muted" />
                <div className="h-11 rounded bg-muted" />
                <div className="h-11 rounded bg-muted" />
                <div className="h-11 rounded bg-muted" />
              </div>
              <div className="h-11 w-44 rounded bg-muted mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-background">
      <div className="w-full  px-6 py-10">
        {/* Header */}
        <div className="mb-6 space-y-2">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                Company Information
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEdit
                  ? "Update your company details used across payroll, reports, and exports."
                  : "Add your company details to start using the system."}
              </p>
            </div>

            {isEdit && (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className={cn(
                  "h-11 shrink-0 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                  "transition-colors hover:bg-muted/50",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Company summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card shadow-sm p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Company Profile
                </h2>

                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border",
                    isEdit
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  )}
                >
                  {isEdit ? "Active" : "Not Created"}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow label="Company Name" value={form.name || "—"} />
                <InfoRow label="Entity Type" value={entityLabel} />
                <InfoRow label="PAN/VAT" value={form.panVat || "—"} />
                <InfoRow label="Phone" value={form.phone || "—"} />
                <InfoRow label="Email" value={form.email || "—"} />
                <InfoRow label="Address" value={form.address || "—"} />
              </div>

              <div className="mt-6 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
                Tip: Keep your email and address accurate — these appear on payroll
                exports and internal company reports.
              </div>
            </div>

            {/* Status */}
            {status.message && (
              <div
                className={cn(
                  "mt-4 rounded-lg border px-4 py-3 text-sm",
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                )}
              >
                {status.message}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={onSubmit}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border p-6 md:p-8">
                <h2 className="text-base font-semibold text-foreground">
                  {isEdit ? "Edit Details" : "Company Setup"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fields marked with <span className="font-medium">*</span> are
                  required.
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Company Name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="e.g., ABC Payroll Pvt. Ltd."
                    required
                  />

                  <Select
                    label="Entity Type"
                    name="entityType"
                    value={form.entityType}
                    onChange={onChange}
                    required
                    placeholder="Select entity type"
                    options={[
                      { label: "Sole Proprietor", value: "SOLE_PROPRIETOR" },
                      { label: "Partnership", value: "PARTNERSHIP" },
                      { label: "Private Limited (PVT LTD)", value: "PVT_LTD" },
                      { label: "NGO", value: "NGO" },
                      { label: "Other", value: "OTHER" },
                    ]}
                  />

                  <Field
                    label="PAN/VAT Number"
                    name="panVat"
                    value={form.panVat}
                    onChange={onChange}
                    placeholder="e.g., 123456789"
                    required
                  />

                  <Field
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="e.g., +977 98XXXXXXXX"
                    required
                  />

                  <Field
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Street, City"
                    required
                  />

                  <Field
                    label="Email (Optional)"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="company@email.com"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="border-t border-border bg-muted/20 px-6 py-5 md:px-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {isEdit
                    ? "Changes take effect immediately."
                    : "You can update these details later from settings."}
                </div>

                <div className="flex gap-3 justify-end">
                  {isEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatus({ type: "", message: "" });
                        // reload latest from server
                        setChecking(true);
                        api
                          .get("/company/me")
                          .then((res) => {
                            if (res?.data?.id) {
                              setForm({
                                name: res.data.name || "",
                                entityType: res.data.entityType || "",
                                panVat: res.data.panVat || "",
                                address: res.data.address || "",
                                phone: res.data.phone || "",
                                email: res.data.email || "",
                              });
                              setIsEdit(true);
                            }
                          })
                          .finally(() => setChecking(false));
                      }}
                      className={cn(
                        "h-11 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs",
                        "transition-colors hover:bg-muted/50",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      )}
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className={cn(
                      "h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-xs",
                      "transition-colors hover:opacity-90",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    {loading
                      ? "Saving..."
                      : isEdit
                      ? "Update Company"
                      : "Save Company"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground text-right break-words max-w-[60%]">
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="ui-label">{label}</span>
        {required && <span className="text-xs text-muted-foreground">*</span>}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="ui-control mt-2"
      />
    </label>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="ui-label">{label}</span>
        {required && <span className="text-xs text-muted-foreground">*</span>}
      </div>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="ui-control mt-2"
      >
        <option value="">{placeholder || "Select"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

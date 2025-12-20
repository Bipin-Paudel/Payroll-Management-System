"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
      <div className="min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 bg-gray-200 rounded" />
              <div className="h-4 w-80 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-10 w-40 bg-gray-200 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="text-sm text-gray-500">
            Settings <span className="mx-2">/</span> Company
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Company Information
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit
                  ? "Update your company details used across payroll, reports, and exports."
                  : "Add your company details to start using the system."}
              </p>
            </div>

            {/* Right side small action */}
            {isEdit && (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Company summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Company Profile
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    isEdit
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
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

              <div className="mt-6 text-xs text-gray-500 leading-relaxed">
                Tip: Keep your email and address accurate—these appear on payroll
                exports and internal company reports.
              </div>
            </div>

            {/* Status */}
            {status.message && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {status.message}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={onSubmit}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm"
            >
              <div className="p-6 md:p-8 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Fields marked with * are required.
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <div className="px-6 md:px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
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
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="rounded-xl bg-purple-700 text-white px-5 py-2.5 hover:bg-purple-800 transition disabled:opacity-60 disabled:cursor-not-allowed font-medium"
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

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900 text-right wrap-break-word max-w-[60%]">
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
        <span className="text-gray-800 font-medium">{label}</span>
        {required && <span className="text-xs text-gray-400">*</span>}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full mt-2 h-11 px-3 border border-gray-300 text-gray-900 rounded-xl
                   focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
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
        <span className="text-gray-800 font-medium">{label}</span>
        {required && <span className="text-xs text-gray-400">*</span>}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full mt-2 h-11 px-3 border border-gray-300 text-gray-900 rounded-xl
                   focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none bg-white"
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

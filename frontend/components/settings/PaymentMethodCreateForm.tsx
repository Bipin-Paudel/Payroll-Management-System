"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export default function NewPaymentMethodPage() {
  const router = useRouter();

  const [paymentMethodName, setPaymentMethodName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [errors, setErrors] = React.useState<{
    paymentMethodName?: string;
    description?: string;
  }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ✅ Auto-hide success/error after 6 seconds
  React.useEffect(() => {
    if (!serverMsg) return;
    const t = setTimeout(() => setServerMsg(null), 6000);
    return () => clearTimeout(t);
  }, [serverMsg]);

  function validate() {
    const e: { paymentMethodName?: string; description?: string } = {};

    if (!paymentMethodName.trim())
      e.paymentMethodName = "Payment method name is required.";
    else if (paymentMethodName.trim().length < 2)
      e.paymentMethodName = "Payment method name must be at least 2 characters.";

    if (description.trim().length > 500)
      e.description = "Description must be 500 characters or less.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerMsg(null);

    if (!validate()) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!token) {
      setServerMsg({
        type: "error",
        text: "Missing token. Please login again.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${baseURL}/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: paymentMethodName.trim(),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.message || "Failed to create payment method.";
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
      }

      setServerMsg({
        type: "success",
        text: "Payment method created successfully.",
      });

      // ✅ Clear form after success
      setPaymentMethodName("");
      setDescription("");

      // Optional redirect (keep if you want)
      // router.push("/dashboard/payroll/payment-methods");
    } catch (err: any) {
      setServerMsg({
        type: "error",
        text: err?.message || "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Create Payment Method
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Add a payment method for payroll payouts (e.g., Bank Transfer, Cash, Cheque).
        </p>
      </div>

      <div className="w-full">
        <form
          onSubmit={onSubmit}
          className={cn(
            "w-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-200",
            "overflow-hidden"
          )}
        >
          <div className="px-4 py-6 sm:px-6 md:px-10 md:py-10">
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {/* Payment Method Name */}
              <div>
                <label className="block text-base font-semibold text-gray-900">
                  Payment Method Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-3">
                  <input
                    value={paymentMethodName}
                    onChange={(e) => {
                      setPaymentMethodName(e.target.value);
                      if (serverMsg) setServerMsg(null);
                    }}
                    placeholder="e.g., Bank Transfer"
                    className={cn(
                      "w-full rounded-2xl border bg-white px-5 py-4 text-base outline-none transition",
                      "placeholder:text-gray-400",
                      errors.paymentMethodName
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    )}
                  />
                  {errors.paymentMethodName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.paymentMethodName}
                    </p>
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
                    placeholder="Add notes about this payment method (Optional)"
                    className={cn(
                      "w-full rounded-2xl border bg-white px-5 py-4 text-base outline-none transition",
                      "resize-none placeholder:text-gray-400",
                      errors.description
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    )}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    {errors.description ? (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-6 md:px-10">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
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
                  submitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {submitting ? "Creating..." : "Create Payment Method"}
              </button>
            </div>

            {/* ✅ Message at bottom + auto-hide after 6s */}
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
        </form>
      </div>
    </div>
  );
}

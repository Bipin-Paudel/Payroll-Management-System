"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

type Props = {
  inDialog?: boolean;
  onCancel?: () => void;
  onCreated?: () => void;
};

export default function PaymentMethodCreationForm({
  inDialog = false,
  onCancel,
  onCreated,
}: Props) {
  const router = useRouter();

  const [paymentMethodName, setPaymentMethodName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [errors, setErrors] = React.useState<{
    paymentMethodName?: string;
    description?: string;
  }>({});

  const [submitting, setSubmitting] = React.useState(false);

  // Page-mode only banner (dialog uses parent page banner)
  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ✅ Auto-hide success/error after 6 seconds (page mode only)
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
    if (!inDialog) setServerMsg(null);

    if (!validate()) return;

    const token = getToken();
    if (!token) {
      if (!inDialog) {
        setServerMsg({
          type: "error",
          text: "Missing token. Please login again.",
        });
      }
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
        const data = await safeJson(res);
        throw new Error(toErrorMessage(data, "Failed to create payment method."));
      }

      // ✅ Clear form after success
      setPaymentMethodName("");
      setDescription("");
      setErrors({});

      // ✅ In dialog: close + let parent show banner and refresh list
      if (inDialog) {
        onCreated?.();
        return;
      }

      // ✅ Page-mode message only
      setServerMsg({
        type: "success",
        text: "Payment method created successfully.",
      });
      router.refresh();
    } catch (err: any) {
      if (!inDialog) {
        setServerMsg({
          type: "error",
          text: err?.message || "Something went wrong.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (inDialog) return onCancel?.();
    router.back();
  };

  return (
    <div className="w-full">
      {/* Page header (hide inside popup) */}
      {!inDialog && (
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Create Payment Method
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a payment method for payroll payouts (e.g., Bank Transfer, Cash, Cheque).
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={cn(
          inDialog ? "w-full" : "w-full rounded-xl border border-border bg-card shadow-sm"
        )}
      >
        <div className={cn(inDialog ? "p-0" : "p-5 sm:p-6 md:p-8")}>
          <div className="grid grid-cols-1 gap-5 md:gap-6">
            {/* Payment Method Name */}
            <div>
              <label className="ui-label">
                Payment Method Name <span className="text-destructive">*</span>
              </label>
              <div className="mt-2">
                <input
                  value={paymentMethodName}
                  onChange={(e) => {
                    setPaymentMethodName(e.target.value);
                    if (!inDialog && serverMsg) setServerMsg(null);
                  }}
                  placeholder="e.g., Bank Transfer"
                  className={cn(
                    "ui-control",
                    errors.paymentMethodName &&
                      "border-destructive focus-visible:ring-destructive/20"
                  )}
                />
                {errors.paymentMethodName && (
                  <p className="mt-2 ui-error">{errors.paymentMethodName}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="ui-label">Description</label>
              <div className="mt-2">
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (!inDialog && serverMsg) setServerMsg(null);
                  }}
                  rows={6}
                  placeholder="Add notes about this payment method (Optional)"
                  className={cn(
                    "w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs",
                    "transition-colors outline-none resize-none",
                    "placeholder:text-muted-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
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

          {/* Footer actions */}
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
                {submitting ? "Creating..." : "Create Payment Method"}
              </button>
            </div>

            {/* Page-only message (dialog shows nothing here) */}
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

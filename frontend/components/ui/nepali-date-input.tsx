"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { cn } from "@/lib/utils";

const Calendar = dynamic(() => import("@sbmdkl/nepali-datepicker-reactjs"), {
  ssr: false,
}) as any;

type NepaliDateInputProps = {
  /** AD date stored in parent (yyyy-mm-dd) */
  valueAd?: string;
  /** BS date shown in input (yyyy-mm-dd) */
  valueBs?: string;

  onChangeAd: (adDate: string, bsDate?: string) => void;

  placeholder?: string;
  className?: string;
};

const pad2 = (n: any) => String(n ?? "").padStart(2, "0");

function normalizeBs(p: any): string {
  const v =
    p?.bsDate ??
    p?.detail?.bsDate ??
    p?.value?.bsDate ??
    p?.date?.bsDate ??
    p?.bs ??
    p?.detail?.bs ??
    "";

  if (typeof v === "string") return v.trim();

  const y = v?.year ?? v?.y;
  const m = v?.month ?? v?.m;
  const d = v?.date ?? v?.day ?? v?.d;

  if (y && m && d) return `${y}-${pad2(m)}-${pad2(d)}`.trim();
  return "";
}

function normalizeAd(p: any): string {
  const v =
    p?.adDate ??
    p?.detail?.adDate ??
    p?.value?.adDate ??
    p?.date?.adDate ??
    p?.ad ??
    p?.detail?.ad ??
    "";

  if (typeof v === "string") return v.trim();

  const y = v?.year ?? v?.y;
  const m = v?.month ?? v?.m;
  const d = v?.date ?? v?.day ?? v?.d;

  if (y && m && d) return `${y}-${pad2(m)}-${pad2(d)}`.trim();
  return "";
}

/**
 * ✅ IMPORTANT:
 * This datepicker most reliably prefills with { year, month, date } (not day).
 * If no valid BS date, we must NOT pass "value" at all — otherwise it shows today's date.
 */
function bsStringToObj(bs?: string) {
  if (!bs) return null;

  const s = bs.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const date = Number(m[3]);

  // ✅ prevent NaN error
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(date)) return null;
  if (year <= 0 || month <= 0 || date <= 0) return null;

  // ✅ best-supported shape
  return { year, month, date };
}

export function NepaliDateInput({
  valueBs,
  onChangeAd,
  placeholder,
  className,
}: NepaliDateInputProps) {
  const parsed = React.useMemo(() => bsStringToObj(valueBs), [valueBs]);

  const handleChange = (payload: any) => {
    const bsDate = normalizeBs(payload);
    const adDate = normalizeAd(payload);

    if (!bsDate) return;
    onChangeAd(adDate, bsDate);
  };

  return (
    <div className={cn("np-date relative w-full", className)}>
      <Calendar
        // ✅ if parsed exists => prefill that exact date
        // ✅ if parsed missing => DON'T pass value, and hide default (prevents today's date)
        {...(parsed ? { value: parsed, hideDefaultValue: false } : { hideDefaultValue: true })}

        onChange={handleChange}
        language="ne"
        dateFormat="YYYY-MM-DD"
        placeholder={placeholder ?? "Select date"}
        theme="default"
        className={cn(
          "h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-colors"
        )}
        style={{ width: "100%" }}
      />
    </div>
  );
}

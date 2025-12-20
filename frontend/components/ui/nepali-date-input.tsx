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

// ✅ payload बाट BS date string "YYYY-MM-DD" निकाल्ने (string / object / nested payload सबै handle)
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

  // object case: { year, month, day }
  const y = v?.year ?? v?.y;
  const m = v?.month ?? v?.m;
  const d = v?.day ?? v?.d;

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
  const d = v?.day ?? v?.d;

  if (y && m && d) return `${y}-${pad2(m)}-${pad2(d)}`.trim();
  return "";
}

export function NepaliDateInput({
  valueAd,
  valueBs,
  onChangeAd,
  placeholder,
  className,
}: NepaliDateInputProps) {
  // ✅ Remount ONLY when cleared, not on every selection
  const [resetKey, setResetKey] = React.useState(0);
  const wasEmptyRef = React.useRef(true);

  React.useEffect(() => {
    const isEmpty = !(valueBs && valueBs.trim());

    if (!isEmpty && wasEmptyRef.current) {
      wasEmptyRef.current = false;
    }
    if (isEmpty && !wasEmptyRef.current) {
      setResetKey((k) => k + 1);
      wasEmptyRef.current = true;
    }

    if (isEmpty) wasEmptyRef.current = true;
  }, [valueBs]);

  const handleChange = (payload: any) => {
    const bsDate = normalizeBs(payload);
    const adDate = normalizeAd(payload);

    // ✅ BS date नै required (period derive गर्न)
    if (!bsDate) return;

    onChangeAd(adDate, bsDate);
  };

  return (
    <div className={cn("np-date relative w-full", className)}>
      <Calendar
        key={`np-${resetKey}`}
        className={cn(
          "w-full h-11 rounded-xl border border-input bg-background px-3 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "transition-colors"
        )}
        style={{ width: "100%" }}
        language="ne"
        dateFormat="YYYY-MM-DD"
        placeholder={placeholder ?? "मिति छान्नुहोस्"}
        onChange={handleChange}
        theme="default"
        hideDefaultValue={true}
        value={valueBs || ""}
      />
    </div>
  );
}
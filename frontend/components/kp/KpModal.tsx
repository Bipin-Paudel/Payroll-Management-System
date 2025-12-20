"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type KpModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;

  /**
   * If you're opening a modal from inside another modal,
   * set topLayer={true} to ensure it is always above.
   */
  topLayer?: boolean;

  /** Optional width presets */
  maxWidth?: "md" | "lg" | "xl";
};

const widthMap: Record<NonNullable<KpModalProps["maxWidth"]>, string> = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export default function KpModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  topLayer = false,
  maxWidth = "lg",
}: KpModalProps) {
  // lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // esc close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof window === "undefined") return null;

  const overlayClass = topLayer
    ? "kp-modal-overlay kp-modal-overlay--top"
    : "kp-modal-overlay";
  const wrapClass = topLayer ? "kp-modal-wrap kp-modal-wrap--top" : "kp-modal-wrap";

  return createPortal(
    <>
      <div className={overlayClass} onClick={onClose} />
      <div className={wrapClass}>
        <div className={`kp-modal-panel ${widthMap[maxWidth]}`}>
          <div className="kp-modal-header">
            <div>
              <div className="text-base font-semibold text-slate-900">{title}</div>
              {subtitle ? (
                <div className="text-sm text-slate-600 mt-0.5">{subtitle}</div>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="kp-modal-body">{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
}

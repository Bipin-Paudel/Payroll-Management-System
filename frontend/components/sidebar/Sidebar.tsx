"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLayout } from "@/context/LayoutContext";

import {
  LayoutDashboard,
  CalendarCheck,
  FileSpreadsheet,
  NotebookPen,
  ReceiptText,
  Settings as SettingsIcon,
  Users,
  Building2,
  CreditCard,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type SimpleLink = {
  title: string;
  icon: any;
  path: string;
};

type GroupItem = {
  title: string;
  icon: any;
  path: string;
};

type Group = {
  title: string;
  icon: any;
  key: string;
  items: GroupItem[];
};

const topLinks: SimpleLink[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }, // ✅ added first
  { title: "Attendance", icon: CalendarCheck, path: "/attendance" },
  { title: "Monthly Salary", icon: FileSpreadsheet, path: "/salary" },
  { title: "Accounting Journal", icon: NotebookPen, path: "/journal" },
  { title: "Payable Report", icon: ReceiptText, path: "/payables/report" },
];

const groups: Group[] = [
  {
    title: "Settings",
    icon: SettingsIcon,
    key: "settings",
    items: [
      { title: "Employee Records", icon: Users, path: "/settings/employees-records" },
      { title: "Company Setup", icon: Building2, path: "/company/setup" },
      { title: "Payment Methods", icon: CreditCard, path: "/settings/payment-methods" },
      { title: "Departments", icon: Layers, path: "/settings/departments" },
      { title: "Roles", icon: ShieldCheck, path: "/settings/roles" },
    ],
  },
];

function isActivePath(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function Sidebar() {
  const { sidebarOpen } = useLayout();
  const pathname = usePathname();

  // Auto-open Settings if any settings route is active
  const settingsHasActive = useMemo(
    () => groups[0].items.some((i) => isActivePath(pathname, i.path)),
    [pathname]
  );

  const [openGroup, setOpenGroup] = useState<string | null>(
    settingsHasActive ? "settings" : null
  );

  useEffect(() => {
    if (settingsHasActive) setOpenGroup("settings");
  }, [settingsHasActive]);

  if (!sidebarOpen) return null;

  const toggleGroup = (key: string) =>
    setOpenGroup((prev) => (prev === key ? null : key));

  return (
    <div className="h-full w-full bg-white text-gray-800 flex flex-col">
      {/* Optional top brand block (same vibe as old: clean, small) */}

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-4 py-3">
          <ul className="space-y-2">
            {/* Top links (Dashboard + main) */}
            {topLinks.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.path);

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-[15px] rounded-xl transition-all duration-300 ease-out",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "hover:bg-gray-100 text-gray-800"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "text-gray-700 transition-colors duration-300 ease-out",
                        active && "text-white"
                      )}
                    />
                    {item.title}
                  </Link>
                </li>
              );
            })}


            {/* Groups (Settings) — styled like old sidebar (expand/collapse + left border) */}
            {groups.map((g) => {
              const GroupIcon = g.icon;

              const parentActive = g.items.some((i) => isActivePath(pathname, i.path));
              const isOpen = openGroup === g.key;

              return (
                <li key={g.key}>
                  {/* Parent button */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.key)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-[15px] font-medium rounded-xl transition-all duration-300 ease-out",
                      parentActive && "bg-blue-50 text-blue-700 border border-blue-100",
                      !parentActive && isOpen && "bg-gray-100",
                      !parentActive && !isOpen && "hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon
                        size={18}
                        className={cn(
                          "text-gray-700 transition-colors duration-300 ease-out",
                          parentActive && "text-blue-700"
                        )}
                      />
                      {g.title}
                    </div>

                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-300 ease-out",
                        isOpen && "rotate-180",
                        parentActive && "text-blue-700"
                      )}
                    />
                  </button>

                  {/* Children wrapper */}
                  <div
                    className={cn(
                      "ml-4 border-l border-gray-200 mt-1 overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen
                        ? "max-h-150 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
                    )}
                  >
                    <div className="mt-2 ml-4">
                      <ul className="space-y-1">
                        {g.items.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isActivePath(pathname, child.path);

                          return (
                            <li key={child.path}>
                              <Link
                                href={child.path}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-300 ease-out",
                                  active
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                              >
                                <ChildIcon
                                  size={15}
                                  className={cn(
                                    "text-gray-500 transition-colors duration-300 ease-out",
                                    active && "text-white"
                                  )}
                                />

                                {/* same tiny bar indicator style as old */}
                                <span
                                  className={cn(
                                    "w-1 h-4 rounded-sm transition-all duration-300 ease-out",
                                    active ? "bg-white/80" : "bg-blue-500/70"
                                  )}
                                />

                                <span className="font-medium">{child.title}</span>

                                <ChevronRight
                                  size={14}
                                  className={cn(
                                    "ml-auto opacity-40",
                                    active && "opacity-70 text-white"
                                  )}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>

      {/* <div className="border-t px-4 py-3 text-xs text-gray-500">
        © {new Date().getFullYear()} Payroll
      </div> */}
    </div>
  );
}

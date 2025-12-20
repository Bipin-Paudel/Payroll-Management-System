"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Menu,
  ShoppingCart,
  DollarSign,
  Receipt,
  CreditCard,
  Building2,
  Wallet,
  FileMinus2,
  FilePlus2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLayout } from "@/context/LayoutContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Quick transaction links


export default function Header() {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { logout } = useAuth();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  const actionButtonBase =
    "h-10 px-5 rounded-xl font-medium transition-all duration-200 ease-out";
  const hoverLift = "hover:-translate-y-px hover:shadow-sm";

  const handleFeatureClick = (href: string) => {
    setAddOpen(false);
    router.push(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "flex items-center justify-between",
        "h-16 bg-white border-b border-gray-100 shadow-sm",
        "px-4 md:px-6"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "rounded-full text-gray-700 hover:text-blue-600",
            "transition-all duration-200 ease-out",
            sidebarOpen && "bg-blue-50 text-blue-700"
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/dashboard" className="leading-none">
          <h1 className="text-lg md:text-xl font-semibold text-blue-800">
            Payroll System
          </h1>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className={cn(
              "w-95 p-4 rounded-2xl border border-gray-200 bg-white shadow-lg"
            )}
          >
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800">
                Quick transaction
              </p>
              <p className="text-xs text-gray-500">
                Choose what you want to record
              </p>
            </div>

            
          </PopoverContent>
        </Popover>

        <Button
          onClick={logout}
          className={cn(
            actionButtonBase,
            hoverLift,
            "bg-red-600 text-white hover:bg-red-700"
          )}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}

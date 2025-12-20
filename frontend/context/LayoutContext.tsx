"use client";

import { createContext, useContext, useState } from "react";

type LayoutContextType = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <LayoutContext.Provider
      value={{ sidebarOpen, toggleSidebar, searchTerm, setSearchTerm }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside LayoutProvider");
  return ctx;
};

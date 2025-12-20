"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAccessToken } from "@/lib/auth";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) router.replace("/login");
  }, [router]);
}

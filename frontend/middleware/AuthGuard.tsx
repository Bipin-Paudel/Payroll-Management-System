"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAccessToken } from "@/lib/token";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) router.replace("/login");
  }, [router]);
}

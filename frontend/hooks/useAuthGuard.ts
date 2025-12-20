"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) router.push("/login");
  }, [router]);
}
"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function RedirectToast() {
  const router = useRouter();

  const params = useSearchParams();

  useEffect(() => {
    if (params.get("redirected") == "true") {
      toast.error("You do not have access to this page.", {
        style: { background: "#581c87", color: "#fff" },
      });
      router.replace("/profile");
    }
  }, [params]);

  return <Toaster />;
}

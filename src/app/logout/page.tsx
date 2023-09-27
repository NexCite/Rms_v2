"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";

export default function Page() {
  const [_, setCookies, removeCookies] = useCookies([
    "rms-auth",
    "rms-permissions",
  ]);
  const { replace } = useRouter();
  useEffect(() => {
    removeCookies("rms-auth");
    removeCookies("rms-permissions");
    replace("/login");
  }, [replace, setCookies]);
  return <div>logout...</div>;
}

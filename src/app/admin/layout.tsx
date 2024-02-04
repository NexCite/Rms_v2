import { findAuth } from "@nexcite/service/AuthService";
import { Metadata } from "next";
import { headers } from "next/headers";
import React from "react";
import Template from "./template";
export async function generateMetadata({ params }: any): Promise<Metadata> {
  var { config } = await findAuth();
  const url = new URL(headers()?.get("url") ?? "");
  url.pathname = `/api/media/${config?.logo}`;
  return {
    title: config?.name,
    icons: [url],
  };
}
export default async function layout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}

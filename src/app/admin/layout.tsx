import { findAuth } from "@nexcite/service/AuthService";
import { Metadata } from "next";
import React from "react";
export async function generateMetadata({ params }: any): Promise<Metadata> {
  var { config } = await findAuth();

  return {
    title: config?.name,
    icons: `/api/media/${config.logo}`,
  };
}
export default async function layout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
export const dynamic = "force-dynamic";

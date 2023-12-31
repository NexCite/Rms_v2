import route from "@rms/assets/route";
import AppBarDesktop from "@rms/components/layout/app-bar-desktop";
import SideBarDesktop from "@rms/components/layout/side-bar-desktop";
import getUserFullInfo, { userAuth } from "@rms/service/user-service";
import { Metadata } from "next";
import { headers } from "next/headers";

import React from "react";

export async function generateMetadata({ params }): Promise<Metadata> {
  var { config } = await getUserFullInfo();

  const url = new URL(headers().get("url"));
  url.pathname = `/api/media/${config.logo}`;
  return {
    title: config.name,
    icons: [url],
  };
}

export default async function layout(props: { children: React.ReactNode }) {
  var info = await getUserFullInfo();
  const url = new URL(headers().get("url"));
  const segments = url.pathname.split("/").filter((res) => res !== "");
  const currentRoute = route.find((res) => segments.includes(res.routeKey));
  const user = await userAuth();

  return (
    <div>
      <div className="h-screen w-screen flex gap-0 static">
        <SideBarDesktop {...user} path={url.pathname} />
        <div className="overflow-auto w-full max-h-full flex gap-5 flex-col">
          <AppBarDesktop {...user} />
          <div className="p-5 ">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

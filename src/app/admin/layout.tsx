import AppBarDesktop from "@rms/components/layout/app-bar-desktop";
import MenuIconSideNav from "@rms/components/layout/menu-bar";
import { userAuth } from "@rms/service/auth-service";
import LoadStore from "@rms/store/LoadStore";
import appStore from "@rms/store/app-store";
import { store } from "@rms/store/store";
import { Metadata } from "next";
import { headers } from "next/headers";
import React, { useEffect } from "react";
import { Provider } from "react-redux";

export async function generateMetadata({ params }): Promise<Metadata> {
  var { config } = await userAuth();

  const url = new URL(headers().get("url"));
  url.pathname = `/api/media/${config.logo}`;
  return {
    title: config.name,
    icons: [url],
  };
}

export default async function layout(props: { children: React.ReactNode }) {
  const url = new URL(headers().get("url"));
  const user = await userAuth();
  return (
    <div key={user.id}>
      <div className="h-screen w-screen flex gap-0">
        <MenuIconSideNav user={user} path={url.pathname} />
        <div className="overflow-auto w-full max-h-full flex gap-5 flex-col">
          <AppBarDesktop {...user} />
          <div className="px-8 py-2 ">
            <LoadStore>{props.children}</LoadStore>
          </div>
        </div>
      </div>
    </div>
  );
}

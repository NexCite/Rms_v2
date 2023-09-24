import { GlobalStyle } from "@rms/components/theme/global-style";
import GetRoutes from "@rms/config/route-config";
import { getUserInfo } from "@rms/lib/auth";
import { setPermissions } from "@rms/lib/permissions";
import prisma from "@rms/prisma/prisma";
import HeaderWidget from "@rms/widgets/layout/header-widget";
import { cookies } from "next/headers";
import React from "react";

export default async function layout(props: { children: React.ReactNode }) {
  const config = await prisma.config.findFirst({
    select: { logo: true, name: true },
  });
  const user = await getUserInfo();
  setPermissions(user.permissions);

  return (
    <HeaderWidget config={config!} route={GetRoutes(user?.permissions!)}>
      {props.children}
    </HeaderWidget>
  );
}

import { GlobalStyle } from "@rms/components/theme/global-style";
import GetRoutes from "@rms/config/route-config";
import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import HeaderWidget from "@rms/widgets/layout/header-widget";
import React from "react";

export default async function layout(props: { children: React.ReactNode }) {
  const config = await prisma.config.findFirst({
    select: { logo: true, name: true },
  });
  const user = await getUserInfo();
  return (
    <HeaderWidget config={config!} route={GetRoutes(user?.permissions!)}>
      {props.children}
    </HeaderWidget>
  );
}

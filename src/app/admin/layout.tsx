import Layout from "@rms/components/layout/layout";
import GetRoutes from "@rms/config/route-config";
import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import { createLog } from "@rms/service/log-service";
import { headers } from "next/headers";

import React from "react";

export default async function layout(props: { children: React.ReactNode }) {
  const config = await prisma.config.findFirst({
    select: { logo: true, name: true },
  });
  const user = await getUserInfo();

  return (
    <Layout config={config!} route={GetRoutes(user?.permissions!)}>
      {props.children}
    </Layout>
  );
}

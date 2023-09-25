import GetRoutes from "@rms/config/route-config";
import { getUserInfo } from "@rms/lib/auth";
import { setPermissions } from "@rms/lib/permissions";
import prisma from "@rms/prisma/prisma";
import Layout from "@rms/widgets/layout/layout";

import React from "react";

export default async function layout(props: { children: React.ReactNode }) {
  const config = await prisma.config.findFirst({
    select: { logo: true, name: true },
  });
  const user = await getUserInfo();
  setPermissions(user.permissions);

  return (
    <Layout config={config!} route={GetRoutes(user?.permissions!)}>
      {props.children}
    </Layout>
  );
}

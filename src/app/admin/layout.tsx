import Layout from "@rms/components/layout/layout";
import GetRoutes from "@rms/config/route-config";
import { getUserInfo } from "@rms/lib/auth";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";

import React from "react";

export default async function layout(props: { children: React.ReactNode }) {
  const config_id = await getConfigId();

  const config = await prisma.config.findFirst({
    where: { id: config_id },
    select: { logo: true, name: true },
  });
  const user = await getUserInfo();

  return (
    <div>
      <Layout config={config!} route={GetRoutes(user?.permissions!)}>
        {props.children}
      </Layout>
    </div>
  );
}

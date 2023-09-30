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
  const urlHeader = headers().get("url");
  const url = new URL(urlHeader);

  console.log(Date.now(), url.pathname);
  await createLog({
    action: "View",
    page: url.toString(),
    user_id: user.id,
    body: JSON.stringify({}),
  });

  return (
    <Layout config={config!} route={GetRoutes(user?.permissions!)}>
      {props.children}
    </Layout>
  );
}

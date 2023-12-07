import LayoutV2 from "@rms/components/layout/v2/layout";
import getUserFullInfo from "@rms/service/user-service";
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
  return <LayoutV2>{props.children}</LayoutV2>;
}

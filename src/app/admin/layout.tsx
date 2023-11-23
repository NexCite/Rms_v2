import LayoutV2 from "@rms/components/layout/v2/layout";

import React from "react";

export default async function layout(props: { children: React.ReactNode }) {
  return <LayoutV2>{props.children}</LayoutV2>;
}
{
  /* <Layout config={config!} route={GetRoutes(user?.permissions!)}>
        {props.children}
      </Layout> */
}

import React, { Suspense } from "react";
import SideBarV2 from "./side-bar";
import AppBarV2 from "./app-bar";

import getUserFullInfo from "@rms/service/user-service";
import Loading from "@rms/components/ui/loading";

type Props = {
  children: React.ReactNode;
};

export default async function LayoutV2(props: Props) {
  const userInfo = await getUserFullInfo();

  return (
    <div className="flex md:flex-row bg-[#f3f3f3]  max-h-full ">
      <Suspense fallback={<Loading />}>
        <SideBarV2 routes={userInfo.routes} config={userInfo.config} />

        <div id="app-main" className="max-h-screen overflow-auto w-full h-full">
          <div className="  px-0  md:px-5   h-full ">
            <AppBarV2 config={userInfo.config} routes={userInfo.routes}>
              {props.children}
            </AppBarV2>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
const WrapperComponent: React.FC<any> = ({ children, props }) => {
  // Clone the child element with new props
  const enhancedChild = React.cloneElement(children, { props });

  return <>{enhancedChild}</>;
};

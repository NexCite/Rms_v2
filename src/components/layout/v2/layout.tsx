import React from "react";
import SideBarV2 from "./side-bar";
import AppBarV2 from "./app-bar";

import getUserFullInfo from "@rms/service/user-service";
import Script from "next/script";

type Props = {
  children: React.ReactNode;
};

export default async function LayoutV2(props: Props) {
  const userInfo = await getUserFullInfo();
  return (
    <div id="layout-app">
      <div className="side-bar mobile-drawer">
        <SideBarV2 routes={userInfo.routes} config={userInfo.config} />
      </div>

      <div id="app-main">
        <div id="app-bar">
          <AppBarV2 config={userInfo.config} routes={userInfo.routes} />
        </div>
        <div id="main">{props.children}</div>
      </div>
      <Script id="drawer-body-click">
        {`
        var indexDrawer=0;
document.getElementById("app-main").onclick=()=>{
  var bar = document.querySelector(".side-bar");
  if (bar.classList.contains("show-drawer") && indexDrawer===1) {
    bar.classList.remove("show-drawer");
    indexDrawer=0;
  }else{
    indexDrawer++

  }

}`}
      </Script>
    </div>
  );
}

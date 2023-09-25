"use client";
import React, { useMemo } from "react";
import { Sidebar } from "./side-bar";
import RouteModel from "@rms/models/RouteModel";
import { usePathname } from "next/navigation";
import LoadingButton from "@rms/components/ui/loading-button";
import Authorized from "@rms/components/ui/authorized";
import { $Enums } from "@prisma/client";
type Props = {
  children: React.ReactNode;
  routes: RouteModel[];
  config: {
    logo: string;
    name: string;
  };
};
export default function AppBar(props: Props) {
  var path = usePathname();
  const { subRouteTitle, permission } = useMemo(() => {
    const f = props.routes.filter((res) =>
      res.children.find((res) => path.startsWith(res.path))
    );

    var { children } = f[0] ?? { children: [] };
    var permission: $Enums.UserPermission;
    var subRouteTitle = undefined;
    children.forEach((res) => {
      if (path === res.path) {
        permission = res.addKey;
        subRouteTitle = res.title;
      }
    });

    return { subRouteTitle, permission };
  }, [props.routes]);

  return (
    <>
      <aside
        id="cta-button-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full border border-gray-200  overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <Sidebar config={props.config} routers={props.routes} />
        </div>
      </aside>

      <div className="    sm:ml-64 flex flex-col ">
        {subRouteTitle && (
          <div className="flex justify-between items-center  border dark:border-gray-700  mb-10  p-3">
            <h1 className="text-3xl">{subRouteTitle}</h1>

            <Authorized permission={permission}>
              <LoadingButton type="link" label="Add" link={path + "/form"} />
            </Authorized>
          </div>
        )}{" "}
        {subRouteTitle && (
          <div className=" m-5 dark:border-gray-700  border overflow-y-auto h-[97vh] rounded-lg">
            <div className="p-4   rounded-lg dark:border-gray-700  mb-10">
              {props.children}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

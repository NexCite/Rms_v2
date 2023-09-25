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
  const { title, permission } = useMemo(() => {
    const f = props.routes.filter((res) =>
      res.children.find((res) => path.startsWith(res.path))
    );

    var { title, children } = f[0] ?? { title: "", children: [] };
    var permission: $Enums.UserPermission;
    children.forEach((res) => {
      if (path === res.path) {
        permission = res.addKey;
      }
    });
    permission = permission ?? ("" as any);
    title = title ?? "";
    return { title, permission };
  }, [path, props.routes]);

  return (
    <>
      <aside
        id="cta-button-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full border-2 border-gray-200  overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <Sidebar config={props.config} routers={props.routes} />
        </div>
      </aside>

      <div className="  dark:border-gray-700  p-5 sm:ml-64 flex flex-col ">
        <div className="flex justify-between items-center rounded-lg border dark:border-gray-700  mb-10  p-3">
          <h1 className="text-3xl">{title}</h1>

          <Authorized permission={permission}>
            <LoadingButton type="link" label="Add" link={path + "/form"} />
          </Authorized>
        </div>
        <div className="  dark:border-gray-700  border overflow-y-auto h-[97vh] rounded-lg">
          <div className="p-4   rounded-lg dark:border-gray-700  mb-10">
            {props.children}
          </div>
        </div>
      </div>
    </>
  );
}

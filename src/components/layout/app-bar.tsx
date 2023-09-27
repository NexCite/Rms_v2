"use client";
import React, { Suspense, useMemo } from "react";
import { Sidebar } from "./side-bar";
import RouteModel from "@rms/models/RouteModel";
import { usePathname, useRouter } from "next/navigation";
import Authorized from "@rms/components/ui/authorized";
import { $Enums } from "@prisma/client";
import BackButton from "../ui/back-button";
import { Button } from "@material-tailwind/react";
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
    const routes = props.routes.find((res) =>
      res.children.find((res) => path.startsWith(res.path))
    );

    var permission: $Enums.UserPermission;
    var subRouteTitle = undefined;
    if (path.includes("/form")) {
      permission = routes?.key;
      subRouteTitle = routes?.title;
    } else {
      routes?.children?.forEach((res) => {
        if (path.startsWith(res.path)) {
          permission = res.addKey;
          subRouteTitle = res.title;
        }
      });
    }

    return { subRouteTitle, permission };
  }, [props.routes, path]);
  const canGoBack = useMemo(() => {
    const splitPath = path.split("/");
    return (
      path !== "/admin" &&
      (splitPath.length > 5 ||
        path.includes("form") ||
        Number.isInteger(parseInt(splitPath[splitPath.length - 1])))
    );
  }, [path]);
  const { push } = useRouter();

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
            <div className="flex items-center gap-4">
              {canGoBack && <BackButton />}
              <h1 className="text-3xl">{subRouteTitle}</h1>
            </div>

            {!path.includes("form") && (
              <Authorized permission={permission}>
                <Button type="button" onClick={() => push(path + "/form")}>
                  Add
                </Button>
              </Authorized>
            )}
          </div>
        )}
        {subRouteTitle && (
          <div className=" m-2 dark:border-gray-700  border overflow-y-auto h-[97vh] rounded-lg">
            <div className="p-4   rounded-lg dark:border-gray-700  mb-10">
              {props.children}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

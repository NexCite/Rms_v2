"use client";
import { Button, IconButton } from "@mui/material";
import { $Enums } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import RouteModel from "@rms/models/RouteModel";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import AppConfig from "../../../../app-config.json";

import { MenuIcon } from "lucide-react";
import BackButton from "@rms/components/ui/back-button";
type Props = {
  routes: RouteModel[];
  config: {
    logo: string;
    name: string;
  };
};
export default function AppBarV2(props: Props) {
  var path = usePathname();
  const [show, setShow] = useState(true);

  const { subRouteTitle, permission } = useMemo(() => {
    const routes = props.routes.find((res) =>
      res.children.find((res) => path.startsWith(res.path))
    );

    var permission: $Enums.UserPermission | "None";
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

  return (
    <>
      <div className={`  w-full  `}>
        {subRouteTitle && (
          <div className="flex justify-between items-center  border dark:border-gray-700 p-3 static">
            <div className="flex items-center gap-4 justify-start">
              <div
                className="mobile-darwer"
                onClick={(e) => {
                  var bar = document.querySelector(".side-bar");
                  if (bar.classList.contains("show-drawer")) {
                    bar.classList.remove("show-drawer");
                  } else {
                    bar.classList.add("show-drawer");
                  }
                }}
              >
                {
                  <IconButton onClick={(e) => setShow(!show)}>
                    <MenuIcon />
                  </IconButton>
                }
              </div>
              {canGoBack && <BackButton />}
            </div>

            {AppConfig.ignore.add_app_bar.filter((res) => {
              var reg = new RegExp(res);

              return reg.test(path);
            }).length === 0 && (
              <Authorized permission={permission}>
                <Link href={path + "/form"}>
                  <Button
                    variant="contained"
                    disableElevation
                    className={
                      "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
                    }
                    type="button"
                  >
                    Add
                  </Button>
                </Link>
              </Authorized>
            )}
          </div>
        )}
      </div>
    </>
  );
}

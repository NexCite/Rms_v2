"use client";
import { Button, IconButton, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import RouteModel from "@rms/models/RouteModel";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import React, { ReactElement, ReactNode, useMemo, useState } from "react";

import route from "@rms/assets/route";
import BackButton from "@rms/components/ui/back-button";
import useDrawerController from "@rms/hooks/drawer-hook";
import { Next13ProgressBar } from "next13-progressbar";
import { MdAdd, MdMenu } from "react-icons/md";
type Props = {
  routes: RouteModel[];
  config: {
    logo: string;
    name: string;
  };
  children?: React.ReactNode;
};
export default function AppBarV2(props: Props) {
  var pathName = usePathname();
  const [show, setShow] = useState(true);
  const segments = useSelectedLayoutSegments();
  const historyStore = useDrawerController();

  const { currentRoute } = useMemo(() => {
    const routeChidlren: RouteModel[] = [];
    route.forEach((e) => {
      e.children?.forEach((e) => {
        routeChidlren.push(e);
      });
    });

    const currentRoute = routeChidlren.find((res) => {
      var path = res.path
        .split("/")
        .filter((e) => e.length > 2)
        .slice(1);

      return path.toLocaleString() === segments.toLocaleString();
    });

    return { currentRoute };
  }, [route, segments]);

  return (
    <div className="   bg-white   rounded-md my-5 border h-full  ">
      <div
        className={`w-full    p-0 flex flex-col gap-5  rounded-t-md  bg-white z-20  `}
      >
        <Next13ProgressBar
          height="2px"
          color="#1176c8"
          options={{ showSpinner: false }}
          showOnShallow
        />
        <div className="p-5">
          <div className="flex justify-between items-center     h-full ">
            <div className="flex items-center gap-4 justify-start">
              <div className="md:hidden">
                {
                  <IconButton
                    onClick={(e) => {
                      setShow(!show);

                      historyStore.set(true);
                    }}
                  >
                    <MdMenu />
                  </IconButton>
                }
              </div>
              {!currentRoute && segments.length > 0 && <BackButton />}
              <Typography variant="h5">{currentRoute?.title}</Typography>
            </div>

            <Authorized permission={currentRoute?.addKey}>
              <Link href={pathName + "/form"}>
                <Button
                  className="px-2 border-dashed border w-[140px] rounded-xl"
                  disableElevation
                  startIcon={<MdAdd />}
                  variant="text"
                >
                  Create
                </Button>
              </Link>
            </Authorized>
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
}

"use client";
import { UserAuth, UserFullInfoType } from "@rms/service/user-service";
import React, { useMemo } from "react";
import Authorized from "../other/authorized";
import Link from "next/link";

import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import NexCiteButton from "../button/nexcite-button";
import Typography from "@mui/joy/Typography";
import BackButton from "../button/back-button";
import route from "@rms/assets/route";

export default function AppBarDesktop(props: UserAuth) {
  const path = usePathname();
  const segments = useSelectedLayoutSegments();
  const isRouteEndNumber = useMemo(
    () => !Number.isNaN(parseInt(segments[segments.length - 1])),
    [segments]
  );
  const routers = useMemo(
    () =>
      route.map((res) => {
        res.children = res.children.filter((res) => !res.hide);
        return res;
      }),
    []
  );
  const currentRoute = useMemo(
    () =>
      routers
        .find((res) => segments.includes(res.routeKey))
        ?.children.find((res) => segments.includes(res.routeKey)),
    [routers, segments]
  );

  return (
    currentRoute && (
      <div className="w-full border p-3 flex justify-between  items-center sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-1">
          {segments.length > 2 && <BackButton />}

          <Typography fontSize={22}>{currentRoute?.title}</Typography>
        </div>
        {!segments.includes("form") && !isRouteEndNumber && (
          <Authorized permission={currentRoute?.addKey}>
            <Link href={path + "/form"}>
              <NexCiteButton className="px-2  border w-[140px]  rounded-md ">
                Create
              </NexCiteButton>
            </Link>
          </Authorized>
        )}
      </div>
    )
  );
}
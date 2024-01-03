"use client";
import { UserFullInfoType } from "@rms/service/user-service";
import React, { useMemo } from "react";
import Authorized from "../ui/authorized";
import Link from "next/link";

import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import NexCiteButton from "../button/nexcite-button";
import Typography from "@mui/joy/Typography";
import BackButton from "../ui/back-button";

export default function AppBarDesktop(props: UserFullInfoType) {
  const path = usePathname();
  const segments = useSelectedLayoutSegments();
  const routers = useMemo(
    () =>
      props.routes.map((res) => {
        res.children = res.children.filter((res) => !res.hide);
        return res;
      }),
    props.routes
  );
  const currentRoute = useMemo(
    () =>
      routers
        .find((res) => segments.includes(res.routeKey))
        ?.children.find((res) => segments.includes(res.routeKey)),
    [segments]
  );

  return (
    <div className="w-full border p-5 flex justify-between  items-center sticky top-0 z-10 bg-white">
      <div className="flex items-center gap-1">
        {segments.length > 2 && <BackButton />}

        <Typography fontSize={25}>{currentRoute?.title}</Typography>
      </div>
      {!segments.includes("form") && (
        <Authorized permission={currentRoute?.addKey}>
          <Link href={path + "/form"}>
            <NexCiteButton className="px-2  border w-[140px]  rounded-md ">
              Create
            </NexCiteButton>
          </Link>
        </Authorized>
      )}
    </div>
  );
}

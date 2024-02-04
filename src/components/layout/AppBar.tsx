"use client";

import Add from "@mui/icons-material/Add";
import { Button, Card, Stack, Typography } from "@mui/joy";
import IAuth from "@nexcite/Interfaces/IAuth";
import route from "@nexcite/routes";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";
import BackButton from "../button/back-button";
import Authorized from "../other/authorized";

export default function AppBar(props: IAuth) {
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
    <Card
      sx={{
        borderRadius: 0,
        position: "sticky",
        top: 0,
        zIndex: 8,
        borderLeft: 0,
      }}
    >
      <Stack justifyContent={"space-between"} direction={"row"}>
        <Stack direction={"row"} alignItems={"center"}>
          {segments.length > 2 ? <BackButton /> : <div></div>}
          <Typography level="h3">{currentRoute?.title}</Typography>
        </Stack>
        {!segments.includes("form") && !isRouteEndNumber && (
          <Authorized permission={currentRoute?.addKey}>
            <Link href={path + "/form"}>
              <Button variant="outlined" startDecorator={<Add />}>
                Create
              </Button>
            </Link>
          </Authorized>
        )}
      </Stack>
    </Card>
  );
}

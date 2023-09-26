"use client";
import { $Enums } from "@prisma/client";
import React from "react";
import { useCookies } from "react-cookie";

type Props = {
  permission: $Enums.UserPermission;
  children: React.ReactNode;
};

export default function Authorized(props: Props) {
  const [cookies] = useCookies(["rms-permissions"]);

  return cookies["rms-permissions"]?.includes(props.permission) ? (
    <div>{props.children}</div>
  ) : (
    <></>
  );
}

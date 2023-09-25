"use client";
import { $Enums } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  permission: $Enums.UserPermission;
  children: React.ReactNode;
};
import { useCookies } from "react-cookie";

export default function Authorized(props: Props) {
  const [cookies] = useCookies(["rms-permissions"]);

  return cookies["rms-permissions"]?.includes(props.permission) ? (
    props.children
  ) : (
    <div></div>
  );
}

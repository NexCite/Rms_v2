"use client";
import { $Enums } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";

type Props = {
  permission: $Enums.UserPermission | "None";
  children?: React.ReactNode;
  className?: string;
};
var init = false;
export default function Authorized(props: Props) {
  const [cookies] = useCookies(["rms-permissions"]);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(cookies["rms-permissions"]?.includes(props.permission));
  }, [cookies, props.permission]);

  return show ? <div className={props.className}>{props.children}</div> : <></>;
}
export function useAuthorized(permissions: ($Enums.UserPermission | "None")[]) {
  const [cookies] = useCookies(["rms-permissions"]);
  const [isAuthorized, setIsAuthorized] = useState<{
    [k in (typeof permissions)[number]]?: boolean;
  }>({});

  useEffect(() => {
    const temp: { [k in (typeof permissions)[number]]?: boolean } = {};
    permissions.forEach((res) => {
      temp[res] = cookies["rms-permissions"]?.includes(res);
    });
    setIsAuthorized(temp);
  }, [cookies, permissions]);
  return isAuthorized;
}

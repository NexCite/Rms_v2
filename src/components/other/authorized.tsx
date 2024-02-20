"use client";
import { useUserStore } from "@nexcite/store/UserStore";
import { $Enums } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

type Props = {
  permission: $Enums.UserPermission | "None";
  children?: React.ReactNode;
  className?: string;
};

export default function Authorized(props: Props) {
  const userStore = useUserStore();
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(
      userStore
        .getUserStore()
        ?.role?.permissions.includes(props.permission as any)
    );
  }, [props.permission, userStore]);

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

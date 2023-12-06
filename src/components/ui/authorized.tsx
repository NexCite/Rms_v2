"use client";
import { $Enums } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

type Props = {
  permission: $Enums.UserPermission | "None";
  children: React.ReactNode;
  className?: string;
};

export default function Authorized(props: Props) {
  const [cookies] = useCookies(["rms-permissions"]);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(cookies["rms-permissions"]?.includes(props.permission));
  }, [cookies, props.permission]);

  return show ? <div className={props.className}>{props.children}</div> : <></>;
}

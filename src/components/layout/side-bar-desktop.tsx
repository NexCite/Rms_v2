"use client";
import CalculateIcon from "@mui/icons-material/CalculateRounded";
import PaymentsIcon from "@mui/icons-material/PaymentsRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import ReceiptIcon from "@mui/icons-material/ReceiptRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import { UserAuth } from "@rms/service/user-service";
import Image from "next/image";
import React, { useMemo } from "react";

import LogOutIcon from "@mui/icons-material/Logout";
import { IconButton } from "@mui/joy";
import Divider from "@mui/joy/Divider";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import Tabs from "@mui/joy/Tabs";
import Typography from "@mui/joy/Typography";
import route from "@rms/routes";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

export default function SideBarDesktop(props: {
  user: UserAuth;
  path: string;
}) {
  const segments = useSelectedLayoutSegments();

  const userRoutes = useMemo(
    () =>
      route
        .filter((res) => props.user.role.permissions.includes(res.permission))
        .map((res) => {
          res.children = res.children.filter((res) =>
            props.user.role.permissions.includes(res.permission)
          );
          return res;
        }),
    [props.user.role.permissions]
  );
  const tab = useMemo(
    () =>
      userRoutes.find(
        (res) =>
          segments.includes(res.routeKey) ||
          res.children.find((res) => segments.includes(res.routeKey))
      ),
    [userRoutes, segments]
  );

  const [tabIndex, setTabIndex] = React.useState(tab?.index ?? -1);

  const handleChange = (event: any, newValue: number) => {
    setTabIndex(newValue);
  };
  return (
    <div
      className={`flex h-full  w-full   bg-white`}
      style={{
        maxWidth: tabIndex >= 0 ? 290 : 86,
      }}
    >
      <div className=" w-[120px] border h-full flex flex-col justify-start items-center">
        <div className="flex flex-col  justify-between w-full h-full">
          <div className="w-full flex flex-col items-center">
            <Image
              src={`/api/media/${props.user.config.logo}`}
              width={50}
              height={50}
              className=" rounded-full  object-cover  border mb-2"
              alt="logo"
            />
            <Divider />
            <div className="flex flex-col p-1">
              <Tabs
                aria-label="Vertical tabs"
                className="shadow-none bg-transparent"
                orientation="vertical"
                value={tabIndex}
                onChange={handleChange as any}
              >
                <TabList className="shadow-none w-full gap-3">
                  {userRoutes.map((res, i) => (
                    <Tab
                      key={i}
                      disableIndicator
                      className={` w-full flex items-center justify-center rounded-md p-2 ${
                        res.index === tabIndex ? "bg-slate-200 rounded-md" : ""
                      }  p-3`}
                    >
                      {" "}
                      {res.icon && (
                        <SwitchIcon
                          icon={res.icon}
                          className="text-2xl"
                          color={res.index === tabIndex ? "inherit" : "action"}
                        />
                      )}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </div>
          </div>
          <div>
            <Link href={"/logout"}>
              {" "}
              <IconButton className="w-full rounded-none ">
                <LogOutIcon />
              </IconButton>
            </Link>
          </div>
        </div>
      </div>
      {tabIndex >= 0 && (
        <div
          className={`flex
        
w-full 
       flex-col gap-3 `}
        >
          <div>
            <Typography className="text-xl text-gray-700 p-2 mt-3">
              {userRoutes[tabIndex]?.title}
            </Typography>
          </div>
          <Tabs
            aria-label="Vertical tabs"
            className="shadow-none rounded-none w-full bg-transparent mt-0 "
            orientation="vertical"
          >
            <TabList className="shadow-none w-full gap-2 rounded-none px-3">
              {userRoutes[tabIndex]?.children.map((res, i) => (
                <Link
                  key={i}
                  href={res.path}
                  className="w-full flex gap-5 items-center "
                >
                  <Tab
                    disableIndicator
                    className={`  w-full flex   p-0  ${
                      segments.includes(res.routeKey)
                        ? "bg-slate-200 rounded-md"
                        : "bg-transparent  hover:bg-[#e2e8f0] rounded-md"
                    }  p-2`}
                  >
                    {res.icon && <SwitchIcon icon={res.icon} />}
                    {res.title}
                  </Tab>{" "}
                </Link>
              ))}
            </TabList>
          </Tabs>
        </div>
      )}
    </div>
  );
}
function SwitchIcon(props: { icon: string; className?: string; color?: any }) {
  switch (props.icon) {
    case "Calculate":
      return <CalculateIcon color={props.color} className={props.className} />;
    case "Receipt":
      return <ReceiptIcon color={props.color} className={props.className} />;
    case "Payments":
      return <PaymentsIcon color={props.color} className={props.className} />;
    case "Person":
      return <PersonIcon color={props.color} className={props.className} />;
    case "Settings":
      return <SettingsIcon color={props.color} className={props.className} />;
    default:
      return <></>;
  }
}

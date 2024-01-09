"use client";
import { UserAuth } from "@rms/service/user-service";
import Image from "next/image";
import React, { useMemo } from "react";

import Divider from "@mui/joy/Divider";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import Tabs from "@mui/joy/Tabs";
import Typography from "@mui/joy/Typography";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { Next13ProgressBar } from "next13-progressbar";
export default function SideBarDesktop(props: UserAuth & { path: string }) {
  const segments = useSelectedLayoutSegments();
  const routers = useMemo(
    () =>
      props.routes.map((res) => {
        res.children = res.children.filter((res) => !res.hide);
        return res;
      }),
    [props.routes]
  );
  const tab = useMemo(
    () => routers.find((res) => segments.includes(res.routeKey)),
    [routers, segments]
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
              {routers.map((res, i) => (
                <Tab
                  key={i}
                  disableIndicator
                  className={` w-full flex items-center justify-center rounded-md p-2 ${
                    res.index === tabIndex ? "bg-slate-200 rounded-md" : ""
                  }  p-3`}
                >
                  {
                    <res.icon
                      className="text-2xl"
                      color={res.index === tabIndex ? "inherit" : "action"}
                    />
                  }
                </Tab>
              ))}
            </TabList>
          </Tabs>
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
              {routers[tabIndex]?.title}
            </Typography>
          </div>
          <Tabs
            aria-label="Vertical tabs"
            className="shadow-none rounded-none w-full bg-transparent mt-0 "
            orientation="vertical"
          >
            <TabList className="shadow-none w-full gap-2 rounded-none px-3">
              {routers[tabIndex]?.children.map((res, i) => (
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
                    {res.icon && <res.icon />}
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
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function SideBarDescktop(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

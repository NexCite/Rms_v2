"use client";
import { UserFullInfoType } from "@rms/service/user-service";
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
export default function SideBarDesktop(
  props: UserFullInfoType & { path: string }
) {
  const segments = useSelectedLayoutSegments();
  const routers = useMemo(
    () =>
      props.routes.map((res) => {
        res.children = res.children.filter((res) => !res.hide);
        return res;
      }),
    props.routes
  );
  const tab = useMemo(
    () => routers.find((res) => segments.includes(res.routeKey)),
    [segments]
  );

  const [tabIndex, setTabIndex] = React.useState(tab?.index ?? -1);

  const handleChange = (event: any, newValue: number) => {
    setTabIndex(newValue);
  };
  return (
    <div className={`flex h-full max-w-[300px] ${tab ? "w-full" : ""}  border`}>
      <Next13ProgressBar />

      <div className=" w-20 border h-full">
        <Image
          src={`/api/media/${props.config.logo}`}
          width={100}
          height={100}
          className=" rounded-full  object-cover w-full"
          alt="logo"
        />
        <Divider />
        <div className="flex flex-col p-1">
          <Tabs
            aria-label="Vertical tabs"
            className="shadow-none"
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
                    res.index === tabIndex ? "bg-slate-200 rounded-lg" : ""
                  }  p-3`}
                >
                  {<res.icon />}
                </Tab>
              ))}
            </TabList>
          </Tabs>

          {/* <Tabs
            orientation="vertical"
            onChange={handleChange as}
            value={tabIndex}
            aria-label="Tabs where selection follows focus"
            // selectionFollowsFocus
          >
            {routers.map((res, i) => (
              <Tab
                key={res.permission}
                className={`${
                  res.index === tabIndex ? "bg-slate-200 rounded-lg" : ""
                }  p-3`}
                icon={
                  <res.icon
                    color="inherit"
                    fontSize="large"
                    className="text-black"
                  />
                }
                value={res.index}
              ></Tab>
            ))}
          </Tabs> */}
        </div>
      </div>
      <div
        className={`flex
${tab ? "block" : "hidden"}
w-full 
       flex-col gap-3 p-2`}
      >
        <div>
          <Typography className="text-xl text-gray-700 ">
            {routers[tabIndex]?.title}
          </Typography>
        </div>
        <Tabs
          aria-label="Vertical tabs"
          className="shadow-none w-full bg-transparent"
          orientation="vertical"
        >
          <TabList className="shadow-none w-full gap-2">
            {routers[tabIndex]?.children.map((res, i) => (
              <Link
                key={i}
                href={res.path}
                className="w-full flex gap-5 items-center  "
              >
                <Tab
                  disableIndicator
                  className={`  w-full flex  rounded-md p-0 ${
                    segments.includes(res.routeKey)
                      ? "bg-slate-200 rounded-lg"
                      : "bg-transparent"
                  }  p-2`}
                >
                  {/* {<res.icon />} */}
                  {res.title}
                </Tab>{" "}
              </Link>
            ))}
          </TabList>
        </Tabs>
      </div>
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

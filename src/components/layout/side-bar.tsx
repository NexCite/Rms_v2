"use client";
import React from "react";

import RouteModel from "@rms/models/RouteModel";

import { ChevronDownIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Divider,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

type Props = {
  routers: RouteModel[];
  menu: React.ReactNode;
  config: {
    logo: string;
    name: string;
  };
};
export function Sidebar(props: Props) {
  const pathName = usePathname();

  const handleOpen = (value) => {
    setOpen(open === value ? -1 : value);
  };

  const [open, setOpen] = React.useState(
    props.routers.find((res) => pathName.startsWith(res.path))?.index ?? -1
  );

  return (
    <Card className="h-full w-full rounded-none flex flex-col overflow-y-auto">
      <div className="flex  p-3  flex-row justify-between items-center">
        <Image
          src={`/logo.png`}
          alt={props.config.name}
          width={80}
          height={80}
          className="rounded-full w-12 h-12 mb-1"
        />
        {props.menu}
      </div>
      <Divider />
      {/* <List>
        {props.routers
          .filter((res) => !res.end)
          .map((res, i) =>
            res.children.length === 0 ? undefined : (
              <Accordion
                key={`${res.key}_${res.index}`}
                expanded={open === res.index}
                elevation={0}
              >
                <ListItemButton selected={open === res.index}>
                  <div>{res.icon}</div>
                  <AccordionSummary
                    expandIcon={
                      <ChevronDownIcon
                        strokeWidth={2.5}
                        className={`mx-auto h-4 w-4 `}
                      />
                    }
                    onClick={() => handleOpen(res.index)}
                    className=" w-full "
                  >
                    <Typography className="mr-auto font-normal">
                      {res.title}
                    </Typography>
                  </AccordionSummary>
                </ListItemButton>
                <AccordionDetails className="py-1">
                  <List>
                    {res.children
                      .filter((res) => !res.hide)
                      .map((res) => (
                        <Link href={res.path} key={`${res.key}_${res.index}`}>
                          <ListItemButton
                            className={
                              pathName === res.path
                                ? "hover:bg-black dark:bg-white dark:text-black bg-black text-white  my-1 rounded-lg"
                                : "hover:bg-black hover:text-white  mt-1 my-1 rounded-lg"
                            }
                          >
                            {res.title}
                          </ListItemButton>
                        </Link>
                      ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          )}
      </List>
      <List className="mt-auto">
        {props.routers
          .filter((res) => res.end)
          .map((res, i) =>
            res.children.length === 0 ? undefined : (
              <Accordion
                key={`${res.key}_${res.index}`}
                elevation={0}
                expanded={open === res.index}
              >
                <ListItemButton selected={open === res.index}>
                  <div>{res.icon}</div>
                  <AccordionSummary
                    expandIcon={
                      <ChevronDownIcon
                        strokeWidth={2.5}
                        className={` h-4 w-4 `}
                      />
                    }
                    onClick={() => handleOpen(res.index)}
                    className=" w-full "
                  >
                    <Typography className="mr-auto font-normal">
                      {res.title}
                    </Typography>
                  </AccordionSummary>
                </ListItemButton>
                <AccordionDetails className="py-1">
                  <List className="p-0 m-0" key={`${res.key}_${res.index}`}>
                    {res.children
                      .filter((res) => !res.hide)
                      .map((res, i) => (
                        <Link key={`${res.key}_${res.index}`} href={res.path}>
                          <ListItemButton
                            className={
                              pathName === res.path
                                ? "hover:bg-black dark:bg-white dark:text-black bg-black text-white  my-1  rounded-lg"
                                : "hover:bg-black hover:text-white  my-1  rounded-lg"
                            }
                          >
                            {res.title}
                          </ListItemButton>
                        </Link>
                      ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          )}
        <Link href={"/logout"}>
          <ListItemButton>Logout</ListItemButton>
        </Link>
      </List> */}
    </Card>
  );
}

export const dynamic = "force-dynamic";

"use client";
import React from "react";

import RouteModel from "@rms/models/RouteModel";

import { ChevronDownIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import Image from "next/image";
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

type Props = {
  routers: RouteModel[];
  config: {
    logo: string;
    name: string;
  };
};
export function Sidebar(props: Props) {
  const pathName = usePathname();
  const { push, replace } = useRouter();

  const handleOpen = (value) => {
    setOpen(open === value ? -1 : value);
  };

  const [open, setOpen] = React.useState(
    props.routers.find((res) => pathName.startsWith(res.path))?.index ?? -1
  );
  return (
    <Card className="h-full w-full rounded-none flex flex-col">
      <div className="flex flex-col p-3 ">
        <Image
          src={`/api/media/${props.config.logo}`}
          alt={props.config.name}
          width={80}
          height={80}
          className="rounded-full w-12 h-12 mb-1"
        />
      </div>
      <Divider />
      <List>
        {props.routers
          .filter((res) => !res.end)
          .map((res, i) =>
            res.children.length === 0 ? undefined : (
              <Accordion
                key={res.title}
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
                  <List key={i}>
                    {res.children
                      .filter((res) => !res.hide)
                      .map((res) => (
                        <ListItemButton
                          key={res.title}
                          onClick={() => push(res.path)}
                          className={
                            pathName === res.path
                              ? "hover:bg-black dark:bg-white dark:text-black bg-black text-white  my-1 rounded-lg"
                              : "hover:bg-black hover:text-white  mt-1 my-1 rounded-lg"
                          }
                        >
                          {res.title}
                        </ListItemButton>
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
                key={res.title}
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
                  <List className="p-0 m-0" key={i}>
                    {res.children
                      .filter((res) => !res.hide)
                      .map((res) => (
                        <ListItemButton
                          key={res.title}
                          onClick={() => push(res.path)}
                          className={
                            pathName === res.path
                              ? "hover:bg-black dark:bg-white dark:text-black bg-black text-white  my-1  rounded-lg"
                              : "hover:bg-black hover:text-white  my-1  rounded-lg"
                          }
                        >
                          {res.title}
                        </ListItemButton>
                      ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          )}

        <ListItemButton onClick={() => replace("/logout")}>
          Logout
        </ListItemButton>
      </List>
    </Card>
  );
}

export const dynamic = "force-dynamic";

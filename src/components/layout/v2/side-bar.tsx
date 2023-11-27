"use client";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
} from "@mui/material";
import RouteModel from "@rms/models/RouteModel";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
type Props = {
  routes: RouteModel[];
  config: {
    id: number;
    name: string;
    logo: string;
  };
};
function GetIconByName(props: { name: string }) {
  const Icon = useMemo(
    () =>
      dynamic(
        () => import(`lucide-react`).then((res) => res[props.name as any]),
        {
          ssr: false, // Disable server-side rendering
          // Provide a loading placeholder
        }
      ),
    [props.name]
  );

  return <Icon />;
}

export default function SideBarV2(props: Props) {
  const pathName = usePathname();

  const [menuIndex, setMenuIndex] = React.useState(
    props.routes.find((res) => pathName.startsWith(res.path))?.index ?? -1
  );
  const handleMenuIndexClick = useCallback(
    (i) => {
      if (menuIndex === i) {
        setMenuIndex(-1);
      } else {
        setMenuIndex(i);
      }
    },
    [menuIndex]
  );

  return (
    <div className="mt-3 overflow-y-auto h-full justify-between flex flex-col pb-5">
      {props.routes.filter((res) => !res.end).length > 0 && (
        <div className=" flex flex-col  ">
          <div className="flex  justify-between   p-1 ">
            <div className="flex gap-5 items-center">
              <Image
                src={`/api/media/${props.config.logo}`}
                alt={props.config.name}
                width={80}
                height={80}
                className="rounded-full w-12 h-12 mb-3 ml-2 "
              />
              <h1 className="text-xl">{props.config.name}</h1>
            </div>
            <IconButton
              className="drawer-close"
              onClick={() => {
                var bar = document.querySelector(".side-bar");
                bar.classList.remove("show-drawer");
              }}
            >
              <X />
            </IconButton>
          </div>
          <Divider />
          <div className="p-3 gap-4">
            <h1 className="text-xs mb-2">MAIN</h1>
            {props.routes
              .filter((res) => !res.end)
              .map((res, i) => (
                <div key={res.title}>
                  <ListItemButton
                    onClick={() => handleMenuIndexClick(i)}
                    className="flex items-center hover:bg-gray-200 gap-2 px-3 py-2 rounded-md"
                  >
                    <div className="flex w-full gap-2 items-center">
                      {res.icon && <GetIconByName name={res.icon} />}
                      <div>{res.title}</div>
                    </div>
                    {menuIndex === i ? <MdExpandLess /> : <MdExpandMore />}
                  </ListItemButton>
                  <Collapse in={i === menuIndex} timeout="auto" unmountOnExit>
                    <List
                      component="div"
                      disablePadding
                      className="flex flex-row  w-full justify-center px-3 my-2 "
                    >
                      <div className="w-full flex flex-col gap-2">
                        {res.children
                          .filter((res) => !res.hide)
                          .map((res) => (
                            <Link
                              onClick={(e) => {
                                document.getElementById("layout-app").onclick =
                                  () => {
                                    var bar =
                                      document.querySelector(".side-bar");
                                    bar.classList.remove("show-drawer");
                                  };
                              }}
                              key={res.title}
                              href={res.path}
                              as={res.path}
                              className={`flex items-center hover:bg-gray-200 gap-2 px-3 py-2 rounded-md  ${
                                pathName.startsWith(res.path)
                                  ? "bg-gray-200"
                                  : ""
                              }`}
                            >
                              {res.icon && <GetIconByName name={res.icon} />}

                              {res.title}
                            </Link>
                          ))}
                      </div>
                    </List>
                  </Collapse>
                </div>
              ))}
          </div>
        </div>
      )}
      {props.routes.filter((res) => res.end).length > 0 && (
        <div className="p-3">
          <h1 className="text-xs mb-2">SETTINGS</h1>
          {props.routes
            .filter((res) => res.end)
            .map((res, i) => (
              <div className="flex flex-col gap-2" key={res.title}>
                {res.children
                  .filter((res) => !res.hide)
                  .map((res) => (
                    <Link
                      key={res.title}
                      href={res.path}
                      as={res.path}
                      className={`flex  ${
                        pathName.startsWith(res.path) ? "bg-gray-200" : ""
                      } items-center  hover:bg-gray-200 gap-2 px-3 py-2 rounded-md`}
                    >
                      {res.icon && <GetIconByName name={res.icon} />}
                      <h1>{res.title}</h1>{" "}
                    </Link>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

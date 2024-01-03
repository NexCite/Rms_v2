"use client";
import {
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import useDrawerController from "@rms/hooks/drawer-hook";
import RouteModel from "@rms/models/RouteModel";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { MdExpandLess, MdExpandMore, MdLogout } from "react-icons/md";
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
  const isMobile = useMediaQuery("(max-width:900px)");
  const isDesktop = useMediaQuery("(min-width:900px)");
  const drawerStore = useDrawerController();

  const segments = useSelectedLayoutSegments();

  console.log(segments);
  const [menuIndex, setMenuIndex] = React.useState(
    props.routes.find((res) => res.routeKey === segments[0])?.index ?? -1
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
  const listItems = useMemo(
    () => (
      <div className=" w-[260px]  border  top-0 max-h-screen  flex flex-col justify-between h-screen ">
        <div className="flex  justify-between   p-1 bg-[#f3f3f3] ">
          <div className="flex gap-5 items-center justify-center">
            <Image
              src={`/api/media/${props.config.logo}`}
              alt={props.config.name}
              width={80}
              height={80}
              quality={100}
              className="rounded-full  h-[60px] w-[60px] border object-cover "
            />
            <h1 className="text-2xl">{props.config.name}</h1>
          </div>
          <IconButton
            style={{ width: 60, height: 60 }}
            className="md:hidden"
            onClick={() => {
              drawerStore.set(false);
            }}
          >
            <X />
          </IconButton>
        </div>
        <div className="h-full overflow-auto bg-[#f3f3f3] ">
          {props.routes.filter((res) => !res.end).length > 0 && (
            <div className=" flex flex-col  ">
              <div className="p-3 gap-4 ">
                <Typography className=" mb-1  " variant="h6">
                  Main
                </Typography>
                {props.routes
                  .filter((res) => !res.end)
                  .map((res, i) => (
                    <div key={res.title} className="mt-1">
                      <ListItemButton
                        onClick={() => handleMenuIndexClick(i)}
                        className="flex items-center hover:bg-gray-200 gap-2 px-1 py-2 rounded-md"
                      >
                        <div className="flex w-full gap-2 items-center">
                          {/* {res.icon && <GetIconByName name={res.icon} />} */}
                          <div>{res.title}</div>
                        </div>
                        {menuIndex === i ? <MdExpandLess /> : <MdExpandMore />}
                      </ListItemButton>
                      <Collapse
                        in={i === menuIndex}
                        timeout="auto"
                        unmountOnExit
                      >
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
                                    drawerStore.set(false);
                                  }}
                                  key={res.title}
                                  href={res.path}
                                  as={res.path}
                                  className={`flex items-center hover:bg-gray-200   gap-2 px-3 py-2 rounded-md  ${
                                    segments[segments.length - 1] ===
                                    res.routeKey
                                      ? "bg-gray-200 "
                                      : ""
                                  }`}
                                >
                                  {res.icon && (
                                    <GetIconByName name={res.icon} />
                                  )}

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
              <Typography className=" mb-1  " variant="h6">
                Setting
              </Typography>
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
                          {/* {res.icon && <GetIconByName name={res.icon} />} */}
                          <h1>{res.title}</h1>{" "}
                        </Link>
                      ))}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className=" bg-[#f1f2f6] flex items-end justify-end w-full">
          <Link
            href={"/logout"}
            className="flex items-center w-full hover:bg-gray-200 gap-2 px-3 py-2 rounded-md justify-center "
          >
            <h1>Logout</h1> <MdLogout />
          </Link>
        </div>
      </div>
    ),
    [
      props.routes,
      isMobile,
      isDesktop,
      drawerStore.open,
      drawerStore.set,
      menuIndex,
      segments,
    ]
  );
  return isDesktop ? (
    listItems
  ) : (
    <Drawer
      open={(drawerStore.open && isMobile) || isDesktop}
      sx={{ width: 260 }}
      onClose={() => {
        drawerStore.set(false);
      }}
    >
      {listItems}
    </Drawer>
  );
}

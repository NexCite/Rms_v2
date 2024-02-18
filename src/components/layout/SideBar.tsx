"use client";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Card,
  IconButton,
  Stack,
  Typography,
} from "@mui/joy";
import IAuth from "@nexcite/Interfaces/IAuth";
import route from "@nexcite/routes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { IoMdLogOut } from "react-icons/io";
export default function SideBar(props: IAuth) {
  const { config, user } = props;
  const pathName = usePathname();
  const userRoutes = useMemo(
    () =>
      route
        .filter(
          (res) =>
            props.user.role.permissions.includes(res.permission) && !res.hide
        )
        .map((res) => {
          res.children = res.children.filter(
            (res) =>
              props.user.role.permissions.includes(res.permission) && !res.hide
          );
          return res;
        }),
    [props.user.role.permissions]
  );
  return (
    <Card
      sx={{
        borderRadius: 0,
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",

        bottom: 0,
        top: 0,
        left: 0,
        zIndex: 9,
        width: 250,
        overflowY: "auto",
      }}
      variant="outlined"
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{
          width: "100%",
          mb: 2,
          "& img": {
            width: 30,
            height: 30,
            borderRadius: "30%",
          },
        }}
        gap={1}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={1}>
          <Image
            alt={config.name}
            src={`/api/media/${config.logo}`}
            width={60}
            height={60}
          />
          <Typography level="h4" fontWeight={600}>
            {" "}
            {config.name}
          </Typography>
        </Stack>
        <Link href={"/logout"}>
          <IconButton size="sm">
            <IoMdLogOut fontSize={20} />
          </IconButton>
        </Link>
      </Stack>

      <Stack
        direction={"column"}
        spacing={1}
        sx={{
          width: "100%",

          "& a": {
            "& h4": {
              fontWeight: 600,
              fontSize: 16,
            },
            color: "#56575a",
            "& :hover": {
              color: "#1857d5",
            },
          },
          "& .active": {
            "& h4": {
              color: "#1857d5",
            },
          },
        }}
      >
        <AccordionGroup
          size="sm"
          sx={{
            width: "100%",
            "& svg": {
              fontSize: 18,
              color: "#3e3b3b",
            },
            gap: 1,
            "& h4": {
              fontSize: 20,
            },
          }}
          transition="0.2s ease"
          disableDivider
        >
          {userRoutes.map((res) => (
            <Accordion
              key={res.title}
              defaultExpanded={true}
              sx={{ width: "100%" }}
            >
              <AccordionSummary sx={{ padding: 0, paddingBottom: 1 }}>
                <Stack direction={"row"} spacing={1}>
                  <Typography level="body-lg">{res.title}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={"column"} spacing={1} alignItems={"start"}>
                  {res.children
                    .filter((res) => res.parent === undefined)
                    .map((item) => (
                      <Stack key={item.title} direction={"column"} spacing={1}>
                        <Link
                          href={item.path + "?filter=[]"}
                          className={
                            pathName.includes(item.routeKey) ? "active" : ""
                          }
                        >
                          <Typography level="body-md">{item.title}</Typography>
                        </Link>
                        <Stack
                          direction={"column"}
                          spacing={1}
                          sx={{ paddingLeft: 5 }}
                        >
                          {res.children
                            .filter((res) => res.parent === item.index)
                            .map((item) => (
                              <Link
                                key={item.title}
                                href={item.path + "?filter=[]"}
                                className={
                                  pathName.includes(item.routeKey)
                                    ? "active"
                                    : ""
                                }
                              >
                                <Typography level="body-md">
                                  - {item.title}
                                </Typography>
                              </Link>
                            ))}
                        </Stack>
                      </Stack>
                    ))}
                  {}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      </Stack>
    </Card>
  );
}

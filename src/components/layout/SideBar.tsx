"use client";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Stack,
  Typography,
} from "@mui/joy";
import IAuth from "@nexcite/Interfaces/IAuth";
import route from "@nexcite/routes";
import Image from "next/image";
import { useMemo } from "react";
import CalculateIcon from "@mui/icons-material/CalculateRounded";
import PaymentsIcon from "@mui/icons-material/PaymentsRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import ReceiptIcon from "@mui/icons-material/ReceiptRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import LogOutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { IoMdLogOut } from "react-icons/io";
import { usePathname } from "next/navigation";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
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
        spacing={3}
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
                  <Typography level="h4">{res.title}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={"column"} spacing={2} alignItems={"start"}>
                  {res.children.map((res) => (
                    <Link
                      key={res.title}
                      href={res.path}
                      className={
                        pathName.includes(res.routeKey) ? "active" : ""
                      }
                    >
                      <Typography level="h4">{res.title}</Typography>
                    </Link>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      </Stack>
    </Card>
  );
}
function SwitchIcon(props: {
  icon: string;
  className?: string;
  color?:
    | "primary"
    | "success"
    | "warning"
    | "disabled"
    | "action"
    | "inherit"
    | "secondary"
    | "error"
    | "info";
}) {
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

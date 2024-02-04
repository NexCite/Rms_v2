"use client";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Card,
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
import { usePathname } from "next/navigation";

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
        sx={{
          mb: 4,

          "& img": {
            width: 30,
            height: 30,
            borderRadius: "30%",
          },
        }}
        gap={1}
      >
        <Image alt={config.name} src={`/logo.png`} width={60} height={60} />
        <Typography level="h4" fontWeight={600}>
          {" "}
          {config.name} For Trading
        </Typography>
      </Stack>

      <Stack
        direction={"column"}
        spacing={3}
        sx={{
          "& a": {
            "& h4": {
              fontSize: 15,
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
          size="lg"
          sx={{ gap: 1 }}
          transition="0.2s ease"
          disableDivider
        >
          {userRoutes.map((res) => (
            <Accordion key={res.title}>
              <AccordionSummary sx={{ padding: 0, paddingBottom: 2 }}>
                <Stack direction={"row"} spacing={1}>
                  <SwitchIcon color={"action"} icon={res.icon} />
                  <Typography>{res.title}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack
                  direction={"column"}
                  spacing={2}
                  alignItems={"start"}
                  sx={{
                    paddingLeft: 2,
                  }}
                >
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
                  ))}{" "}
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

"use client";
import CalculateIcon from "@mui/icons-material/CalculateRounded";
import LogOutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/PaymentsRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import ReceiptIcon from "@mui/icons-material/ReceiptRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import { Divider } from "@mui/joy";
import Dropdown from "@mui/joy/Dropdown";
import IconButton from "@mui/joy/IconButton";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Menu, { menuClasses } from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import route from "@rms/config/route";
import { UserAuth } from "@rms/service/user-service";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import * as React from "react";

// The Menu is built on top of Popper v2, so it accepts `modifiers` prop that will be passed to the Popper.
// https://popper.js.org/docs/v2/modifiers/offset/
interface MenuButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  menu: React.ReactElement;
  open: boolean;
  onOpen: (
    event?:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>
  ) => void;
  onLeaveMenu: (callback: () => boolean) => void;
  label: string;
}

const modifiers = [
  {
    name: "offset",
    options: {
      offset: ({ placement }: any) => {
        if (placement.includes("end")) {
          return [8, 20];
        }
        return [-8, 20];
      },
    },
  },
];

function NavMenuButton({
  children,
  menu,
  open,
  onOpen,
  onLeaveMenu,
  label,
  ...props
}: Omit<MenuButtonProps, "color">) {
  const isOnButton = React.useRef(false);
  const internalOpen = React.useRef(open);

  const handleButtonKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    internalOpen.current = open;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      onOpen(event);
    }
  };

  return (
    <Dropdown
      open={open}
      onOpenChange={(_, isOpen) => {
        if (isOpen) {
          onOpen?.();
        }
      }}
    >
      <MenuButton
        {...props}
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral" } }}
        onMouseDown={() => {
          internalOpen.current = open;
        }}
        onClick={() => {
          if (!internalOpen.current) {
            onOpen();
          }
        }}
        onMouseEnter={() => {
          onOpen();
          isOnButton.current = true;
        }}
        onMouseLeave={() => {
          isOnButton.current = false;
        }}
        onKeyDown={handleButtonKeyDown}
        sx={{
          bgcolor: open ? "neutral.plainHoverBg" : undefined,
          "&:focus-visible": {
            bgcolor: "neutral.plainHoverBg",
          },
        }}
      >
        {children}
      </MenuButton>
      {React.cloneElement(menu, {
        onMouseLeave: () => {
          onLeaveMenu(() => isOnButton.current);
        },
        modifiers,
        slotProps: {
          listbox: {
            id: `nav-example-menu-${label}`,
            "aria-label": label,
          },
        },
        placement: "right-start",
        sx: {
          width: 288,
          [`& .${menuClasses.listbox}`]: {
            "--List-padding": "var(--ListDivider-gap)",
          },
        },
      })}
    </Dropdown>
  );
}

export default function MenuIconSideNav(props: {
  user: UserAuth;
  path: string;
}) {
  const segments = useSelectedLayoutSegments();

  const itemProps = {
    onClick: () => setMenuIndex(null),
  };
  const userRoutes = React.useMemo(
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
  const pathName = usePathname();

  const defulatIndex = React.useMemo(() => {
    var index = 0;
    userRoutes.map((res, i) => {
      if (pathName.startsWith(res.path)) {
        index = res.index;
      }
    });

    return index;
  }, [userRoutes, pathName]);

  const [menuIndex, setMenuIndex] = React.useState(-1);
  const createHandleLeaveMenu =
    (index: number) => (getIsOnButton: () => boolean) => {
      setTimeout(() => {
        const isOnButton = getIsOnButton();
        if (!isOnButton) {
          setMenuIndex((latestIndex: null | number) => {
            if (index === latestIndex) {
              return null;
            }
            return latestIndex;
          });
        }
      }, 200);
    };
  return (
    <Sheet
      sx={{
        borderRadius: "sm",
        py: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
      }}
    >
      <List>
        <ListItem key={-1}>
          <Image
            src={`/api/media/${props.user.config.logo}`}
            width={50}
            height={50}
            className=" rounded-full  object-cover  border mb-2"
            alt="logo"
          />
        </ListItem>
        <Divider />
        {userRoutes.map((res, i) => (
          <ListItem key={res.permission}>
            <NavMenuButton
              label={res.title}
              open={menuIndex === i}
              onOpen={() => setMenuIndex(i)}
              onLeaveMenu={createHandleLeaveMenu(i)}
              menu={
                <Menu onClose={() => setMenuIndex(null)}>
                  {res.children?.map((res) => (
                    <Link href={res.path} key={res.path}>
                      <MenuItem
                        {...itemProps}
                        color={
                          pathName.endsWith(res.routeKey)
                            ? "primary"
                            : "neutral"
                        }
                      >
                        {res.title}
                      </MenuItem>
                    </Link>
                  ))}
                </Menu>
              }
            >
              <SwitchIcon
                icon={res.icon}
                className="text-2xl"
                color={res.index === defulatIndex ? "inherit" : "action"}
              />
            </NavMenuButton>
          </ListItem>
        ))}
      </List>
      <div>
        <Link href={"/logout"} prefetch>
          <IconButton className="w-full rounded-none ">
            <LogOutIcon />
          </IconButton>
        </Link>
      </div>
    </Sheet>
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

"use server";

import { $Enums, Prisma } from "@prisma/client";
import { getUserInfo } from "@rms/lib/auth";
import { RouteData } from "@rms/lib/common";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";
import RouteModel from "@rms/models/RouteModel";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createUser(
  props: Prisma.UserUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      props.password = hashPassword(props.password);

      await prisma.user.create({ data: props });
      return;
    },
    "Add_User",
    true,
    props
  );
}

export async function getUserStatus(): Promise<"Enable" | undefined> {
  const user = await getUserInfo();
  return user.type === "Admin" ? undefined : "Enable";
}

export async function getUserType() {
  const user = await getUserInfo();
  return user.type;
}

export async function updateUser(
  id: number,
  props: Prisma.UserUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.UserUpdateInput>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      if (props.password) {
        props.password = hashPassword(props.password.toString());
      }
      if (props.type === "Admin") {
        if (info.user.type === "User") {
          props.type = "User";
        }
      }

      return await prisma.user.update({ data: props, where: { id } });
    },
    "Edit_User",
    true,
    props
  );
}

export async function deleteUserById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.user.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.user.delete({ where: { id: id,config_id } });
      // } else {
      //   await prisma.user.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted" },
      //   });
      // }

      return;
    },
    "Delete_User",
    true,
    { id }
  );
}

export default async function getUserFullInfo(
  withRedirect?: boolean
): Promise<UserFullInfoType | undefined> {
  const token = cookies().get("rms-auth");
  if (!token?.value) {
    if (withRedirect) {
      redirect("/login");
    } else {
      return undefined;
    }
  }
  const auth = await prisma.auth.findFirst({
    where: { token: token.value, status: "Enable" },
    include: {
      user: {
        select: {
          username: true,
          first_name: true,
          last_name: true,
          id: true,
          permissions: true,
          type: true,
          config_id: true,
          role: true,
          config: {
            select: {
              logo: true,
              name: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!auth) {
    if (withRedirect) {
      redirect("/login");
    } else {
      return undefined;
    }
  }
  const dataRoute = [
    {
      index: 0,
      title: "Accounting",

      children: [
        {
          index: 0,
          title: "Entries",
          path: "/admin/accounting/entry",
          key: "View_Entries",
          addKey: "Add_Entry",
        },
        {
          index: 1,
          title: "Clients",
          path: "/admin/accounting/account/Client",
          key: "View_Entry_Clients",
          addKey: "Add_Entry_Client",
        },
        {
          index: 2,
          title: "IBs",
          path: "/admin/accounting/account/IB",
          key: "View_Entry_IBs",
          addKey: "Add_Entry_IB",
        },
        {
          index: 3,
          title: "Suppliers",
          path: "/admin/accounting/account/Supplier",
          key: "View_Entry_Suppliers",
          addKey: "Add_Entry_Supplier",
        },
        {
          index: 4,
          title: "Two Digit Or More",
          path: "/admin/accounting/digit/two",
          key: "View_Twos_Digit",
          addKey: "Add_Two_Digit",
        },
        {
          index: 5,
          title: "Three Digit Or More",
          path: "/admin/accounting/digit/three",
          key: "View_Threes_Digit",
          addKey: "Add_Three_Digit",
        },
        {
          index: 6,
          title: "Four Digit Or More",
          path: "/admin/accounting/digit/more",
          key: "View_More_Than_Four_Digit",
          addKey: "Add_More_Than_Four_Digit",
        },
        {
          index: 7,
          title: "Balance sheet",
          path: "/admin/accounting/export_entry",
          key: "View_Balance_Sheet",
        },
        {
          index: 8,
          title: "Activities",
          path: "/admin/accounting/activity",
          key: "View_Activities",
        },
        {
          index: 9,
          title: "View Entry",
          path: "/admin/accounting/entry/[id]",
          key: "View_Entry",
          hide: true,
        },
      ],
      key: "Accounting",
      path: "/admin/accounting",
      icon: "Calculator",
    },
    {
      index: 1,
      title: "Trading",
      icon: "LineChart",
      children: [
        {
          index: 0,
          title: "Invoice",
          path: "/admin/trading/invoice",
          key: "View_Invoices",
          addKey: "Add_Invoice",
        },
        {
          index: 1,
          title: "Payment",
          path: "/admin/trading/payment",
          key: "View_Payments",
          addKey: "Add_Payment",
        },
        {
          index: 2,
          title: "Trader",
          path: "/admin/trading/accounts/trader",
          key: "View_Traders",
          addKey: "Add_Trader",
        },
        {
          index: 3,
          title: "Account",
          path: "/admin/trading/accounts/account",
          key: "View_Account",
          addKey: "Add_Accounts",
        },
        {
          index: 3,
          title: "Account",
          path: "/admin/trading/accounts/account",
          key: "View_Traders",
          addKey: "Add_Account",
        },
        {
          index: 4,
          title: "Broker",
          path: "/admin/trading/accounts/broker",
          key: "View_Brokers",
          addKey: "Add_Broker",
        },
      ],
      key: "Trading",
      path: "/admin/trading",
    },
    {
      index: 2,
      icon: "Landmark",

      title: "Payment Box",
      children: [
        {
          index: 0,
          title: "Equities",
          path: "/admin/payment_box/equity",
          key: "View_Equities",
          addKey: "Add_Equity",
        },
        {
          index: 1,
          title: "Equity",
          path: "/admin/payment_box/equity/[id]",
          key: "View_Equity",
          hide: true,
        },
      ],
      key: "PaymentBox",
      path: "/admin/payment_box",
    },
    {
      index: 3,
      title: "Human Resources",
      icon: "Users",
      children: [
        {
          index: 0,
          title: "Employees",
          path: "/admin/human_resources/employee",
          key: "View_Employees",
          addKey: "Add_Employee",
        },
        {
          index: 1,
          title: "Schedule",
          path: "/admin/human_resources/schedule",
          key: "View_Schedules",
          addKey: "Add_Schedule",
        },
        {
          index: 1,
          title: "Vacation",
          path: "/admin/human_resources/vacation",
          key: "View_Vacations",
          addKey: "Add_Vacation",
        },
      ],
      key: "Human_Resources",
      path: "/admin/human_resources",
    },
    {
      index: 4,
      title: "Setting",
      end: true,
      children: [
        {
          index: 0,
          title: "Currency",
          path: "/admin/setting/currency",
          key: "View_Currencies",
          addKey: "Add_Currency",
          icon: "Coins",
        },
        {
          index: 1,
          title: "User",
          path: "/admin/setting/user",
          key: "View_Users",
          addKey: "Add_User",
          icon: "Users2",
        },
        {
          index: 2,
          title: "Logs",
          path: "/admin/setting/log",
          key: "View_Log",
          icon: "ScrollText",
        },
        {
          index: 3,
          title: "Profile",
          path: "/admin/setting/profile",
          key: "View_Profile",
          icon: "UserCircle",
        },
        {
          index: 4,
          title: "Category",
          path: "/admin/setting/category/category",
          key: "View_Categories",
          addKey: "Add_Category",
          icon: "Book",
        },
        {
          index: 5,
          title: "SubCategory",
          path: "/admin/setting/category/sub_category",
          key: "View_SubCategories",
          addKey: "Add_SubCategory",
          icon: "BookCopy",
        },
        {
          index: 6,
          title: "Schedule Config",
          path: "/admin/setting/schedule_config",
          key: "View_Schedules_Config",
          addKey: "None",
          icon: "CalendarClock",
        },
        {
          index: 7,
          title: "Configuration",
          path: "/admin/setting/configuration",
          key: "View_Config",
          addKey: "Add_Config",
          icon: "SlidersHorizontal",
        },
        {
          index: 8,
          title: "Role",
          path: "/admin/setting/role",
          key: "View_Role",
          addKey: "Add_Role",
          icon: "UserCog",
        },
      ],
      key: "Setting",
      path: "/admin/setting",
    },
  ] as RouteModel[];

  var routes = dataRoute.filter((res) => {
    if (auth.user.role.permissions?.includes(res.key)) {
      res.children = res.children?.filter((r) =>
        auth.user.role.permissions?.includes(r.key)
      );
      return res;
    }
  });
  const user = {
    id: auth.user_id,
    username: auth.user.username,
    first_name: auth.user.first_name,
    last_name: auth.user.last_name,
    type: auth.user.type,
    role: auth.user.role,
  };

  const config = {
    id: auth.user.config.id,
    name: auth.user.config.name,
    logo: auth.user.config.logo,
  };

  return { routes, user, config };
}
export type UserFullInfoType = {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    type: $Enums.UserType;
    role: Prisma.RoleGetPayload<{}>;
  };
  config: {
    id: number;
    name: string;
    logo: string;
  };
  routes: RouteModel[];
};

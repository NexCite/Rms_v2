"use server";
import { getUserInfo } from "@rms/lib/auth";
import RouteModel from "@rms/models/RouteModel";
import getUserFullInfo from "@rms/service/user-service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function GetRoutes() {
  const user = await getUserInfo();
  await getUserFullInfo;
  if (!user) {
    cookies().delete("rms-token");
    redirect("/login");
  }
  var routeData = [
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
  ];
  const permissions = user.permissions;

  const Data = routeData as RouteModel[];

  var result = Data.filter((res) => {
    if (user.permissions?.includes(res.key)) {
      res.children = res.children?.filter((r) => permissions?.includes(r.key));
      return res;
    }
  });
  return result;
}

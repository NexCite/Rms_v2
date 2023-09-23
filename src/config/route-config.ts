import { $Enums } from "@prisma/client";
import RouteModel from "@rms/models/RouteModel";

export default function GetRoutes(permissions: $Enums.UserPermission[]) {
  var result = Data.filter((res) => {
    if (permissions.includes(res.key)) {
      res.children = res.children?.filter((r) => permissions.includes(r.key));
      return res;
    }
  });
  return result;
}
const Data = [
  {
    index: 0,
    title: "Accounting",
    children: [
      {
        index: 0,
        title: "Entry",
        path: "/admin/accounting/entry",

        key: "View_Entries",
      },
      {
        index: 1,
        title: "Account",
        path: "/admin/accounting/account",
        key: "View_AccountEntries",
      },
      {
        index: 1,
        title: "Two Digit",
        path: "/admin/accounting/digit/two",
        key: "View_Twos_Digit",
      },
      {
        index: 2,
        title: "Three Digit",
        path: "/admin/accounting/digit/three",
        key: "View_Threes_Digit",
      },
      {
        index: 3,
        title: "More Than Four Digit",
        path: "/admin/accounting/digit/more",
        key: "View_More_Than_Four_Digit",
      },
      {
        index: 4,
        title: "Export Entry",
        path: "/admin/accounting/export_entry",
        key: "View_Export_Entry",
      },
      {
        index: 5,
        title: "View Entry",
        path: "/admin/accounting/entry/[id]",
        key: "View_Entry",
        hide: true,
      },
    ],
    key: "AccountingLevel",
    path: "/admin/accounting",
  },
  {
    index: 0,
    title: "Trading",
    children: [
      {
        index: 0,
        title: "Invoice",
        path: "/admin/trading/view_trading/invoice",

        key: "View_Invoices",
      },
      {
        index: 1,
        title: "Payment",
        path: "/admin/trading/view_trading/payment",
        key: "View_Payments",
      },
      {
        index: 2,
        title: "Trader",
        path: "/admin/trading/view_trading/trader",
        key: "View_Traders",
      },
      {
        index: 3,
        title: "Account",
        path: "/admin/trading/view_trading/account",
        key: "View_Accounts",
      },
      {
        index: 4,
        title: "Broker",
        path: "/admin/trading/view_trading/broker",
        key: "View_Brokers",
      },
    ],

    key: "Trading",
    path: "/admin/trading",
  },

  {
    index: 0,
    title: "Setting",
    children: [
      {
        index: 0,
        title: "Currnecy",
        path: "/admin/setting/currency",

        key: "View_Currencies",
      },
      {
        index: 1,
        title: "User",
        path: "/admin/setting/user",
        key: "View_Users",
      },
      {
        index: 2,
        title: "Log",
        path: "/admin/setting/log",
        key: "View_Log",
      },
      {
        index: 3,
        title: "Profile",
        path: "/admin/trading/profile",
        key: "View_Profile",
      },
    ],

    key: "Setting",
    path: "/admin/setting",
  },
] as RouteModel[];

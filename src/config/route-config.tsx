import { $Enums } from "@prisma/client";
import RouteModel from "@rms/models/RouteModel";

export default function GetRoutes(permissions: $Enums.UserPermission[]) {
  const Data = [
    {
      index: 0,
      title: "Accounting",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
          />
        </svg>
      ),

      children: [
        {
          index: 0,
          title: "Entry",
          path: "/admin/accounting/entry",

          key: "View_Entries",
          addKey: "Add_Entry",
        },
        {
          index: 1,
          title: "Account",
          path: "/admin/accounting/account",
          key: "View_AccountEntries",
          addKey: "Add_Account",
        },
        {
          index: 1,
          title: "Two Digit",
          path: "/admin/accounting/digit/two",
          key: "View_Twos_Digit",
          addKey: "Add_Two_Digit",
        },
        {
          index: 2,
          title: "Three Digit",
          path: "/admin/accounting/digit/three",
          key: "View_Threes_Digit",
          addKey: "Add_Three_Digit",
        },
        {
          index: 3,
          title: "More Than Four Digit",
          path: "/admin/accounting/digit/more",
          key: "View_More_Than_Four_Digit",
          addKey: "Add_More_Than_Four_Digit",
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
      key: "Accounting",
      path: "/admin/accounting",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-candlestick-chart"
        >
          <path d="M9 5v4" />
          <rect width="4" height="6" x="7" y="9" rx="1" />
          <path d="M9 15v2" />
          <path d="M17 3v2" />
          <rect width="4" height="8" x="15" y="5" rx="1" />
          <path d="M17 13v3" />
          <path d="M3 3v18h18" />
        </svg>
      ),
      index: 1,
      title: "Trading",
      children: [
        {
          index: 0,
          title: "Invoice",
          path: "/admin/trading/view_trading/invoice",
          addKey: "Add_Invoice",

          key: "View_Invoices",
        },
        {
          index: 1,
          title: "Payment",
          path: "/admin/trading/view_trading/payment",
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
          key: "View_Accounts",
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
      end: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-settings"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      index: 2,
      title: "Setting",
      children: [
        {
          index: 0,
          title: "Currency",
          path: "/admin/setting/currency",

          key: "View_Currencies",
          addKey: "Add_Currency",
        },
        {
          index: 1,
          title: "User",
          path: "/admin/setting/user",
          key: "View_Users",
          addKey: "Add_User",
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
        {
          index: 4,
          title: "Category",
          path: "/admin/setting/category/category",
          key: "View_Categories",
          addKey: "Add_Category",
        },
        {
          index: 5,
          title: "SubCategory",
          path: "/admin/setting/category/sub_category",
          key: "View_SubCategories",
          addKey: "Add_SubCategory",
        },
      ],

      key: "Setting",
      path: "/admin/setting",
    },
  ] as RouteModel[];

  var result = Data.filter((res) => {
    if (permissions.includes(res.key)) {
      res.children = res.children?.filter((r) => permissions.includes(r.key));
      return res;
    }
  });
  return result;
}

import RouteModel from "@rms/models/RouteModel";

var route: RouteModel[] = [
  {
    index: 0,
    title: "Accounting",
    routeKey: "accounting",
    children: [
      {
        index: 0,
        title: "Journal Voucher",
        path: "/admin/accounting/journal_voucher",
        permission: "View_Voucher",
        routeKey: "journal_voucher",
        addKey: "Create_Voucher",
      },

      {
        index: 1,
        title: "Chart Of Accounts",
        path: "/admin/accounting/chart_of_account",
        permission: "View_Chart_Of_Accounts",
        routeKey: "chart_of_account",
        addKey: "Create_Chart_Of_Account",
      },
      {
        index: 2,
        title: "Clients",
        routeKey: "client",
        path: "/admin/accounting/account/client",
        permission: "View_Chart_Of_Accounts",
      },
      {
        index: 3,
        title: "IBs",
        routeKey: "ib",

        path: "/admin/accounting/account/ib",
        permission: "View_Chart_Of_Accounts",
      },
      {
        index: 4,
        routeKey: "supplier",
        title: "Suppliers",
        path: "/admin/accounting/account/supplier",
        permission: "View_Chart_Of_Accounts",
      },
      {
        index: 5,
        routeKey: "employee",
        title: "Employee",
        path: "/admin/accounting/account/employee",
        permission: "View_Employees",
        addKey: "Create_Employee",
      },
      {
        index: 6,
        title: "Balance Sheet",
        path: "/admin/accounting/balance_sheet",
        permission: "View_Chart_Of_Accounts",
        routeKey: "balance_sheet",
      },

      {
        index: 7,
        title: "Activities",
        path: "/admin/accounting/activity",
        permission: "View_Activities",
        routeKey: "Activity",
      },
    ],
    permission: "Accounting",
    path: "/admin/accounting",
    icon: "Calculate",
  },
  {
    index: 1,
    title: "Trading",
    icon: "Receipt",
    routeKey: "trading",

    children: [
      {
        index: 0,
        title: "Invoices",
        path: "/admin/trading/invoice",
        permission: "View_Invoices",
        addKey: "Create_Invoice",
      },
      {
        index: 1,
        title: "Payments",
        path: "/admin/trading/payment",
        permission: "View_Payments",
        addKey: "Create_Payment",
      },
      {
        index: 2,
        title: "Traders",
        path: "/admin/trading/accounts/trader",
        permission: "View_Chart_Of_Accounts",
      },
      {
        index: 3,
        title: "Accounts",
        path: "/admin/trading/accounts/account",
        permission: "View_Account",
        addKey: "Create_Account",
      },

      {
        index: 4,
        title: "Broker",
        path: "/admin/trading/accounts/broker",
        permission: "View_Brokers",
        addKey: "Create_Broker",
      },
    ],
    permission: "Trading",
    path: "/admin/trading",
  },
  {
    index: 2,
    icon: "Payments",

    title: "Payments Box",
    routeKey: "payment_box",

    children: [
      {
        index: 0,
        title: "Equities",
        path: "/admin/payment_box/equity",
        permission: "View_Equities",
        addKey: "Create_Equity",
      },
      {
        index: 1,
        title: "Equities",
        path: "/admin/payment_box/equity/[id]",
        permission: "View_Equity",
        hide: true,
      },
    ],
    permission: "PaymentBox",
    path: "/admin/payment_box",
  },
  {
    index: 3,
    title: "Human Resources",
    icon: "Person",
    routeKey: "human_resources",
    children: [
      {
        index: 0,
        title: "Employees",
        path: "/admin/human_resources/employee",
        permission: "View_Employees",
        addKey: "Create_Employee",
      },
      {
        index: 1,
        title: "Schedules",
        path: "/admin/human_resources/schedule",
        permission: "View_Schedules",
        addKey: "Create_Schedule",
      },
      {
        index: 1,
        title: "Vacations",
        path: "/admin/human_resources/vacation",
        permission: "View_Vacations",
        addKey: "Create_Vacation",
      },
    ],
    permission: "Human_Resources",
    path: "/admin/human_resources",
  },
  {
    routeKey: "setting",

    index: 4,
    title: "Settings",
    end: true,
    children: [
      {
        index: 0,
        title: "Currencies",
        path: "/admin/setting/currency",
        permission: "View_Currencies",
        addKey: "Create_Currency",

        routeKey: "currency",
      },
      {
        index: 1,
        title: "User",

        path: "/admin/setting/user",
        permission: "View_Users",
        addKey: "Create_User",
        routeKey: "user",
      },
      {
        index: 2,
        title: "Logs",
        path: "/admin/setting/log",
        permission: "View_Log",
        routeKey: "log",
      },
      {
        index: 3,
        title: "Profile",
        path: "/admin/setting/profile",
        permission: "View_Profile",
        routeKey: "profile",
      },
      {
        index: 4,
        title: "Categories",
        path: "/admin/setting/category/category",
        permission: "View_Categories",
        addKey: "Create_Category",
      },
      {
        index: 5,
        title: "Sub Categories",
        path: "/admin/setting/category/sub_category",
        permission: "View_SubCategories",
        addKey: "Create_SubCategory",
      },
      {
        index: 6,
        title: "Schedule Config",
        path: "/admin/setting/schedule_config",
        permission: "View_Schedules_Config",
      },
      {
        index: 7,
        title: "Configuration",
        path: "/admin/setting/configuration",
        permission: "View_Config",
      },
      {
        index: 8,
        title: "Roles",
        path: "/admin/setting/role",
        permission: "View_Role",
        addKey: "Create_Role",
        routeKey: "role",
      },
    ],
    permission: "Setting",
    icon: "Settings",
    path: "/admin/setting",
  },
];
export default route;
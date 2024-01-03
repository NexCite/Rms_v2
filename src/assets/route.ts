import RouteModel from "@rms/models/RouteModel";
import CalculateIcon from "@mui/icons-material/CalculateOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
const route: RouteModel[] = [
  {
    index: 0,
    title: "Accounting",
    routeKey: "accounting",
    children: [
      {
        index: 1,
        title: "Journal Voucher",
        path: "/admin/accounting/journal_voucher",
        permission: "View_Voucher",
        routeKey: "journal_voucher",
        addKey: "Add_Voucher",
      },
      {
        index: 2,
        title: "Chart Of Account",
        path: "/admin/accounting/chart_of_account",
        permission: "View_Chart_Of_Accounts",
        routeKey: "chart_of_account",
        addKey: "Add_Chart_Of_Account",
      },
      {
        index: 3,
        title: "Clients",
        routeKey: "client",
        path: "/admin/accounting/account/client",
        permission: "View_Entry_Clients",
        addKey: "Add_Entry_Client",
      },
      {
        index: 4,
        title: "IBs",
        routeKey: "ib",

        path: "/admin/accounting/account/ib",
        permission: "View_Entry_IBs",
        addKey: "Add_Entry_IB",
      },
      {
        index: 5,
        routeKey: "supplier",
        title: "Suppliers",
        path: "/admin/accounting/account/supplier",
        permission: "View_Entry_Suppliers",
        addKey: "Add_Entry_Supplier",
      },
      {
        index: 5,
        routeKey: "employee",
        title: "Employee",
        path: "/admin/accounting/account/employee",
        permission: "View_Employees",
        addKey: "Add_Employee",
      },
      // {
      //   index: 6,
      //   routeKey: "two",

      //   title: "Two Digit Or More",
      //   path: "/admin/accounting/digit/two",
      //   permission: "View_Twos_Digit",
      //   addKey: "Add_Two_Digit",
      // },
      // {
      //   index: 7,
      //   title: "Three Digit Or More",
      //   path: "/admin/accounting/digit/three",
      //   permission: "View_Threes_Digit",
      //   addKey: "Add_Three_Digit",
      //   routeKey: "three",
      // },
      // {
      //   index: 8,
      //   title: "Four Digit Or More",
      //   path: "/admin/accounting/digit/more",
      //   permission: "View_More_Than_Four_Digit",
      //   addKey: "Add_More_Than_Four_Digit",
      //   routeKey: "four",
      // },
      // {
      //   index: 9,
      //   title: "Sheet State",
      //   path: "/admin/accounting/sheet_state",
      //   permission: "View_Sheet_State",
      //   routeKey: "sheet_state",
      //   hide: true,
      // },
      {
        index: 10,
        title: "Activities",
        path: "/admin/accounting/activity",
        permission: "View_Activities",
        routeKey: "Activity",
      },
      // {
      //   index: 11,
      //   title: "View Entry",
      //   path: "/admin/accounting/entry/[id]",
      //   permission: "View_Entry",
      //   hide: true,
      // },
    ],
    permission: "Accounting",
    path: "/admin/accounting",
    icon: CalculateIcon,
  },
  {
    index: 1,
    title: "Trading",
    icon: ReceiptIcon,
    routeKey: "trading",

    children: [
      {
        index: 0,
        title: "Invoices",
        path: "/admin/trading/invoice",
        permission: "View_Invoices",
        addKey: "Add_Invoice",
      },
      {
        index: 1,
        title: "Payments",
        path: "/admin/trading/payment",
        permission: "View_Payments",
        addKey: "Add_Payment",
      },
      {
        index: 2,
        title: "Traders",
        path: "/admin/trading/accounts/trader",
        permission: "View_Traders",
        addKey: "Add_Trader",
      },
      {
        index: 3,
        title: "Accounts",
        path: "/admin/trading/accounts/account",
        permission: "View_Account",
        addKey: "Add_Account",
      },

      {
        index: 4,
        title: "Broker",
        path: "/admin/trading/accounts/broker",
        permission: "View_Brokers",
        addKey: "Add_Broker",
      },
    ],
    permission: "Trading",
    path: "/admin/trading",
  },
  {
    index: 2,
    icon: PaymentsIcon,

    title: "Payments Box",
    routeKey: "payment_box",

    children: [
      {
        index: 0,
        title: "Equities",
        path: "/admin/payment_box/equity",
        permission: "View_Equities",
        addKey: "Add_Equity",
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
    icon: PersonIcon,
    routeKey: "human_resources",
    children: [
      {
        index: 0,
        title: "Employees",
        path: "/admin/human_resources/employee",
        permission: "View_Employees",
        addKey: "Add_Employee",
      },
      {
        index: 1,
        title: "Schedules",
        path: "/admin/human_resources/schedule",
        permission: "View_Schedules",
        addKey: "Add_Schedule",
      },
      {
        index: 1,
        title: "Vacations",
        path: "/admin/human_resources/vacation",
        permission: "View_Vacations",
        addKey: "Add_Vacation",
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
        addKey: "Add_Currency",
      },
      {
        index: 1,
        title: "Users",
        path: "/admin/setting/user",
        permission: "View_Users",
        addKey: "Add_User",
      },
      {
        index: 2,
        title: "Logs",
        path: "/admin/setting/log",
        permission: "View_Log",
      },
      {
        index: 3,
        title: "Profile",
        path: "/admin/setting/profile",
        permission: "View_Profile",
      },
      {
        index: 4,
        title: "Categories",
        path: "/admin/setting/category/category",
        permission: "View_Categories",
        addKey: "Add_Category",
      },
      {
        index: 5,
        title: "Sub Categories",
        path: "/admin/setting/category/sub_category",
        permission: "View_SubCategories",
        addKey: "Add_SubCategory",
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
        addKey: "Add_Role",
      },
    ],
    permission: "Setting",
    icon: SettingsIcon,
    path: "/admin/setting",
  },
];
export default route;

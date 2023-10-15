import { Prisma, Status } from "@prisma/client";

export type CommonKeys =
  | "broker"
  | "account"
  | "client"
  | "entry"
  | "entries"
  | "currency"
  | "employee"
  | "trader"
  | "category"
  | "invoice"
  | "user"
  | "media"
  | "brokers"
  | "accounts"
  | "clients"
  | "currencies"
  | "employees"
  | "traders"
  | "categories"
  | "sub_categories"
  | "invoices"
  | "users"
  | "payment"
  | "sub_category"
  | "accounting"
  | "login";

export const CommonKeys = [
  "broker",
  "account",
  "client",
  "currency",
  "employee",
  "trader",
  "category",
  "sub_category",
  "invoice",
  "user",
  "media",
  "entry",
  "payment",
  "accounting",
];

export const CommonRouteKeys = [
  "broker",
  "account",
  "client",
  "currency",
  "employee",
  "trader",
  "category",
  "sub_category",
  "invoice",
  "user",
  "media",
  "entry",
  "payment",
  "accounting",
];

export const CommonKeyWithId =
  "broker_id" ||
  "account_id" ||
  "client_id" ||
  "currency_id" ||
  "employee_id" ||
  "trader_id" ||
  "category_id" ||
  "sub_category_id" ||
  "invoice_id" ||
  "user_id" ||
  "entry_id" ||
  "media_id" ||
  "payment_id";
export const CommonKeysWithId = [
  "broker_id",
  "account_id",
  "client_id",
  "currency_id",
  "employee_id",
  "trader_id",
  "category_id",
  "sub_category_id",
  "invoice_id",
  "user_id",
  "media_id",
  "entry_id",
  "payment_id",
];
export const CommonFormKeys = [
  "broker_id",
  "account_id",
  "client_id",
  "currency_id",
  "employee_id",
  "trader_id",
  "category_id",
  "sub_category_id",
  "entry_id",

  "invoice_id",
  "user_id",
  "media_id",
  "payment_id",
  "node",
  "title",
  "id",
];
export type Routes = "accounting" | "trading" | "profile" | "setting" | "logs";
export type CommonFormKeys =
  | "category_id"
  | "user_id"
  | "sub_category_id"
  | "invoice_id"
  | "client_id"
  | "employee_id"
  | "account_id"
  | "broker_id"
  | "payment_id"
  | "entry_id"
  | "trader_id"
  | "currency_id"
  | "node"
  | "title"
  | "id";
export type CommonRouteKeys =
  | "broker"
  | "account"
  | "client"
  | "currency"
  | "employee"
  | "trader"
  | "category"
  | "sub_category"
  | "invoice"
  | "user"
  | "media"
  | "entry"
  | "payment"
  | "accounting";

export type CommonSelectionKeys =
  | "brokers"
  | "accounts"
  | "clients"
  | "currencies"
  | "employees"
  | "traders"
  | "categories"
  | "subcategories"
  | "entries"
  | "invoices"
  | "users"
  | "media"
  | "payments";

export const CommonKeysFormHide = Object.keys(CommonKeys);

/**
 *
 * Export all data models in prisma
 *
 */

/**
 *
 * Export common Props
 * ex:
 */

export type CommonKeysWithId =
  | "category_id"
  | "user_id"
  | "sub_category_id"
  | "invoice_id"
  | "client_id"
  | "employee_id"
  | "account_id"
  | "broker_id"
  | "payment_id"
  | "trader_id"
  | "entry_id"
  | "currency_id";

type CommonCardData = {
  [k in Status]?: {
    sum?: number;
    count?: number;
  };
};

export type { CommonCardData };

//new

type UserSelectCommon = Prisma.UserGetPayload<{
  select: {
    username: true;
    first_name: true;
    last_name: true;
    id: true;
    permissions: true;
    type: true;
  };
}>;
export type { UserSelectCommon };

export interface Activity {
  id: number;
  status: number;
  type: ActivityType;
  amount: number;
  user_id: number;
  client_id: number;
  create_date: Date;
  last_modified_date: Date;
  note: string;
  description: string;
  account_id: string;
  send_to_accounting: boolean;
  accounting_status: ActivityStatus;
  client: {
    id: number;
    username: string;
    first_name: string;
    token: string;
    last_name: string;
    status: number;
    currency_id: number;
    all: number;
    user_id: number;
    last_modified_date: string;
    create_date: string;
    note: string;
    currency: {
      id: number;
      name: string;
      symbol: string;
    };
  };
}

// Now you can use 'data' with the defined interface in your TypeScript code.
export enum ActivityStatus {
  Padding = "Padding",
  Provided = "Provided",
  Closed = "Closed",
}
export enum ActivityType {
  Credit_In = "Credit_In",
  Balance = "Balanced",
  Deposit = "Deposit",
  Credit_Out = "Credit_Out",
  Withdrawl = "Withdrawl",
  Commission = "Commission",
}

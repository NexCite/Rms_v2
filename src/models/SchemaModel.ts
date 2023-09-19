import {
  Broker,
  Client,
  Trader,
  User,
  Account,
  Invoice,
  Employee,
  Category,
  SubCategory,
  Payment,
  Media,
  Currency,
} from "@prisma/client";

export interface Option {
  minRow?: number;
  maxRow?: number;
  required?: boolean;
  min?: number;
  max?: number;
  readonly?: boolean;
  hidden?: boolean;
  accept?: string[];
}

export interface Options {
  data?: DBModels[] | string[];
  bindKey?: string;
  bindLabel?: string;
}

export type DBModels =
  | Trader
  | Client
  | Broker
  | User
  | Account
  | Invoice
  | Employee
  | Category
  | SubCategory
  | Payment
  | Media
  | Currency;

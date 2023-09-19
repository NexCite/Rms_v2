import { CommonKeys, CommonRouteKeys } from "./CommonModel";

import {
  Account,
  Auth,
  Broker,
  Category,
  Client,
  Config,
  Currency,
  Employee,
  Entry,
  Invoice,
  Log,
  Media,
  CategoryType,
  Gender,
  MediaType,
  Payment,
  PaymentType,
  User,
  Trader,
  UserType,
  SubCategory,
  Status,
  SubCategoryType,
} from "@prisma/client";

type Types =
  | CategoryType
  | MediaType
  | PaymentType
  | UserType
  | Status
  | SubCategoryType
  | CategoryType
  | Gender;
type Models =
  | keyof Trader
  | keyof Account
  | keyof Auth
  | keyof Broker
  | keyof Category
  | keyof Client
  | keyof Config
  | keyof Currency
  | keyof Employee
  | keyof Entry
  | keyof Invoice
  | keyof Log
  | keyof Media
  | keyof SubCategory
  | keyof User
  | keyof Payment
  | "media"
  | "confirm_password";

export enum FormType {
  text = "text",
  textarea = "textarea",
  select = "select",
  password = "password",
  file = "file",
  check = "check",
  awaitSelect = "awaitSelect",
  switch = "switch",
  number = "number",
  multiSelect = "multiSelect",
  date = "date",
}

export default interface FormModel {
  label: string;
  type: FormType;
  name: Models;
  hide_in?: CommonKeys;
  required: boolean;
  placeholder: string;
  show: boolean;
  select?: any[];
  data?: any[];
  keyBind?: CommonRouteKeys;
  labelBind?: "title" | "name" | "username" | "symbol" | "id";
  sizes?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

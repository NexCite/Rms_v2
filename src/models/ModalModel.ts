import { CommonKeys, CommonRouteKeys } from "./CommonModel";
import ServiceActionModel from "@nexcite/models/ServiceActionModel";
export interface FromModalModel {
  args?: any;
  onAction?: () => void;
  to?: string;
}

export default interface ModalConfigType {
  node: CommonRouteKeys;
  title: string;
  query?: string;
  modalWidth?: string | number;
  onAction?: (id: number) => void;
  closed?: any;
  form?: FromModalModel;
  related?: RelatedConfig[];
  widget?: (props: any) => React.JSX.Element;
  relations?: CommonRouteKeys[];
  service?: {
    [k in CommonKeys]?: {
      create: (params: any) => Promise<ServiceActionModel<any>>;
      delete: (id: number) => Promise<ServiceActionModel<any>>;
      update: (id: number, params: any) => Promise<ServiceActionModel<any>>;
      get: (id: number) => Promise<ServiceActionModel<any>>;
    };
  };
}
export enum RelatedConfig {
  home = "home",
  invoice = "invoice",
  user = "user",
  category = "category",
  sub_category = "sub_category",
  account = "account",
  client = "client",
  trader = "trader",
  broker = "broker",
  employee = "employee",
  media = "media",
  currency = "currency",
  payment = "payment",
}

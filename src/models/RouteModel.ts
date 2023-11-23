import { $Enums } from "@prisma/client";

export default interface RouteModel {
  title: string;
  path: string;
  icon?: string;
  key: $Enums.UserPermission;
  index: number;
  hide: boolean;
  end?: boolean;
  children: RouteModel[];
  addKey?: $Enums.UserPermission | "None";
}

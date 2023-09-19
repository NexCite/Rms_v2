import { $Enums } from "@prisma/client";

export default interface RouteModel {
  title: string;
  path: string;
  key: $Enums.UserPermission;
  index: number;
  hide: boolean;
  children: RouteModel[];
}

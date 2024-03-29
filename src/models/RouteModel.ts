import { $Enums } from "@prisma/client";

export default interface RouteModel {
  title: string;
  path: string;
  icon?:
    | "Person"
    | "Payments"
    | "Calculate"
    | "Receipt"
    | "Settings"
    | "Dashboard"
    | "People"
    | "LocalOffer"
    | "Schedule"
    | "ListAlt"
    | "AssignmentInd"
    | "Assignment"
    | "AssignmentTurnedIn"
    | "AssignmentLate"
    | "AssignmentReturned"
    | "AssignmentRe";
  routeKey?: string;
  query?: string;
  deactivate?: boolean;
  parent?: number;
  index: number;
  permission: $Enums.UserPermission;
  hide?: boolean;
  end?: boolean;
  children?: RouteModel[];
  addKey?: $Enums.UserPermission;
}

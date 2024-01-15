import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
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
  index: number;
  permission: $Enums.UserPermission;
  hide?: boolean;
  end?: boolean;
  children?: RouteModel[];
  addKey?: $Enums.UserPermission;
}

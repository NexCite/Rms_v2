import { CommonKeys } from "./CommonModel";
import { IconType } from "react-icons";
import { Status } from "@prisma/client";

type CardModel = {
  [k in CommonKeys]?: {
    icon: IconType;
    title: string;
    type: "sum" | "count" | "total";
    status: Status;
  }[];
};
export default CardModel;

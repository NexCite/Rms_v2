import { z } from "zod";
import { getUserInfo } from "./auth";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const COMMON_ID = z.number();

export { phoneRegex };

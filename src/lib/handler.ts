"use server";

import HttpStatusCode from "@rms/models/HttpStatusCode";

import { $Enums, Prisma, UserType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { checkUserPermissions } from "./auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createLog } from "@rms/service/log-service";
import { UserFullInfoType } from "@rms/service/user-service";

export async function handlerServiceAction<T>(
  action: (info?: UserFullInfoType, config_id?: number) => Promise<T>,
  key: $Enums.UserPermission | "None",
  update?: boolean,
  body?: any
) {
  const urlHeader = headers().get("url") || headers().get("next-url");

  if (!urlHeader) {
    return;
  }

  if (key === "None") {
    try {
      var result = await action();
      return {
        status: HttpStatusCode.OK,
        result,
        message: "Operation Successfully",
      };
    } catch (error: any) {
      if ((error as any).meta && (error as any).message) {
        var errors: any = {};
        var msg = error.message.split(":");
        if (error["meta"]["target"]) {
          error["meta"]["target"].map((res: any) => {
            errors[res] = msg.length > 1 ? msg[1] : msg[0];
          });

          return {
            status: HttpStatusCode.BAD_REQUEST,
            message: error.message,
            errors: errors,
          };
        }
        return {
          status: HttpStatusCode.BAD_REQUEST,
          message: error.message,
        };
      } else {
        return {
          status: HttpStatusCode.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
    }
  } else {
    const resultPermissions = await checkUserPermissions(key);
    const url = new URL(urlHeader);

    if (resultPermissions.status === HttpStatusCode.OK) {
      try {
        var result = await action(
          resultPermissions.data!,
          resultPermissions.data.config.id
        );
        if (!url.pathname.includes("/log")) {
          await createLog({
            action: key.includes("Add")
              ? "Add"
              : key.includes("Edit")
              ? "Edit"
              : key.includes("Delete")
              ? "Delete"
              : "View",
            page: url.toString(),
            user_id: resultPermissions.data.user.id,
            body: JSON.stringify(body),
          });
        }

        if (update) {
          revalidatePath(urlHeader, "layout");
        }
        return {
          status: HttpStatusCode.OK,
          result,
          message: "Operation Successfully",
        };
      } catch (error: any) {
        console.log(error);
        if ((error as any).meta && (error as any).message) {
          await createLog({
            action: key.includes("Add")
              ? "Add"
              : key.includes("Edit")
              ? "Edit"
              : key.includes("Delete")
              ? "Delete"
              : "View",
            page: url.toString(),
            user_id: resultPermissions.data.user.id,
            body: JSON.stringify(body),
            error: JSON.stringify(error.message),
          });
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle known request errors (e.g., unique constraint violation)
            error.meta = {
              ...error.meta,
            };
            return {
              message: Object.keys(error.meta)
                .map((res) => `<div>${error.meta[res]}<div>`)
                .join("\n"),
              status: 500,
            };
          } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            // Handle unknown request errors
            return { message: error.message, status: 500 };
          } else if (error instanceof Prisma.PrismaClientValidationError) {
            // Handle validation errors (e.g., query not constructed correctly)
            return { message: error.message, status: 500 };
          } else if (error instanceof Prisma.PrismaClientRustPanicError) {
            // Handle errors related to the Rust engine
            return { message: error.message, status: 500 };
          } else {
            // Handle non-Prisma errors
            return { message: error.message, status: 500 };
          }
        }
      }
    }
  }
}

function generatePaths(inputPath: string) {
  const paths = inputPath.split("/").filter(Boolean);
  const result = [];

  let currentPath = "";

  for (const path of paths) {
    currentPath += "/" + path;
    result.push(currentPath);
  }

  return result;
}

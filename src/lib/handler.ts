"use server";

import HttpStatusCode from "@rms/models/HttpStatusCode";

import { $Enums, Prisma, UserType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { checkUserPermissions } from "./auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createLog } from "@rms/service/log-service";

export async function handlerServiceAction<T>(
  action: (
    user?: Prisma.UserGetPayload<{
      select: {
        username: true;
        first_name: true;
        last_name: true;
        id: true;
        permissions: true;
        type: true;
      };
    }>
  ) => Promise<T>,
  key: $Enums.UserPermission | "None",
  update?: boolean
) {
  const urlHeader = headers().get("url");

  if (!urlHeader) {
    return;
  }

  if (key === "None") {
    var result = await action();
  } else {
    const auth = await checkUserPermissions(key);
    const url = new URL(urlHeader);

    if (auth.status === HttpStatusCode.OK) {
      try {
        var result = await action(auth.user!);
        await createLog({
          id: auth.user.id,
          action: key.includes("Add")
            ? "Add"
            : key.includes("Edit")
            ? "Edit"
            : key.includes("Delete")
            ? "Delete"
            : "View",
          page: url,
          user_id: auth.user.id,
          body: JSON.stringify(result),
        });

        if (update) {
          const paths = generatePaths(url.pathname);
          paths.forEach((e) => revalidatePath(e));
        }
        return {
          status: HttpStatusCode.OK,
          result,
          message: "Opration Successfully",
        };
      } catch (error: any) {
        createLog({
          id: auth.user.id,
          action: key.includes("Add")
            ? "Add"
            : key.includes("Edit")
            ? "Edit"
            : key.includes("Delete")
            ? "Delete"
            : "View",
          page: url,
          user_id: auth.user.id,
          body: JSON.stringify({}),
          error: JSON.stringify(error),
        });

        console.log(error);
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

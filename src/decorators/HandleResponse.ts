import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import ResponseModel from "@nexcite/Interfaces/Response";
import { revalidatePath, revalidateTag } from "next/cache";
import { $Enums } from "@prisma/client";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import prisma from "@nexcite/prisma/prisma";

function HandleResponse(props?: {
  paths?: string[];
  permission: $Enums.UserPermission;
}) {
  return function handleResult(
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      ...args: any[]
    ): Promise<ResponseModel | undefined> {
      try {
        const token = cookies().get("rms-auth");
        if (!token) {
          redirect("/", RedirectType.replace);
        }
        const auth = await prisma.auth.findFirst({
          where: {
            token: token.value,
            user: {
              role: {
                permissions: {
                  has: props?.permission,
                },
              },
            },
          },
        });
        if (!auth) {
          redirect("/admin/403", RedirectType.replace);
        }

        const result = await originalMethod.apply(this, args);
        if (props?.paths) {
          props?.paths.forEach((path) => {
            revalidatePath(path);
          });
        }

        return result;
      } catch (error) {
        console.log(error);
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return {
              status: 400,
              error: error.meta?.target as any,
              message: "duplicate",
            };
          }
        }

        return undefined;
      }
    };

    return descriptor;
  };
}

export default HandleResponse;

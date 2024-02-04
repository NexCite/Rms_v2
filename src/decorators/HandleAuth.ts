import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import ResponseModel from "@nexcite/Interfaces/Response";
import { revalidatePath, revalidateTag } from "next/cache";
import { $Enums } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function HandleAuth(props?: { permissions: $Enums.UserPermission[] }) {
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
          redirect("/");
        }

        const result = await originalMethod.apply(this, args);

        return result;
      } catch (error) {
        return undefined;
      }
    };

    return descriptor;
  };
}

export default HandleAuth;

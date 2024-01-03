"use server";

import { $Enums, Prisma } from "@prisma/client";
import route from "@rms/assets/route";
import { getUserInfo } from "@rms/lib/auth";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";
import RouteModel from "@rms/models/RouteModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function createUser(props: Prisma.UserUncheckedCreateInput) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      props.password = hashPassword(props.password);

      await prisma.user.create({ data: props });
      return;
    },
    "Add_User",
    true,
    props
  );
}

export const getUserStatus = (
  props: Prisma.UserGetPayload<{
    select: {
      id: true;
      username: true;
      first_name: true;
      last_name: true;
      type: true;
      role: true;
    };
  }>
) => {
  return props.type === "Admin" ? undefined : $Enums.Status.Enable;
};

export async function getUserType() {
  const user = await getUserInfo();
  return user.type;
}

export async function updateUser(
  id: number,
  props: Prisma.UserUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      if (props.password) {
        props.password = hashPassword(props.password.toString());
      }
      if (props.type === "Admin") {
        if (info.user.type === "User") {
          props.type = "User";
        }
      }

      return await prisma.user.update({ data: props, where: { id } });
    },
    "Edit_User",
    true,
    props
  );
}

export async function deleteUserById(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.user.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.user.delete({ where: { id: id,config_id } });
      // } else {
      //   await prisma.user.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted" },
      //   });
      // }

      return;
    },
    "Delete_User",
    true,
    { id }
  );
}

export default async function getUserFullInfo(
  props: {
    withRedirect?: boolean;
    withMedia?: boolean;
  } = {}
): Promise<UserFullInfoType | undefined> {
  const token = cookies().get("rms-auth");
  if (!token?.value) {
    if (props?.withRedirect) {
      redirect("/login");
    } else {
    }
  }
  const auth = await prisma.auth.findFirst({
    where: { token: token.value, status: "Enable" },
    include: {
      user: {
        select: {
          username: true,
          first_name: true,
          last_name: true,
          id: true,
          permissions: true,
          type: true,
          config_id: true,
          role: true,
          config: {
            select: {
              logo: true,
              media: props.withMedia ?? false,
              name: true,
              phone_number: true,
              email: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!auth) {
    if (props.withRedirect) {
      redirect("/login");
    } else {
      return undefined;
    }
  }

  const routes = route.filter((res) => {
    if (auth.user.role.permissions?.includes(res.permission as any)) {
      res.children = res.children?.filter((r) =>
        auth.user.role.permissions?.includes(r.permission as any)
      );
      return res;
    }
  }) as RouteModel[];
  const user = {
    id: auth.user_id,
    username: auth.user.username,
    first_name: auth.user.first_name,
    last_name: auth.user.last_name,
    type: auth.user.type,
    role: auth.user.role,
  };

  const config = {
    id: auth.user.config?.id,
    name: auth.user.config?.name,
    logo: auth.user.config?.logo,
    phone_number: auth.user.config?.phone_number,
    email: auth.user.config?.email,
  };

  return { routes, user, config };
}
export type UserFullInfoType = {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    type: $Enums.UserType;
    role: Prisma.RoleGetPayload<{}>;
  };
  config: {
    id: number;
    name: string;
    logo: string;
    phone_number: string;
    email: string;
  };
  routes: RouteModel[];
};
export async function resetUser(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.user.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}

"use server";

import { $Enums, Prisma } from "@prisma/client";
import route from "@rms/assets/route";
import { getUserInfo } from "@rms/lib/auth";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";
import RouteModel from "@rms/models/RouteModel";
import prisma from "@rms/prisma/prisma";
import { cookies, headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
export async function createUser(props: Prisma.UserUncheckedCreateInput) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      props.password = hashPassword(props.password);

      return await prisma.user.create({ data: props, select: { id: true } });
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

export type UserAuth = {
  user: Prisma.UserGetPayload<{
    include: {
      role: {};
      config: {
        select: {
          id: true;
          name: true;
          email: true;
          logo: true;
          phone_number: true;
        };
      };
    };
  }>;
  routes: RouteModel[];
};
export async function userAuth(): Promise<UserAuth> {
  const token = cookies().get("rms-auth");
  if (!token?.value) {
    redirect("/login", RedirectType.replace);
  }
  const user = await prisma.user.findFirst({
    where: { auth: { some: { token: token.value } } },
    include: {
      role: {},
      config: {
        select: {
          id: true,
          name: true,
          email: true,
          logo: true,
          phone_number: true,
        },
      },
    },
  });
  if (!user) {
    redirect("/login", RedirectType.replace);
  }
  const url = new URL(headers().get("url"));
  const routes = route.filter((res) =>
    user.role.permissions.includes(res.permission)
  );

  if (url.pathname === "/admin") {
    return { user, routes };
  }

  const findRoute = route.find((res) => {
    return url.pathname === res.path;
  });

  const findSubRouter: RouteModel[] = route.reduce(
    (a, b) => a.concat(b.children),
    []
  );

  var findSubRoute = findSubRouter.find((res) => {
    if (url.pathname.endsWith("form")) {
      return url.pathname.replace("/form", "").startsWith(res.path);
    } else {
      return url.pathname.startsWith(res.path) || res.path === url.pathname;
    }
  });

  if (findRoute) {
    if (!user.role.permissions.includes(findRoute.permission)) {
      redirect("/login", RedirectType.replace);
    }
  } else if (findSubRoute) {
    if (url.pathname.endsWith("form")) {
      if (!user.role.permissions.includes(findSubRoute.addKey)) {
        redirect("/login", RedirectType.replace);
      }
    } else if (!user.role.permissions.includes(findSubRoute.permission)) {
      redirect("/login", RedirectType.replace);
    }
  } else {
    redirect("/login", RedirectType.replace);
  }

  return { user, routes };
}

export default async function getUserFullInfo(
  props: {
    withRedirect?: boolean;
    withMedia?: boolean;
  } = {}
): Promise<UserFullInfoType | undefined> {
  const token = cookies().get("rms-auth");

  if (!token?.value) {
    handleMissingToken(props);
  }

  const auth = await getAuthenticatedUser(token, props);

  if (!auth) {
    handleMissingToken(props);
  }

  const routes = filterRoutes(auth);

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

function handleMissingToken(props: {
  withRedirect?: boolean;
}): void | undefined {
  if (props.withRedirect) {
    redirect("/login");
  }
}
type AuthType = Prisma.AuthGetPayload<{
  include: {
    user: {
      select: {
        username: true;
        first_name: true;
        last_name: true;
        id: true;
        permissions: true;
        type: true;
        config_id: true;
        role: true;
        config: {
          select: {
            logo: true;
            name: true;
            phone_number: true;
            email: true;
            id: true;
          };
        };
      };
    };
  };
}>;
async function getAuthenticatedUser(
  token: { value?: string },
  props: { withRedirect?: boolean }
): Promise<AuthType | null> {
  return await prisma.auth.findFirst({
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
}

function filterRoutes(auth: AuthType | null): RouteModel[] {
  return route.filter((res) => {
    if (auth?.user.role.permissions?.includes(res.permission as any)) {
      res.children = res.children?.filter((r) =>
        auth.user.role.permissions?.includes(r.permission as any)
      );
      return res;
    }
  }) as RouteModel[];
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

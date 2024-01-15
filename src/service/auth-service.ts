"use server";
import { UserAuth } from "./user-service";
import { cookies, headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import prisma from "@rms/prisma/prisma";
import { writeFile } from "fs";
import RouteModel from "@rms/models/RouteModel";
import route from "@rms/assets/route";

export async function userAuth(): Promise<UserAuth> {
  const token = cookies().get("rms-auth");
  if (!token?.value) {
    redirect("/login", RedirectType.replace);
  }
  const auth = await prisma.auth.findFirst({
    where: { token: token.value },
    include: {
      user: {
        include: {
          role: true,
          config: true,
        },
      },
    },
  });
  if (!auth) {
    redirect("/login", RedirectType.replace);
  }

  const user = auth.user;
  if (!user) {
    redirect("/login", RedirectType.replace);
  }
  const url = new URL(headers().get("url"));

  if (url.pathname === "/admin") {
    return user;
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

  return user;
}

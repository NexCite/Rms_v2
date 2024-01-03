"use server";
import route from "@rms/assets/route";
import { getUserInfo } from "@rms/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function GetRoutes() {
  const user = await getUserInfo();
  if (!user) {
    cookies().delete("rms-token");
    redirect("/login");
  }

  const permissions = user.permissions;

  var result = route.filter((res) => {
    if (user.permissions?.includes(res.permission)) {
      res.children = res.children?.filter((r) =>
        permissions?.includes(r.permission)
      );
      return res;
    }
  });
  return result;
}

"use server";
import { getUserInfo } from "@rms/lib/auth";
import RouteModel from "@rms/models/RouteModel";
import getUserFullInfo from "@rms/service/user-service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import routeJson from "@rms/route.json";

export default async function GetRoutes() {
  const user = await getUserInfo();
  await getUserFullInfo;
  if (!user) {
    cookies().delete("rms-token");
    redirect("/login");
  }

  const permissions = user.permissions;

  var result = (routeJson as RouteModel[]).filter((res) => {
    if (user.permissions?.includes(res.key)) {
      res.children = res.children?.filter((r) => permissions?.includes(r.key));
      return res;
    }
  });
  return result;
}

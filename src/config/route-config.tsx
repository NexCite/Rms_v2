"use server";
import { getUserInfo } from "@rms/lib/auth";
import RouteModel from "@rms/models/RouteModel";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import routeConfig from "../../routes.json";

export default async function GetRoutes() {
  const user = await getUserInfo();
  if (!user) {
    cookies().delete("rms-token");
    redirect("/login");
  }
  const permissions = user.permissions;

  const Data = routeConfig as RouteModel[];

  var result = Data.filter((res) => {
    if (user.permissions?.includes(res.key)) {
      res.children = res.children?.filter((r) => permissions?.includes(r.key));
      return res;
    }
  });
  return result;
}

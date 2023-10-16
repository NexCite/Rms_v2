import prisma from "@rms/prisma/prisma";
import ConfigWidget from "@rms/widgets/config/config-widget";
import { redirect } from "next/navigation";

export default async function Index() {
  const config = await prisma.config.findFirst();
  console.log(config);

  if (config) redirect("/login");

  return <ConfigWidget />;
}

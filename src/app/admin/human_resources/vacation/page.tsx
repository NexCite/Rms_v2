import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import { getConfigId } from "@rms/lib/config";

export default async function page() {
  const config_id = await getConfigId();

  var value: Prisma.VacationGetPayload<{}>[] = await prisma.vacation.findMany({
    where: {
      // status: await getUserStatus(),
    },
    orderBy: {
      id: "desc",
    },
  });

  return <div></div>;
}

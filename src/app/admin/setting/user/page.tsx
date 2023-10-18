import UserTableComponent from "@rms/widgets/table/user-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import { getConfigId } from "@rms/lib/config";

export default async function page(props: {
  params: { node: "user" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  var value: Prisma.UserGetPayload<{}>[] = await prisma.user.findMany({
    where: {
      config_id,
      status: await getUserStatus(),
      type: "User",
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div>
      <UserTableComponent users={value} />
    </div>
  );
}

import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import UserTableComponent from "@rms/widgets/table/user-table";

export default async function page() {
  const info = await getUserFullInfo();
  const userStates = getUserStatus(info.user);
  var value: Prisma.UserGetPayload<{}>[] = await prisma.user.findMany({
    where: {
      config_id: info.config.id,
      status: userStates,
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

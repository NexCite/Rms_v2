import { Prisma } from "@prisma/client";
import prisma from "@nexcite/prisma/prisma";
import getAuth, { getUserStatus } from "@nexcite/service/user-service";
import UserTableComponent from "@nexcite/widgets/table/UserTable";

export default async function page() {
  const info = await getAuth();
  const userStates = getUserStatus(info.user);
  var value: Prisma.UserGetPayload<{ include: { role: true } }>[] =
    await prisma.user.findMany({
      where: {
        config_id: info.config.id,
        status: userStates,
        type: "User",
        role: {
          OR: [
            {
              name: {
                not: "Admin",
              },
            },
            {
              name: {
                not: "admin",
              },
            },
          ],
        },
      },
      include: { role: true },
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

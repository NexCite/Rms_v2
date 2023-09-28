import UserTableComponent from "@rms/widgets/table/user-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";

export default async function page(props: {
  params: { node: "user" };
  searchParams: { id?: string };
}) {
  var value: Prisma.UserGetPayload<{}>[] = await prisma.user.findMany({
    where: {
      status: await getUserStatus(),
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

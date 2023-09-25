import UserTableComponent from "@rms/widgets/table/user-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

export default async function page(props: {
  params: { node: "user" };
  searchParams: { id?: string };
}) {
  var value: Prisma.UserGetPayload<{}>[] = await prisma.user.findMany({
    where: {
      status: "Enable",
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

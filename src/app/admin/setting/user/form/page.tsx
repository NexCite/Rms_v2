import { Prisma } from "@prisma/client";
import prisma from "@nexcite/prisma/prisma";
import getAuth, { getUserStatus } from "@nexcite/service/user-service";
import UserFormComponent from "@nexcite/widgets/form/user-form";

export default async function page(props: {
  params: { node: "user" };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.UserGetPayload<{
    select: {
      username: true;
      first_name: true;
      last_name: true;
      role_id: true;

      role: true;
      id: true;
    };
  }>;
  const info = await getAuth();

  if (isEditMode) {
    value = await prisma.user.findFirst({
      where: {
        id,
        status: getUserStatus(info.user),
        type: info.user.type === "User" ? "User" : undefined,
        config_id: info.config.id,
      },
      select: {
        username: true,
        first_name: true,
        last_name: true,

        role: true,

        role_id: true,

        id: true,
      },
    });
  }
  const roles = await prisma.role.findMany({});
  return (
    <>
      <UserFormComponent value={value} user={info.user} roles={roles} />
    </>
  );
}

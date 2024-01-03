import { Prisma } from "@prisma/client";
import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import UserFormComponent from "@rms/widgets/form/user-form";

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
      email: true;
      country: true;
      address1: true;
      role_id: true;

      role: true;
      phone_number: true;
      address2: true;
      gender: true;
      permissions: true;
      id: true;
    };
  }>;
  const info = await getUserFullInfo();

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
        email: true,
        country: true,
        role: true,
        address1: true,
        address2: true,
        role_id: true,
        phone_number: true,
        gender: true,
        permissions: true,
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

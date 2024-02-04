import { Prisma } from "@prisma/client";
import prisma from "@nexcite/prisma/prisma";
import getAuth from "@nexcite/service/user-service";
import RoleForm from "@nexcite/widgets/form/role-form";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const auth = await getAuth();
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.RoleGetPayload<{}>;
  if (isEditMode) {
    value = await prisma.role.findFirst({
      where: { id: id, config_id: auth.config.id },
    });
  }
  return (
    <div>
      <RoleForm value={value} />
    </div>
  );
}

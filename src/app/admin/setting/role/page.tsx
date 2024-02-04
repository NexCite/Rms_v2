import prisma from "@nexcite/prisma/prisma";
import getAuth from "@nexcite/service/user-service";
import RoleTable from "@nexcite/widgets/table/RoleTable";

export default async function page() {
  const user = await getAuth();
  const result = await prisma.role.findMany({
    where: { config_id: user.config.id },
    orderBy: {
      id: "desc",
    },
  });
  return (
    <div>
      <RoleTable data={result} />
    </div>
  );
}

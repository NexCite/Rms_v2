import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import getAuth from "@rms/service/user-service";
import RoleTable from "@rms/widgets/table/role-table";
import React from "react";

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

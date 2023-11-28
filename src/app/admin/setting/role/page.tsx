import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import RoleTable from "@rms/widgets/table/role-table";
import React from "react";

export default async function page() {
  const config_id = await getConfigId();
  const result = await prisma.role.findMany({
    where: { config_id },
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

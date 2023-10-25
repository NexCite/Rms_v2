import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import { getConfigId } from "@rms/lib/config";
import EmployeesTable from "@rms/widgets/table/employee-table";

export default async function page() {
  const config_id = await getConfigId();

  var value: Prisma.EmployeeGetPayload<{}>[] = await prisma.employee.findMany({
    where: {
      config_id,
      status: await getUserStatus(),
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div>
      <EmployeesTable employees={value} />
    </div>
  );
}

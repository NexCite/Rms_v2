import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import EmployeesTable from "@rms/widgets/table/employee-table";

export default async function page() {
  const info = await getUserFullInfo();
  const userStates = getUserStatus(info.user);
  var value: Prisma.EmployeeGetPayload<{}>[] = await prisma.employee.findMany({
    where: {
      config_id: info.config.id,
      status: userStates,
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

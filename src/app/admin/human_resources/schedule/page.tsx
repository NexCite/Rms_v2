import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getConfigId } from "@rms/lib/config";

export default async function page() {
  const config_id = await getConfigId();

  // var value: Prisma.EmployeeGetPayload<{}>[] = await prisma.employee.findMany({
  //   where: {
  //     config_id,
  //     status: await getUserStatus(),
  //   },
  //   orderBy: {
  //     id: "desc",
  //   },
  // });

  return <div>{/* <EmployeesTable employees={value} /> */}</div>;
}

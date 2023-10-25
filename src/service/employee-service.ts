"use server";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

export async function createEmployee(
  props: Prisma.EmployeeUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;

      await prisma.employee.create({ data: props });
      return;
    },
    "Add_Employee",
    true,
    props
  );
}

export async function updateEmployee(
  id: number,
  props: Prisma.EmployeeUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.EmployeeUpdateInput>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;

      return await prisma.employee.update({ data: props, where: { id } });
    },
    "Edit_Employee",
    true,
    props
  );
}

export async function deleteEmployeeById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.employee.delete({ where: { id: id, config_id } });

      return;
    },
    "Delete_Employee",
    true,
    { id }
  );
}

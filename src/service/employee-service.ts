"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
/**
 *
 * Done
 *
 */
export async function createEmployee(
  props: Prisma.EmployeeUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      await prisma.employee.create({ data: props });
      return;
    },
    "Add_Employee",
    true,
    props
  );
}

/**
 *
 * Done
 *
 */
export async function updateEmployee(
  id: number,
  props: Prisma.EmployeeUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      return await prisma.employee.update({ data: props, where: { id } });
    },
    "Edit_Employee",
    true,
    props
  );
}

/**
 *
 * Done
 *
 */
export async function deleteEmployeeById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.employee.delete({ where: { id: id, config_id } });
      return;
    },
    "Delete_Employee",
    true,
    { id }
  );
}
export async function resetEmployee(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.employee.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}

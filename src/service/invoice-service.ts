"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@nexcite/lib/handler";
import ServiceActionModel from "@nexcite/models/ServiceActionModel";
import prisma from "@nexcite/prisma/prisma";

export async function createInvoice(
  props: Prisma.InvoiceUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      await prisma.invoice.create({ data: props });

      return;
    },
    "Create_Invoice",
    {
      update: true,
    }
  );
}

export async function updateInvoice(
  id: number,
  props: Prisma.InvoiceUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      var invoice = await prisma.invoice.findFirst({
        where: { id },

        include: {
          payments: { select: { amount: true } },
        },
      });

      var sum = 0;

      invoice.payments.forEach((e) => {
        sum += e.amount;
      });
      if (+props.amount - sum < 0) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Amount  must be  greater then payment amounts",
          { clientVersion: "1", code: "", meta: { target: ["amount"] } }
        );
      }

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: props,
      });
      return;
    },

    "Update_Invoice",
    {
      update: true,
    }
  );
}

export async function deleteInvoiceById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.invoice.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.invoice.delete({ where: { id: id,config_id } });
      // } else {
      //   await prisma.invoice.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted" },
      //   });
      // }

      return;
    },
    "Delete_Invoice",
    { update: true }
  );
}
export async function resetInvoice(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.invoice.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    {
      update: true,
    }
  );
}

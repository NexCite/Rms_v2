"use server";

import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import { getMediaType } from "@rms/lib/media";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createInvoice(
  props: Prisma.InvoiceUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      props.user_id = auth.id;

      await prisma.invoice.create({ data: props });

      return;
    },
    "Add_Invoice",
    true,
    props
  );
}

export async function updateInvoice(
  id: number,
  props: Prisma.InvoiceUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user_id = auth.id;

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

    "Edit_Invoice",
    true,
    props
  );
}

export async function deleteInvoiceById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      await prisma.invoice.delete({ where: { id: id } });

      // if (auth.type === "Admin") {
      //   await prisma.invoice.delete({ where: { id: id } });
      // } else {
      //   await prisma.invoice.update({
      //     where: { id: id },
      //     data: { status: "Deleted" },
      //   });
      // }

      return;
    },
    "Delete_Invoice",
    true,
    { id }
  );
}

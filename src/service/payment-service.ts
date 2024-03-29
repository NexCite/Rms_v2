"use server";
import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@nexcite/lib/handler";
import ServiceActionModel from "@nexcite/models/ServiceActionModel";
import prisma from "@nexcite/prisma/prisma";

export async function createPayment(
  props: Prisma.PaymentUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      var invoice = await prisma.invoice.findFirst({
        where: {
          id: props.invoice_id,
          config_id,
          payments: { every: { status: "Enable" } },
        },
        select: {
          amount: true,
          payments: { select: { amount: true } },
        },
      });
      var sum = 0;

      invoice.payments.forEach((e) => {
        sum += e.amount;
      });
      if (invoice.amount < sum + props.amount) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Amount greater then invoice amount",
          { clientVersion: "1", code: "", meta: { target: ["amount"] } }
        );
      }

      // const media = props.media as any;
      props.status = "Enable";

      // delete props.media;

      // if (media) {
      //   media.type = getMediaType(media.path);

      //   (props as any).media = { create: media };
      // }
      await prisma.payment.create({
        data: props,
      });

      return;
    },
    "Create_Payment",
    {
      update: true,
    }
  );
}

export async function updatePayment(
  id: number,
  props: Prisma.PaymentUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      var invoice = await prisma.invoice.findFirst({
        where: {
          config_id,
          id: +props.invoice_id,
          payments: { every: { status: "Enable" } },
        },
        select: {
          amount: true,
          payments: { select: { amount: true, id: true } },
        },
      });

      var sum = 0;
      if (invoice !== null) {
        invoice.payments.forEach((e) => {
          if (e.id === id) {
            return;
          }
          sum += e.amount;
        });
        if (invoice.amount < +props.amount + sum) {
          throw new Prisma.PrismaClientKnownRequestError(
            "Amount greater then invoice amount",
            { clientVersion: "1", code: "", meta: { target: ["amount"] } }
          );
        }
      } else {
        var invoice = await prisma.invoice.findFirst({
          where: {
            id: +props.invoice_id,
            config_id,
          },
          select: {
            amount: true,
            payments: { select: { amount: true, id: true } },
          },
        });
        if (invoice.amount < +props.amount) {
          throw new Prisma.PrismaClientKnownRequestError(
            "Amount greater then invoice amount",
            { clientVersion: "1", code: "", meta: { target: ["amount"] } }
          );
        }
      }

      var payment = await prisma.payment.findFirst({
        where: { id, config_id },
        include: {
          media: {
            select: { path: true, title: true, type: true, status: true },
          },
        },
      });

      await prisma.payment.update({
        where: { id: payment.id, config_id },
        data: props,
      });

      return;

      // if (props.media == null || undefined) {
      //   return prisma.payment.update({
      //     where: { id: payment.id },
      //     data: {
      //       invoice_id: props.invoice_id,
      //       amount: props.amount,
      //       note: props.note,
      //       description: props.description,
      //       status: props.status,
      //       user_id: props.user_id,
      //       type: props.type,
      //       number_id: props.number_id,
      //       modified_date: new Date(),
      //     },
      //   });
      // }

      // if ((payment.media === null && props.media !== null) || undefined) {
      //   (props as any).media = {
      //     create: {
      //       title: props.media.title,
      //       path: props.media.path,
      //       type: getMediaType(props.media.path),
      //     },
      //   };

      //   return await prisma.payment.update({
      //     where: { id },
      //     data: {
      //       invoice_id: props.invoice_id,
      //       amount: props.amount,
      //       note: props.note,
      //       description: props.description,
      //       status: props.status,
      //       user_id: props.user_id,
      //       type: props.type,
      //       number_id: props.number_id,
      //       modified_date: new Date(),
      //       media: props.media as any,
      //     },
      //   });
      // }

      // if (payment.media !== null) {
      //   (props as any).media = {
      //     update: {
      //       title: props.media.title,
      //       path: props.media.path,
      //       type: getMediaType(props.media.path),
      //       modified_date: new Date(),
      //     },
      //   };
      //   return await prisma.payment.update({
      //     where: { id },
      //     data: {
      //       invoice_id: props.invoice_id,
      //       amount: props.amount,
      //       note: props.note,
      //       description: props.description,
      //       status: props.status,
      //       user_id: props.user_id,
      //       type: props.type,
      //       number_id: props.number_id,
      //       modified_date: new Date(),

      //       media: props.media as any,
      //     },
      //   });
      // }
    },
    "Update_Payment",
    {
      update: true,
    }
  );
}

export async function deletePaymentById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.payment.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.payment.delete({ where: { id: id,config_id } });
      // } else {
      //   await prisma.payment.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted" },
      //   });
      // }

      return;
    },
    "Delete_Payment",
    { update: true }
  );
}
export async function resetPayment(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.payment.update({
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

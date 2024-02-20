"use server";

import { FileMapper } from "@nexcite/lib/common";
import { handlerServiceAction } from "@nexcite/lib/handler";
import prisma from "@nexcite/prisma/prisma";
import { JournalInputSchema } from "@nexcite/schema/JournalVoucherSchema";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

export async function findVoucherItemsService(props: { id: number }) {
  return await handlerServiceAction(async (user, config_id) => {
    const result = await prisma.voucher.findUnique({
      where: { id: props.id, config_id },
      include: {
        currency: true,
        voucher_items: {
          include: {
            chart_of_account: true,
            reference_chart_of_account: true,
          },
        },
      },
    });

    var voucher: JournalInputSchema = {
      currency: {
        id: result.currency.id,
        name: result.currency.name,
        rate: result.currency.rate,
        symbol: result.currency.symbol,
      },
      description: result.description,
      note: result.note,
      title: result.title,
      rate: result.rate,
      to_date: result.to_date,
      voucher_items: result.voucher_items.map((res) => ({
        amount: res.amount,
        chart_of_account: res.chart_of_account,
        reference_chart_of_account: res.reference_chart_of_account,
        debit_credit: res.debit_credit,
        rate: res.rate,
      })),
    };

    return voucher;
  }, "View_Voucher");
}

export async function findVoucherService(props: {
  id?: number;
  date?: { from: Date; to: Date };
}) {
  return handlerServiceAction(
    async (user, config_id) => {
      return prisma.voucher.findMany({
        orderBy: { id: "desc" },

        where: {
          config_id,
          id: props.id || undefined,

          to_date: props.id
            ? undefined
            : {
                gte: dayjs(props.date.from).startOf("day").toDate(),
                lte: dayjs(props.date.to).endOf("day").toDate(),
              },
        },

        include: {
          _count: true,
          currency: true,
          user: true,
          voucher_items: {
            include: {
              reference_chart_of_account: {
                select: {
                  name: true,
                  id: true,
                  account_type: true,
                  first_name: true,
                  last_name: true,
                  currency: {
                    select: {
                      name: true,
                      symbol: true,
                      rate: true,
                    },
                  },
                },
              },
              chart_of_account: {
                select: {
                  name: true,
                  id: true,
                  account_type: true,
                  first_name: true,
                  last_name: true,
                  currency: {
                    select: {
                      name: true,
                      symbol: true,
                      rate: true,
                    },
                  },
                },
              },
              currency: true,
            },
          },
        },
      });
    },

    "View_Voucher"
  );
}

export async function findVouchersService(props: { from: Date; to: Date }) {
  return handlerServiceAction(async (user, config_id) => {
    return prisma.voucher.findFirst({
      orderBy: { id: "desc" },

      where: { config_id },
      include: {
        currency: true,
      },
    });
  }, "View_Vouchers");
}

export async function deleteVoucherService(props: { id: number }) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id } = props;

      await prisma.$transaction([
        prisma.voucherItem.deleteMany({
          where: { voucher_id: id },
        }),
        prisma.voucher.delete({
          where: { id, config_id },
        }),
      ]);
    },
    "Delete_Voucher",
    {
      update: true,
      body: props,
    }
  );
}

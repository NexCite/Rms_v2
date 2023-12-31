"use server";

import { Prisma } from "@prisma/client";
import { FileMapper } from "@rms/lib/common";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import {
  JournalVoucherInputSchema,
  VoucherSearchSchema,
} from "@rms/widgets/schema/journal-voucher";
import dayjs from "dayjs";

export async function findVoucherItemsService(props: { id: number }) {
  return await handlerServiceAction(
    async (user, config_id) => {
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

      var voucher: JournalVoucherInputSchema = {
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
          reffrence_chart_of_account: res.reference_chart_of_account,
          debit_credit: res.debit_credit,
          rate: res.rate,
        })),
      };

      return voucher;
    },
    "View_Voucher",
    false,
    {}
  );
}

export async function findVoucherService(props: VoucherSearchSchema) {
  return handlerServiceAction(
    async (user, config_id) => {
      return prisma.voucher.findMany({
        where: {
          config_id,
          id: props.id || undefined,

          AND: props.id
            ? undefined
            : [
                {
                  to_date: {
                    gte: dayjs(props.from).startOf("d").toDate(),
                  },
                },
                {
                  to_date: {
                    lte: dayjs(props.to).endOf("d").toDate(),
                  },
                },
              ],
        },

        include: {
          _count: true,
          currency: true,

          voucher_items: {
            include: {
              reference_chart_of_account: {
                select: {
                  name: true,
                  id: true,
                  account_type: true,
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

    "View_Voucher",
    false,
    {}
  );
}

export async function findVouchersService(props: { from: Date; to: Date }) {
  return handlerServiceAction(
    async (user, config_id) => {
      return prisma.voucher.findFirst({
        where: { config_id },
        include: {
          currency: true,
        },
      });
    },
    "View_Vouchers",
    false,
    props
  );
}

export async function createVoucherService(props: {
  voucher: JournalVoucherInputSchema;
  file?: FormData;
}) {
  return handlerServiceAction(
    async (user, config_id) => {
      var media: Prisma.MediaGetPayload<{}>;

      const { voucher, file } = props;

      const currency = await prisma.currency.findUnique({
        where: { id: voucher.currency.id },
      });

      voucher.voucher_items = voucher.voucher_items.map((res) => {
        if (res.reffrence_chart_of_account?.currency) {
          res.rate = res.reffrence_chart_of_account.currency.rate;
          res.currency = res.reffrence_chart_of_account.currency;
        } else if (res.chart_of_account.currency) {
          res.rate = res.chart_of_account.currency.rate;
          res.currency = res.chart_of_account.currency;
        } else {
          res.rate = currency.rate;
          res.currency = currency;
        }

        return res;
      });

      if (file) {
        voucher.media = {
          create: await FileMapper({
            config_id,
            file: file,
            title: voucher.title,
          }),
        };
      }

      return await prisma.voucher.create({
        data: {
          description: voucher.description,
          title: voucher.title,
          note: voucher.note,
          config_id: config_id,
          currency_id: currency.id,
          to_date: voucher.to_date,
          voucher_items: {
            createMany: {
              data: voucher.voucher_items.map((res) => ({
                amount: res.amount,
                debit_credit: res.debit_credit,
                currency_id: res.currency?.id ?? currency.id,
                chart_of_account_id: res.chart_of_account.id,
                reffrence_chart_of_account_id:
                  res.reffrence_chart_of_account?.id,
                rate: res.rate,
              })),
            },
          },

          user_id: user.user.id,
        },
      });
    },
    "Add_Voucher",
    true,
    props
  );
}
export async function updateVoucherService(props: {
  voucher: JournalVoucherInputSchema;

  id: number;
  media?: Prisma.MediaGetPayload<{}>;
  file?: FormData;
}) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { voucher, file, media } = props;
      voucher.config_id = config_id;

      if (file) {
        voucher.media = {
          create: await FileMapper({
            config_id,
            file: file,
            title: voucher.title as string,
          }),
        };
      }

      await prisma.voucherItem.deleteMany({
        where: { voucher: { config_id, id: props.id } },
      });

      const currency = await prisma.currency.findUnique({
        where: { id: voucher.currency.id },
      });

      voucher.voucher_items = voucher.voucher_items.map((res) => {
        if (res.reffrence_chart_of_account?.currency) {
          res.rate = res.reffrence_chart_of_account.currency.rate;
          res.currency = res.reffrence_chart_of_account.currency;
        } else if (res.chart_of_account.currency) {
          res.rate = res.chart_of_account.currency.rate;
          res.currency = res.chart_of_account.currency;
        } else {
          res.rate = currency.rate;
          res.currency = currency;
        }

        return res;
      });

      await prisma.$transaction([
        // prisma.media.delete({ where: { id: media.id } }),
        prisma.voucher.update({
          data: {
            description: voucher.description,
            title: voucher.title,
            note: voucher.note,
            config_id: config_id,
            currency_id: voucher.currency.id,
            to_date: voucher.to_date,
            voucher_items: {
              createMany: {
                data: voucher.voucher_items.map((res) => ({
                  amount: res.amount,
                  debit_credit: res.debit_credit,
                  currency_id: res.currency?.id ?? currency.id,
                  chart_of_account_id: res.chart_of_account.id,
                  reffrence_chart_of_account_id:
                    res.reffrence_chart_of_account?.id,
                  rate: res.rate,
                })),
              },
            },

            user_id: user.user.id,
          },
          where: { id: props.id },
        }),
      ]);
    },
    "Edit_Level",
    true,
    props
  );
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
    "Edit_Level",
    true,
    props
  );
}

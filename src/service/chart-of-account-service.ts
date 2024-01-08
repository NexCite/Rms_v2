"use server";

import { Prisma } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import { groupChartOfAccountByParentId } from "@rms/lib/global";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import {
  ChartOfAccountInputSchema,
  ChartOfAccountSearchSchema,
} from "@rms/widgets/schema/chart-of-account";
import dayjs from "dayjs";
import { z } from "zod";
export async function findChartOfAccountService() {
  return handlerServiceAction(
    async (user, config_id) => {
      var chartOfAccounts = await prisma.chartOfAccount.findMany({
        orderBy: { id: "asc" },
        where: { config_id },
        include: { currency: true },
      });

      return chartOfAccounts;
    },
    "View_Chart_Of_Accounts",
    false
  );
}

export async function findChartOfAccountByGrouping(
  params: ChartOfAccountSearchSchema,
  withGroup?: boolean
) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id, from, to, include_reffrence, type, classLevel } = params;

      console.log(classLevel);
      var chartOfAccounts = await prisma.chartOfAccount.findMany({
        where: {
          config_id,
          class:
            classLevel.length > 0
              ? {
                  in: classLevel,
                }
              : undefined,
          id: id
            ? {
                startsWith: id,
              }
            : undefined,
        },
        include: {
          currency: true,

          voucher_items: {
            where: {
              voucher: {
                to_date: { gte: from, lte: to },
              },
            },
            include: {
              currency: true,
            },
          },
          // reffrence_voucher_items: include_reffrence
          //   ? {
          //       include: {
          //         currency: true,
          //       },
          //     }
          //   : undefined,
        },
      });

      if (withGroup) {
        const groupedTabls = groupChartOfAccountByParentId(chartOfAccounts);
        return {
          chartOfAccounts,
          groupedTabls,
        };
      } else {
        return {
          chartOfAccounts,
        };
      }
    },
    "View_Chart_Of_Accounts",
    false
  );
}

export async function findChartOfAccounts(props: ChartOfAccountSearchSchema) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id, from, to, include_reffrence, type } = props;
      return prisma.chartOfAccount.findMany({
        where: {
          config_id,
          account_type: type,
          id: id
            ? {
                startsWith: id,
              }
            : undefined,
        },
        include: {
          currency: true,
          voucher_items: {
            where: {
              voucher: {
                to_date: { gte: from, lte: to },
              },
            },
            include: {
              currency: true,
              voucher: { include: { currency: true } },
            },
          },
          reffrence_voucher_items: !include_reffrence
            ? {
                where: {
                  voucher: {
                    to_date: { gte: from, lte: to },
                  },
                },
                include: {
                  voucher: {
                    include: { currency: true },
                  },
                  currency: true,
                },
              }
            : undefined,
        },
      });
    },
    "View_Levels",
    false,
    {}
  );
}
export async function findChartOfAccountForAccountsServiceGrouded(
  params: ChartOfAccountSearchSchema
) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { accountId, from, to, classLevel } = params;
      var result = await prisma.chartOfAccount.findMany({
        where: {
          account_type: null,
          class: classLevel.length > 0 ? { in: classLevel } : undefined,
        },
        include: {
          voucher_items: {
            where: {
              voucher: null,
            },
            include: {
              voucher: {
                where: {
                  voucher_items: {
                    some: {
                      chart_of_account_id: accountId,
                    },
                  },
                },
                include: { currency: true },
              },
              currency: true,
            },
          },
        },
      });
      const resultData = await findChartOfAccountByClientId({
        id: params.accountId,
        from: params.from,
        to: params.to,
        classLevel: params.classLevel,
      });
      result = result.map((res) => {
        const voucher_items: typeof res.voucher_items = [];
        resultData.result.voucher.map((e) => {
          voucher_items.push(...(e.voucher_items as any));
        });
        res.voucher_items = voucher_items.filter(
          (ress) =>
            ress.chart_of_account_id === res.id ||
            ress.reffrence_chart_of_account_id === res.id
        );

        return res;
      });
      return groupChartOfAccountByParentId(result);
    },
    "View_Chart_Of_Accounts",
    false,
    {}
  );
}
export async function findChartOfAccountByClientId(
  props: ChartOfAccountSearchSchema
) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id, from, to, include_reffrence, type } = props;
      const chartOfAccount = await prisma.chartOfAccount.findUnique({
        where: { id: id, config_id: config_id },
        include: { currency: true },
      });
      const voucher = await prisma.voucher.findMany({
        where: {
          config_id,
          to_date: { gte: from, lte: to },
          voucher_items: {
            some: include_reffrence
              ? {
                  OR: [
                    {
                      chart_of_account_id: id,
                    },
                    {
                      reffrence_chart_of_account_id: id,
                    },
                  ],
                }
              : {
                  chart_of_account_id: id,
                },
          },
        },
        include: {
          currency: true,
          voucher_items: {
            include: {
              currency: true,
              chart_of_account: true,
              reference_chart_of_account: true,
            },
          },
        },
      });
      return { chartOfAccount, voucher };
    },
    "View_Chart_Of_Account",
    false,
    {}
  );
}
export async function findLevelService(props: { id: string }) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id } = props;

      return prisma.chartOfAccount.findFirst({
        where: { id, config_id },
        include: {
          currency: true,
        },
      });
    },
    "View_Level",
    true,
    props
  );
}

export async function createChartOfAccountService(props: {
  chartOfAccount: ChartOfAccountInputSchema;
}) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { chartOfAccount } = props;

      return await prisma.chartOfAccount.create({
        data: {
          name: chartOfAccount.name,
          account_type: chartOfAccount.account_type,
          address: chartOfAccount.address,
          last_name: chartOfAccount.last_name,
          first_name: chartOfAccount.first_name,
          business_id: chartOfAccount.business_id,
          chart_of_account_type: chartOfAccount.chart_of_account_type,
          country: chartOfAccount.country,
          limit_amount: chartOfAccount.limit_amount,
          parent_id: chartOfAccount.parent_id,
          phone_number: chartOfAccount.phone_number,
          email: chartOfAccount.email,
          class: chartOfAccount.id[0],
          config_id,
          id: chartOfAccount.id,
        },
      });
    },
    "Add_Chart_Of_Account",
    true,
    props
  );
}

export async function updateChartOfAccountService(props: {
  chartOfAccount: ChartOfAccountInputSchema;
  id: string;
}) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { chartOfAccount, id } = props;

      return await prisma.chartOfAccount.update({
        where: { id: id },
        data: {
          name: chartOfAccount.name,
          account_type: chartOfAccount.account_type,
          address: chartOfAccount.address,
          last_name: chartOfAccount.last_name,
          first_name: chartOfAccount.first_name,
          business_id: chartOfAccount.business_id,
          chart_of_account_type: chartOfAccount.chart_of_account_type,
          country: chartOfAccount.country,
          limit_amount: chartOfAccount.limit_amount,
          parent_id: chartOfAccount.parent_id,
          phone_number: chartOfAccount.phone_number,
          email: chartOfAccount.email,
          class: chartOfAccount.id[0],
          debit_credit: chartOfAccount.debit_credit,
          currency_id: chartOfAccount.currency_id,
          config_id,
          id: chartOfAccount.id,
        },
      });
    },
    "Edit_Chart_Of_Account",
    true,
    props
  );
}

export async function deleteLevelService(props: { id: string }) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id } = props;

      prisma.chartOfAccount.delete({
        where: { id, config_id },
      });
    },
    "Edit_Level",
    true,
    props
  );
}

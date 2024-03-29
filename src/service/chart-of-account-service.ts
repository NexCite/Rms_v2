"use server";
import { ChartOfAccountInclude } from "@nexcite/Interfaces/IChartOfAccount";
import {
  groupChartOfAccount,
  groupChartOfAccountByParentId,
} from "@nexcite/lib/global";
import { handlerServiceAction } from "@nexcite/lib/handler";
import prisma from "@nexcite/prisma/prisma";
import {
  ChartOfAccountInputSchema,
  ChartOfAccountSearchSchema,
} from "@nexcite/schema/ChartOfAccountSchema";

/**
 * Find all chart of accounts based on the provided configuration ID.
 *
 * @returns A list of chart of accounts.
 */
export async function findChartOfAccountService() {
  return handlerServiceAction(async (user, config_id) => {
    const chartOfAccounts = await prisma.chartOfAccount.findMany({
      orderBy: { id: "desc" },
      where: { config_id },
      include: { currency: true },
    });

    return chartOfAccounts;
  }, "View_Chart_Of_Accounts");
}

/**
 * Find chart of accounts based on the provided search criteria.
 *
 * @param props - Search criteria for chart of accounts.
 * @returns Matching chart of accounts.
 */
export async function findChartOfAccounts(props: ChartOfAccountSearchSchema) {
  return handlerServiceAction(async (user, config_id) => {
    const { id, from, to, include_reference, type } = props;
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
        reference_voucher_items: !include_reference
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
      orderBy: { id: "desc" },
    });
  }, "View_Chart_Of_Accounts");
}

/**
 * Find a chart of account and associated vouchers based on client ID and search criteria.
 *
 * @param props - Search criteria for chart of accounts.
 * @returns The chart of account and associated vouchers.
 */

export async function findChartOfAccountByClientId(
  props: ChartOfAccountSearchSchema
) {
  return handlerServiceAction(async (user, config_id) => {
    const { id, from, to, include_reference, type } = props;
    const chartOfAccount = await prisma.chartOfAccount.findUnique({
      where: { id: id, config_id: config_id },
      include: { currency: true },
    });

    const vouchers = await prisma.voucher.findMany({
      orderBy: { id: "desc" },

      where: {
        config_id,
        to_date: { gte: from, lte: to },
        AND: id
          ? [
              {
                voucher_items: {
                  some: {
                    OR: [
                      {
                        chart_of_account_id: id,
                      },
                      {
                        reference_chart_of_account_id: id,
                      },
                    ],
                  },
                },
              },
            ]
          : [],
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
    return { chartOfAccount, vouchers };
  }, "View_Chart_Of_Account");
}

/**
 * Find a chart of account by ID.
 *
 * @param props - Search criteria containing the ID.
 * @returns The found chart of account.
 */
export async function findLevelService(props: { id: string }) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { id } = props;
      return prisma.chartOfAccount.findFirst({
        orderBy: { id: "desc" },

        where: { id, config_id },
        include: {
          currency: true,
        },
      });
    },
    "View_Chart_Of_Account",
    {
      update: true,
      body: props,
    }
  );
}

/**
 * Create a new chart of account based on the provided properties.
 *
 * @param props - Properties for creating a new chart of account.
 * @returns The created chart of account.
 */
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
          config_id,
          debit_credit: chartOfAccount.debit_credit,
          class: chartOfAccount.id[0],

          currency_id: chartOfAccount.currency_id,
          id: chartOfAccount.id,
        },
      });
    },
    "Create_Chart_Of_Account",
    {
      update: true,
      body: props,
    }
  );
}

/**
 * Update an existing chart of account based on the provided properties and ID.
 *
 * @param props - Properties for updating the chart of account.
 * @returns The updated chart of account.
 */
export async function updateChartOfAccountService(props: {
  chartOfAccount: ChartOfAccountInputSchema;
  id: string;
}) {
  return handlerServiceAction(
    async (user, config_id) => {
      const { chartOfAccount, id } = props;
      return await prisma.chartOfAccount.update({
        where: { id: id, config_id: config_id },
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
          currency_id: chartOfAccount.currency_id,
          debit_credit: chartOfAccount.debit_credit,
          id: chartOfAccount.id,
        },
      });
    },
    "Update_Chart_Of_Account",
    {
      update: true,
      body: props,
    }
  );
}

/**
 * Find balance sheet based on the provided parameters and optionally with grouping.
 *
 * @param params - Parameters for finding the balance sheet.
 * @param withGroup - Whether to include grouping information.
 * @returns The balance sheet data.
 */
export async function findBalanceSheet(params: ChartOfAccountSearchSchema) {
  return handlerServiceAction(async (user, config_id) => {
    const { from, to, classes } = params;
    const chartOfAccounts = await prisma.chartOfAccount.findMany({
      orderBy: { id: "desc" },

      where: {
        config_id,
        class:
          classes.length > 0
            ? {
                in: classes,
              }
            : undefined,
      },
      include: {
        currency: true,
        reference_voucher_items: {
          include: {
            currency: true,
          },
          where: {
            voucher: {
              to_date: { gte: from, lte: to },
            },
          },
        },
        voucher_items: {
          where: {
            voucher: {
              to_date: { gte: from, lte: to },
            },
          },
          include: {
            currency: true,

            voucher: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    });

    return groupChartOfAccountByParentId(chartOfAccounts);
  }, "View_Chart_Of_Accounts");
}

/**
 * Delete a chart of account based on the provided ID.
 *
 * @param id - The ID of the chart of account to delete.
 * @returns The deleted chart of account.
 */
export async function deleteChartOfAccountService(id: string) {
  return handlerServiceAction(
    async (user, config_id) => {
      return await prisma.chartOfAccount.delete({
        where: { id: id },
      });
    },
    "Delete_Chart_Of_Account",
    {
      update: true,
      body: { id },
    }
  );
}

export async function findChartOfAccountVouchers() {
  const result = await prisma.chartOfAccount.findMany({
    include: ChartOfAccountInclude,
  });
  return groupChartOfAccount(result);
}

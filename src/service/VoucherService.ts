"use server";
import IChartOfAccount, {
  ChartOfAccountInclude,
  ChartOfAccountIncludeWithDateFilter,
  IChartOfAccountGrouped,
} from "@nexcite/Interfaces/IChartOfAccount";
import IResponse from "@nexcite/Interfaces/IResponse";
import IVoucher, { VoucherInclude } from "@nexcite/Interfaces/IVoucher";
import HandleResponse from "@nexcite/decorators/HandleResponse";
import { groupChartOfAccount, searchParamsMapper } from "@nexcite/lib/global";
import prisma from "@nexcite/prisma/prisma";
import {
  VoucherInputSchema,
  VoucherItemInputSchema,
} from "@nexcite/schema/VoucherSchema";
import { $Enums } from "@prisma/client";
import dayjs from "dayjs";
import { headers } from "next/headers";
import getAuth from "./user-service";

class VoucherSerivce {
  @HandleResponse({ permission: "View_Chart_Of_Accounts" })
  static async findVoucherV1(
    config_id: number,
    node?: $Enums.AccountType
  ): Promise<IResponse<IChartOfAccount[]>> {
    return {
      body: await prisma.chartOfAccount.findMany({
        where: {
          config_id,
          account_type: {
            equals: node?.replace(node[0], node[0].toUpperCase()) as any,
          },
        },
        orderBy: { id: node ? "desc" : "asc" },
        include: ChartOfAccountInclude,
      }),
      status: 200,
    };
  }
  @HandleResponse({ permission: "View_Vouchers" })
  static async findVouchers(config_id: number): Promise<IResponse<IVoucher[]>> {
    "use server";
    const url = new URL(headers().get("next-url"));
    const searchParams = searchParamsMapper(url.searchParams);
    const vouchers = await prisma.voucher.findMany({
      where: {
        config_id,
        to_date: {
          gte: dayjs(searchParams.from).startOf("day").toDate(),
          lte: dayjs(searchParams.to).endOf("day").toDate(),
        },
      },
      orderBy: {
        id: "desc",
      },
      include: VoucherInclude,
    });

    return {
      body: vouchers,
      status: 200,
    };
  }
  @HandleResponse({ permission: "View_Voucher" })
  static async findVoucherById(
    config_id: number
  ): Promise<IResponse<IVoucher>> {
    "use server";
    const url = new URL(headers().get("next-url"));
    const searchParams = searchParamsMapper(url.searchParams, true);

    return {
      body: await prisma.voucher.findUnique({
        where: {
          config_id,
          id: searchParams.id as number,
        },

        include: VoucherInclude,
      }),
      status: 200,
    };
  }
  @HandleResponse({
    permission: "Create_Voucher",
    paths: [
      "/admin/accounting/journal_voucher",
      "/admin/accounting/journal_voucher/form",
      "/admin/accounting/trial_balance",
      "/admin/accounting/account/[node]",
      "/admin/accounting/chart_of_account",
      "/admin/accounting/chart_of_account/[id]",
    ],
  })
  static async createVoucher(props: {
    voucher: VoucherInputSchema;
    voucherItems: VoucherItemInputSchema;
  }): Promise<IResponse<{ id: number }>> {
    const auth = await getAuth();
    const { voucher } = props;

    const result = await prisma.voucher.create({
      data: {
        description: voucher.description,
        title: voucher.title,
        note: voucher.note,
        config_id: auth.config.id,
        currency_id: voucher.currency_id,
        to_date: voucher.to_date,
        voucher_items: {
          createMany: {
            data: props.voucherItems.map((res) => ({
              amount: res.amount,
              groupBy: res.groupBy,
              debit_credit: res.debit_credit,
              currency_id: res.currency_id,
              chart_of_account_id: res.chart_of_account_id,
              rate: res.rate,
            })),
          },
        },

        user_id: auth.user.id,
      },
    });
    return {
      body: {
        id: result.id,
      },
      status: 200,
      message: "Voucher Created Successfully",
    };
  }
  @HandleResponse({
    permission: "Update_Voucher",
    paths: [
      "/admin/accounting/journal_voucher",
      "/admin/accounting/journal_voucher/form",
      "/admin/accounting/trial_balance",
      "/admin/accounting/account/[node]",
      "/admin/accounting/chart_of_account",
      "/admin/accounting/chart_of_account/[id]",
    ],
  })
  static async updateVoucher(props: {
    id: number;
    voucher: VoucherInputSchema;
    voucherItems: VoucherItemInputSchema;
    // file?: FormData;
  }): Promise<IResponse<{ id: number }>> {
    const auth = await getAuth();
    const { voucher } = props;

    await prisma.voucherItem.deleteMany({
      where: { voucher_id: props.id },
    });
    const result = await prisma.voucher.update({
      data: {
        description: voucher.description,
        title: voucher.title,
        note: voucher.note,
        config_id: auth.config.id,
        currency_id: voucher.currency_id,
        to_date: voucher.to_date,
        voucher_items: {
          createMany: {
            data: props.voucherItems.map((res) => ({
              amount: res.amount,
              debit_credit: res.debit_credit,
              currency_id: voucher.currency_id,
              groupBy: res.groupBy,

              chart_of_account_id: res.chart_of_account_id,
              rate: res.rate,
            })),
          },
        },

        user_id: auth.user.id,
      },
      where: {
        id: props.id,
      },
    });
    return {
      body: {
        id: result.id,
      },
      status: 200,
      message: "Voucher Update Successfully",
    };
  }
  @HandleResponse({ permission: "View_Chart_Of_Accounts" })
  static async findGroupedChartOfAccountVouchersV1(
    props: { from: Date; to: Date },
    config_id?: number
  ): Promise<IResponse<IChartOfAccountGrouped[]>> {
    const result = await prisma.chartOfAccount.findMany({
      orderBy: { id: "asc" },
      where: {
        config_id,
      },

      include: ChartOfAccountIncludeWithDateFilter(props.from, props.to),
    });
    return {
      status: 200,
      body: groupChartOfAccount(result),
    };
  }
}

export const {
  findVoucherV1,
  findGroupedChartOfAccountVouchersV1,
  findVoucherById,
  findVouchers,
  createVoucher,
  updateVoucher,
} = VoucherSerivce;

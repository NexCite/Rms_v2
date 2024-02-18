"use server";
import IChartOfAccount, {
  ChartOfAccountInclude,
  ChartOfAccountIncludeWithDateFilter,
  IChartOfAccountGrouped,
} from "@nexcite/Interfaces/IChartOfAccount";
import IResponse from "@nexcite/Interfaces/IResponse";
import HandleResponse from "@nexcite/decorators/HandleResponse";
import { groupChartOfAccount, searchParamsMapper } from "@nexcite/lib/global";
import prisma from "@nexcite/prisma/prisma";
import { $Enums } from "@prisma/client";
import { headers } from "next/headers";

class CharOfAccountService {
  @HandleResponse({ permission: "View_Chart_Of_Accounts" })
  static async findChartOfAccountsV1(
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
  @HandleResponse({ permission: "View_Chart_Of_Accounts" })
  static async findChartOfAccountsByDigit(config_id: number): Promise<
    IResponse<
      (IChartOfAccount & {
        totalDebit?: number;
        totalCredit?: number;
      })[]
    >
  > {
    "use server";
    const url = new URL(headers().get("next-url"));
    const searchParams = searchParamsMapper(url.searchParams);
    const query = `SELECT * FROM "public"."ChartOfAccount" where LENGTH(id)=${parseInt(
      searchParams.digit ?? "0"
    )}  ${
      searchParams.classes.length > 0
        ? searchParams.classes
          ? `and  (${searchParams.classes
              .map((c) => `class = '${c}'`)
              .join(" OR ")})`
          : ""
        : ""
    }`;
    let chartOfAccounts = (await prisma.$queryRawUnsafe(
      query
    )) as (IChartOfAccount & {
      totalDebit: number;
      totalCredit: number;
    })[];
    chartOfAccounts = chartOfAccounts.map((res) => ({
      ...res,
      totalDebit: 0,
      totalCredit: 0,
    }));
    console.log(
      searchParams.from.toLocaleString(),
      searchParams.from.toLocaleTimeString(),
      searchParams.to.toLocaleString(),
      searchParams.to.toLocaleTimeString()
    );

    const voucherItems = await prisma.voucherItem.findMany({
      where: {
        voucher: {
          config_id,
          to_date: {
            gte: searchParams.from,
            lte: searchParams.to,
          },
        },

        OR: chartOfAccounts.map((res) => ({
          chart_of_account_id: { startsWith: res.id },
        })),
      },
      include: { currency: true },
    });

    voucherItems.forEach((item) => {
      if (item.debit_credit === "Debit") {
        chartOfAccounts.find((res) =>
          item.chart_of_account_id.startsWith(res.id)
        ).totalDebit += item.amount / (item.currency?.rate ?? 1);
      } else {
        chartOfAccounts.find((res) =>
          item.chart_of_account_id.startsWith(res.id)
        ).totalCredit += item.amount / (item.currency?.rate ?? 1);
      }
    });

    return {
      body: chartOfAccounts,
      status: 200,
    };
  }
  @HandleResponse({ permission: "View_Chart_Of_Account" })
  static async findChartOfAccountByIdV1(
    config_id: number,
    id: string
  ): Promise<IResponse<IChartOfAccount>> {
    "use server";

    return {
      body: await prisma.chartOfAccount.findUnique({
        where: {
          config_id,
          id,
        },

        include: ChartOfAccountInclude,
      }),
      status: 200,
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
  findChartOfAccountsV1,
  findGroupedChartOfAccountVouchersV1,
  findChartOfAccountByIdV1,
  findChartOfAccountsByDigit,
} = CharOfAccountService;

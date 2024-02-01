import { $Enums } from "@prisma/client";
import { ChartOfAccountInclude } from "@rms/Interfaces/IChartOfAccount";
import prisma from "@rms/prisma/prisma";

export default class CharOfAccountServiceV2 {
  static async findChartOfAccountsV2(
    config_id: number,
    node?: $Enums.AccountType
  ) {
    "use server";
    return prisma.chartOfAccount.findMany({
      where: {
        config_id,
        account_type: {
          equals: node?.replace(node[0], node[0].toUpperCase()) as any,
        },
      },
      orderBy: { id: node ? "desc" : "asc" },
      include: ChartOfAccountInclude,
    });
  }
}

export const { findChartOfAccountsV2 } = CharOfAccountServiceV2;

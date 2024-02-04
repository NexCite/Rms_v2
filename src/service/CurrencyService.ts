"use server";
import { $Enums } from "@prisma/client";
import {
  ChartOfAccountInclude,
  ChartOfAccountIncludeWithDateFilter,
} from "@nexcite/Interfaces/IChartOfAccount";
import ICurrency from "@nexcite/Interfaces/ICurrency";
import { groupChartOfAccount } from "@nexcite/lib/global";
import prisma from "@nexcite/prisma/prisma";
import HandleResponse from "@nexcite/decorators/HandleResponse";

class CurrencyService {
  @HandleResponse({ permission: "View_Currencies" })
  static async findCurrencies(config_id: number): Promise<ICurrency[]> {
    return prisma.currency.findMany({
      where: {
        config_id,
      },
      orderBy: { id: "desc" },
    });
  }
}

export const { findCurrencies } = CurrencyService;

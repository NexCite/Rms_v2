"use server";
import ICurrency from "@nexcite/Interfaces/ICurrency";
import IResponse from "@nexcite/Interfaces/IResponse";
import HandleResponse from "@nexcite/decorators/HandleResponse";
import prisma from "@nexcite/prisma/prisma";

class CurrencyService {
  @HandleResponse({})
  static async findCurrencies(
    config_id: number
  ): Promise<IResponse<ICurrency[]>> {
    return {
      body: await prisma.currency.findMany({
        where: {
          config_id,
        },
        orderBy: { id: "desc" },
      }),
      status: 200,
    };
  }
}

export const { findCurrencies } = CurrencyService;

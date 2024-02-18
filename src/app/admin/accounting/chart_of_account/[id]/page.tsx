import { $Enums } from "@prisma/client";
import prisma from "@nexcite/prisma/prisma";
import getAuth from "@nexcite/service/user-service";
import ChartOfAccountView from "@nexcite/widgets/view/ChartOfAccountView";
import dayjs from "dayjs";
import {
  findChartOfAccountByIdV1,
  findChartOfAccountsV1,
} from "@nexcite/service/ChartOfAccountService";
import { searchParamsMapper } from "@nexcite/lib/global";
import { headers } from "next/headers";

export default async function page(props: {
  params: { node: $Enums.AccountType; id: string };
  searchParams: { from?: string; to?: string };
}) {
  const auth = await getAuth();
  const url = new URL(headers().get("next-url"));

  const searchParams = searchParamsMapper(url.searchParams);

  const chartOfAccountsResult = await findChartOfAccountsV1(auth.config.id);
  const chartOfAccountResult = await findChartOfAccountByIdV1(
    auth.config.id,
    props.params.id
  );
  console.log(searchParams.from);
  const vouchers = await prisma.voucher.findMany({
    orderBy: {
      to_date: "desc",
    },
    where: {
      config_id: auth.config.id,
      to_date: {
        gte: searchParams.from,
        lte: searchParams.to,
      },

      voucher_items: {
        some: {
          OR: [
            {
              chart_of_account_id: {
                startsWith: props.params.id,
              },
            },
            {
              reference_chart_of_account_id: {
                startsWith: props.params.id,
              },
            },
          ],
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
  const currencies = await prisma.currency.findMany({
    where: { config_id: auth.config.id },
  });
  if (chartOfAccountResult.status === 200) {
    return (
      <ChartOfAccountView
        currencies={currencies}
        chartOfAccount={chartOfAccountResult.body}
        vouchers={vouchers}
        chartOfAccounts={chartOfAccountsResult.body}
        id={props.params.id}
      />
    );
  }
}

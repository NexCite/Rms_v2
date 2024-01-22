import { $Enums } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import getAuth from "@rms/service/user-service";
import ChartOfAccountView from "@rms/widgets/view/chart-of-account-view";

export default async function page(props: {
  params: { node: $Enums.AccountType; id: string };
  searchParams: {};
}) {
  const auth = await getAuth();
  const chartOfAccount = await prisma.chartOfAccount.findUnique({
    where: { id: props.params.id },
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
  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    where: {
      id: { not: props.params.id },
      account_type: chartOfAccount.account_type ? null : undefined,
    },

    include: {
      currency: true,
    },
  });
  const vouchers = await prisma.voucher.findMany({
    where: {
      config_id: auth.config.id,

      voucher_items: {
        some: {
          OR: [
            {
              chart_of_account_id: {
                startsWith: props.params.id,
              },
            },
            {
              reffrence_chart_of_account_id: {
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
  if (!chartOfAccount) {
    return <div>Not Found</div>;
  }
  return (
    <div>
      <ChartOfAccountView
        currencies={currencies}
        chartOfAccount={chartOfAccount}
        vouchers={vouchers}
        chartOfAccounts={chartOfAccounts}
        id={props.params.id}
      />
    </div>
  );
}

import { $Enums } from "@prisma/client";
import Loading from "@nexcite/components/other/loading";
import prisma from "@nexcite/prisma/prisma";
import { findChartOfAccountsV1 } from "@nexcite/service/ChartOfAccountService";
import { findChartOfAccountVouchers } from "@nexcite/service/chart-of-account-service";
import getAuth from "@nexcite/service/user-service";
import ChartOfAccountTable from "@nexcite/widgets/table/chart-of-account-table";
import { Suspense } from "react";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

export default async function page(props: {}) {
  const info = await getAuth();
  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  const parents = await prisma.chartOfAccount.findMany({
    where: { config_id: info.config.id, account_type: null },
  });
  const chartOfAccountResult = await findChartOfAccountsV1(info.config.id);
  if (chartOfAccountResult.status !== 200) {
    redirect(headers().get("url") + "/404", RedirectType.replace);
  }

  return (
    <Suspense fallback={<Loading />}>
      <ChartOfAccountTable
        data={chartOfAccountResult.body}
        currencies={currencies}
        parents={parents}
        node={null}
      />
    </Suspense>
  );
}

import Loading from "@nexcite/components/other/LoadingUi";
import prisma from "@nexcite/prisma/prisma";
import { findChartOfAccountsV1 } from "@nexcite/service/ChartOfAccountService";
import getAuth from "@nexcite/service/user-service";
import ChartOfAccountTable from "@nexcite/widgets/table/ChartOfAccountTable";
import { $Enums } from "@prisma/client";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { Suspense } from "react";

export default async function page(props: {
  params: {
    node: $Enums.AccountType;
  };
}) {
  const info = await getAuth();
  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  const parents = await prisma.chartOfAccount.findMany({
    where: { config_id: info.config.id, account_type: null },
  });
  const chartOfAccountResult = await findChartOfAccountsV1(
    info.config.id,
    props.params.node
  );
  if (chartOfAccountResult.status !== 200) {
    redirect(headers().get("next-url") + "/404", RedirectType.replace);
  }
  return (
    <Suspense fallback={<Loading />}>
      <ChartOfAccountTable
        data={chartOfAccountResult.body}
        currencies={currencies}
        parents={parents}
        node={props.params.node}
      />
    </Suspense>
  );
}

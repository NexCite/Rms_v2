import Loading from "@rms/components/other/loading";
import prisma from "@rms/prisma/prisma";
import { findChartOfAccountVouchers } from "@rms/service/chart-of-account-service";
import CharOfAccountServiceV2 from "@rms/service/chart-of-account-service-v2";
import getAuth from "@rms/service/user-service";
import ChartOfAccountTable from "@rms/widgets/table/chart-of-account-table";
import { Suspense } from "react";

export default async function page() {
  const info = await getAuth();
  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  const parents = await prisma.chartOfAccount.findMany({
    where: { config_id: info.config.id },
  });
  const chartOfAccounts = await CharOfAccountServiceV2.findChartOfAccountsV2(
    info.config.id
  );
  return (
    <Suspense fallback={<Loading />}>
      <ChartOfAccountTable
        data={chartOfAccounts}
        currencies={currencies}
        parents={parents}
        node={null}
      />
    </Suspense>
  );
}

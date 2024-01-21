import { $Enums } from "@prisma/client";
import Loading from "@rms/components/other/loading";
import prisma from "@rms/prisma/prisma";
import getAuth from "@rms/service/user-service";
import ChartOfAccountTable from "@rms/widgets/table/chart-of-account-table";
import { Suspense } from "react";

export default async function page(props: {
  params: { node: $Enums.Account_Entry_Type };
}) {
  const info = await getAuth();
  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  const parents = await prisma.chartOfAccount.findMany({
    where: { config_id: info.config.id },
  });
  return (
    <Suspense fallback={<Loading />}>
      <ChartOfAccountTable
        currencies={currencies}
        parents={parents}
        node={
          Object.keys($Enums.AccountType).find((e) =>
            props.params.node.startsWith(e.toLowerCase())
          ) as any
        }
      />
    </Suspense>
  );
}

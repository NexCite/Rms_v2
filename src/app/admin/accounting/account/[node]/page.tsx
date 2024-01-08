import { $Enums } from "@prisma/client";
import Loading from "@rms/components/ui/loading";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import getUserFullInfo from "@rms/service/user-service";
import Account_EntryTable from "@rms/widgets/table/account-entry-table";
import ChartOfAccountAccountsTable from "@rms/widgets/table/chart-of-account-table-account";
import { Suspense } from "react";

export default async function page(props: {
  params: { node: $Enums.Account_Entry_Type };
}) {
  const info = await getUserFullInfo();
  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  const parents = await prisma.chartOfAccount.findMany({
    where: { config_id: info.config.id },
  });
  return (
    <Suspense fallback={<Loading />}>
      <ChartOfAccountAccountsTable
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

import { $Enums } from "@prisma/client";
import Loading from "@rms/components/ui/loading";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import Account_EntryTable from "@rms/widgets/table/account-entry-table";
import ChartOfAccountAccountsTable from "@rms/widgets/table/char-of-account-table-account";
import { Suspense } from "react";

export default async function page(props: {
  params: { node: $Enums.Account_Entry_Type };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ChartOfAccountAccountsTable
        node={
          Object.keys($Enums.AccountType).find((e) =>
            props.params.node.startsWith(e.toLowerCase())
          ) as any
        }
      />
    </Suspense>
  );
}

import { $Enums, Prisma } from "@prisma/client";
import Loading from "@rms/components/ui/loading";

import prisma from "@rms/prisma/prisma";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import Account_EntryForm from "@rms/widgets/form/account-entry-form";
import { Suspense } from "react";
import CharOfAccountForm from "@rms/app/admin/accounting/chart_of_account/form/page";
export default async function page(props: { searchParams: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <CharOfAccountForm searchParams={props.searchParams} />
    </Suspense>
  );
}

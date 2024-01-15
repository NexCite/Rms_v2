import { $Enums } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import ChartOfAccountView from "@rms/widgets/view/chart-of-account-view";

export default async function page(props: {
  params: { node: $Enums.AccountType; id: string };
  searchParams: {};
}) {
  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    where: { id: { not: props.params.id } },
  });
  return (
    <div>
      <ChartOfAccountView
        chartOfAccounts={chartOfAccounts}
        id={props.params.id}
      />
    </div>
  );
}

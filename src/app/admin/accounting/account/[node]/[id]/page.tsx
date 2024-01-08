import { $Enums } from "@prisma/client";
import { findChartOfAccountByClientId } from "@rms/service/chart-of-account-service";
import ChartOfAccountView from "@rms/widgets/view/chart-of-account-view";
import React from "react";

export default async function page(props: {
  params: { node: $Enums.AccountType; id: string };
  searchParams: {};
}) {
  return (
    <div>
      <ChartOfAccountView id={props.params.id} />
    </div>
  );
}

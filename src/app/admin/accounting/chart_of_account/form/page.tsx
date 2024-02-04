import prisma from "@nexcite/prisma/prisma";
import getAuth from "@nexcite/service/user-service";
import ChartOfAccountForm from "@nexcite/widgets/form/chart-of-account-from";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

export default async function page(props: { searchParams: { id: string } }) {
  const isEditMode = props.searchParams.id ? true : false;
  const schema = z
    .object({
      id: z.coerce.number(),
    })
    .safeParse(props.searchParams);

  if (!schema.success && isEditMode) {
    return notFound();
  }
  const chartOfAccount = isEditMode
    ? await prisma.chartOfAccount.findUnique({
        where: { id: props.searchParams.id },
      })
    : undefined;

  const info = await getAuth();

  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  const parents = await prisma.chartOfAccount.findMany({
    orderBy: { id: "desc" },
    where: {
      account_type: null,
    },
  });
  const canEdit = chartOfAccount
    ? parents.find((res) => res.parent_id === chartOfAccount.id)
      ? false
      : true
    : true;

  if (!chartOfAccount && isEditMode) {
    return notFound();
  }

  return (
    <div className="max-w-[450px] w-full  mx-auto">
      <Suspense>
        <ChartOfAccountForm
          canEdit={canEdit}
          currencies={currencies}
          parents={parents}
          chart_of_account={chartOfAccount}
        />
      </Suspense>
    </div>
  );
}

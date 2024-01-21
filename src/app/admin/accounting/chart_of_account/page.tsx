import { $Enums } from "@prisma/client";
import Loading from "@rms/components/other/loading";
import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import getAuth from "@rms/service/user-service";
import ChartOfAccountTable from "@rms/widgets/table/chart-of-account-table";
import { Suspense } from "react";

export default async function page() {
  // Array.from({ length: 10 }).map((res, index) => {
  //   result.forEach((res) => {
  //     delete res.id;
  //     m.push(res);
  //   });
  //   return res;
  // });

  // await prisma.voucher.createMany({ data: m });
  // console.log("done");
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
        node={null}
      />
    </Suspense>
  );
}

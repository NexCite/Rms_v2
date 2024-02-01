import prisma from "@rms/prisma/prisma";
import getAuth from "@rms/service/user-service";
import BalanceSheetTable from "@rms/widgets/table/balance-sheet-table";
import BalanceSheetTableTest from "@rms/widgets/table/test-table";

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

  return (
    <BalanceSheetTableTest
      currenices={await prisma.currency.findMany({
        where: { config_id: info.config.id },
      })}
    />
  );
}

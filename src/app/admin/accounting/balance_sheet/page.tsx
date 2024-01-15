import prisma from "@rms/prisma/prisma";
import getUserFullInfo from "@rms/service/user-service";
import BalanceSheetTable from "@rms/widgets/table/balance-sheet-table";

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
  const info = await getUserFullInfo();

  return (
    <BalanceSheetTable
      currenices={await prisma.currency.findMany({
        where: { config_id: info.config.id },
      })}
    />
  );
}

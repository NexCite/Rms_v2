import IVoucher, { IVoucherInclude } from "@rms/models/VoucherModel";
import prisma from "@rms/prisma/prisma";
import { userAuth } from "@rms/service/auth-service";
import JournalVoucherTable from "@rms/widgets/table/journal-voucher-table";
import dayjs from "dayjs";

export default async function page(props: {
  searchParams: { id: any; from: any; to: any };
}) {
  const auth = await userAuth();
  let { from, id, to } = props.searchParams;
  from = dayjs(from).startOf("D").toDate();
  to = dayjs(to).endOf("D").toDate();
  id = id ? parseInt(id) : undefined;

  const data = (await prisma.voucher.findMany({
    where: {
      config_id: auth.config.id,
      to_date: id
        ? undefined
        : {
            gte: from,
            lte: to,
          },
      id: id ? parseInt(id) : undefined,
    },
    include: IVoucherInclude,
    orderBy: {
      id: "desc",
    },
  })) as unknown as IVoucher[];
  console.log(Date.now());

  return (
    <div>
      <JournalVoucherTable
        config={{ logo: auth.config.logo, name: "" }}
        data={data}
        search={{
          from,
          to,
          id,
        }}
      />
    </div>
  );
}

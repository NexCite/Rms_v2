import IVoucher, { IVoucherInclude } from "@nexcite/models/VoucherModel";
import prisma from "@nexcite/prisma/prisma";
import { findVouchers } from "@nexcite/service/VoucherService";
import { userAuth } from "@nexcite/service/auth-service";
import JournalVoucherTable from "@nexcite/widgets/table/JournalVoucherTable";
import dayjs from "dayjs";

export default async function page(props: {
  searchParams: { id: any; from: any; to: any };
}) {
  const auth = await userAuth();
  let { from, id, to } = props.searchParams;
  from = dayjs(from).startOf("D").toDate();
  to = dayjs(to).endOf("D").toDate();
  id = id ? parseInt(id) : undefined;

  const data = await findVouchers(auth.config.id);

  return (
    <div>
      <JournalVoucherTable
        config={{ logo: auth.config.logo, name: "" }}
        data={data.body}
        search={{
          from,
          to,
          id,
        }}
      />
    </div>
  );
}

import IChartOfAccount from "@nexcite/Interfaces/IChartOfAccount";
import ICurrency from "@nexcite/Interfaces/ICurrency";
import prisma from "@nexcite/prisma/prisma";
import { JournalInputSchema } from "@nexcite/schema/JournalVoucherSchema";
import { VoucherInputSchema } from "@nexcite/schema/VoucherSchema";
import { findVoucherById } from "@nexcite/service/VoucherService";
import getAuth from "@nexcite/service/user-service";
import VoucherForm from "@nexcite/widgets/form/VoucherForm";
import { z } from "zod";

export default async function page(props: { searchParams: { id: string } }) {
  var voucher: VoucherInputSchema,
    voucherItems: JournalInputSchema[] = [],
    chartOfAccounts: IChartOfAccount[] = [],
    currencies: ICurrency[] = [];

  const auth = await getAuth();

  var id = parseInt(props.searchParams.id);
  var idSchema = props.searchParams.id
    ? z.number().safeParse(id)
    : { success: true };

  if (!idSchema.success) {
    return <div>Invalid ID</div>;
  }
  if (props.searchParams.id) {
    await findVoucherById(auth.config.id).then((result) => {
      voucher = {
        currency_id: result.body.currency_id,
        description: result.body.description,
        note: result.body.note,
        title: result.body.title,
        rate: result.body.rate,
        to_date: result.body.to_date,
      };
      voucherItems = result.body.voucher_items;
    });
  }

  chartOfAccounts = (await prisma.chartOfAccount.findMany({
    where: { config_id: auth.config.id },
    include: {
      currency: true,
    },
  })) as IChartOfAccount[];
  currencies = await prisma.currency.findMany({
    where: { config_id: auth.config.id },
  });

  return (
    <VoucherForm
      voucher={voucher}
      voucherItems={voucherItems}
      id={id}
      chartOfAccounts={chartOfAccounts}
      currencies={currencies}
    />
  );
}

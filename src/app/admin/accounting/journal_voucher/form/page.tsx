import prisma from "@rms/prisma/prisma";
import getUserFullInfo from "@rms/service/user-service";
import JournalVoucherForm from "@rms/widgets/form/journal-voucher-form";
import { JournalVoucherInputSchema } from "@rms/widgets/schema/journal-voucher";
import React from "react";
import { z } from "zod";

export default async function page(props: { searchParams: { id: string } }) {
  console.log(props.searchParams.id);
  var voucher: JournalVoucherInputSchema;
  const info = await getUserFullInfo();

  var id = parseInt(props.searchParams.id);
  var idSchema = z.number().safeParse(id);

  if (idSchema.success) {
    await prisma.voucher
      .findUnique({
        where: { id, config_id: info.config.id },
        include: {
          currency: true,
          voucher_items: {
            include: {
              chart_of_account: true,
              reference_chart_of_account: true,
            },
          },
        },
      })
      .then((res) => {
        voucher = {
          currency: {
            id: res.currency.id,
            name: res.currency.name,
            rate: res.currency.rate,
            symbol: res.currency.symbol,
          },
          description: res.description,
          note: res.note,
          title: res.title,
          rate: res.rate,
          to_date: res.to_date,
          voucher_items: res.voucher_items.map((res) => ({
            amount: res.amount,
            chart_of_account: res.chart_of_account,
            reffrence_chart_of_account: res.reference_chart_of_account,
            debit_credit: res.debit_credit,
            rate: res.rate,
          })),
        };
      });
  }

  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    orderBy: { id: "asc" },
    where: { config_id: info.config.id },
    include: { currency: true },
  });
  const currenies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });

  return (
    <JournalVoucherForm
      voucher={voucher}
      id={id}
      chartOfAccounts={chartOfAccounts}
      currencies={currenies}
    />
  );
}

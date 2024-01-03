import prisma from "@rms/prisma/prisma";
import getUserFullInfo from "@rms/service/user-service";
import JournalVoucherTable from "@rms/widgets/table/journal-voucher-table";
import React from "react";

export default async function page() {
  const info = await getUserFullInfo();
  const journalVouchers = await prisma.voucher.findMany({
    where: { config_id: info.config.id },
    include: {
      currency: true,

      voucher_items: {
        include: {
          reference_chart_of_account: {
            select: {
              name: true,
              id: true,
              account_type: true,
              currency: {
                select: {
                  name: true,
                  symbol: true,
                  rate: true,
                },
              },
            },
          },
          chart_of_account: {
            select: {
              name: true,
              id: true,
              account_type: true,
              currency: {
                select: {
                  name: true,
                  symbol: true,
                  rate: true,
                },
              },
            },
          },
          currency: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div>
      <JournalVoucherTable
        journalVouchers={journalVouchers}
        chartOfAccounts={await prisma.chartOfAccount.findMany({
          orderBy: { id: "desc" },
        })}
      />
    </div>
  );
}

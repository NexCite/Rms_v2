import prisma from "@rms/prisma/prisma";
import getUserFullInfo from "@rms/service/user-service";
import JournalVoucherTable from "@rms/widgets/table/journal-voucher-table";
import React from "react";

export default async function page() {
  return (
    <div>
      <JournalVoucherTable />
    </div>
  );
}

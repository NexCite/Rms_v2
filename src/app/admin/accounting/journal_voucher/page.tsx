import prisma from "@rms/prisma/prisma";
import { userAuth } from "@rms/service/auth-service";
import getAuth from "@rms/service/user-service";
import JournalVoucherTable from "@rms/widgets/table/journal-voucher-table";
import React from "react";

export default async function page() {
  const user = await userAuth();
  return (
    <div>
      <JournalVoucherTable config={{ logo: user.config.logo, name: "" }} />
    </div>
  );
}

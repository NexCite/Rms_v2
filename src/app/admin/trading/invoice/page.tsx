import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import InvoiceTable from "@rms/widgets/table/invoice-table";

export default async function page(props: {
  params: { node: "invoice" };
  searchParams: { id?: string };
}) {
  var value: Prisma.InvoiceGetPayload<{}>[] = await prisma.invoice.findMany({
    where: {
      status: "Enable",
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div>
      <InvoiceTable invoices={value} />
    </div>
  );
}

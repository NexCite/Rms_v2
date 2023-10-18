import { Prisma } from "@prisma/client";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import InvoiceTable from "@rms/widgets/table/invoice-table";

export default async function page(props: {
  params: { node: "invoice" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  var value: Prisma.InvoiceGetPayload<{}>[] = await prisma.invoice.findMany({
    where: {
      config_id,
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

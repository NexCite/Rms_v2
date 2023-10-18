import PaymentTable from "@rms/widgets/table/payment-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getConfigId } from "@rms/lib/config";

export default async function page(props: {
  params: { node: "payment" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  var value: Prisma.PaymentGetPayload<{}>[] = await prisma.payment.findMany({
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
      <PaymentTable payments={value} />
    </div>
  );
}

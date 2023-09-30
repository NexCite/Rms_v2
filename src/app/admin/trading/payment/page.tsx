import PaymentTable from "@rms/widgets/table/payment-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

export default async function page(props: {
  params: { node: "payment" };
  searchParams: { id?: string };
}) {
  var value: Prisma.PaymentGetPayload<{}>[] = await prisma.payment.findMany({
    where: {
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

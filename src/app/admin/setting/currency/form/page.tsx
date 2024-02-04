import { Prisma } from "@prisma/client";
import { getConfigId } from "@nexcite/lib/config";
import prisma from "@nexcite/prisma/prisma";
import CurrencyForm from "@nexcite/widgets/form/currency-form";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.CurrencyGetPayload<{}>;
  if (isEditMode) {
    value = await prisma.currency.findFirst({ where: { id: id, config_id } });
  }
  return (
    <div>
      <CurrencyForm value={value} />
    </div>
  );
}

import Loading from "@nexcite/components/other/LoadingUi";

import CharOfAccountForm from "@nexcite/app/admin/accounting/chart_of_account/form/page";
import { Suspense } from "react";
export default async function page(props: { searchParams: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <CharOfAccountForm searchParams={props.searchParams} />
    </Suspense>
  );
}

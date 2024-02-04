import Loading from "@nexcite/components/other/loading";
import { Activity } from "@nexcite/models/CommonModel";
import { getActivities } from "@nexcite/service/activity-service";
import ActivityTable from "@nexcite/widgets/table/activity-table";
import { Suspense } from "react";

export default async function page() {
  const result = await getActivities();

  return result?.status !== 200 ? (
    <div>{result.message}</div>
  ) : (
    <Suspense fallback={<Loading />}>
      <ActivityTable
        data={(result.result as Activity[]).sort((a, b) => b.id - a.id)}
      />
    </Suspense>
  );
}

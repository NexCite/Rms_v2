import Loading from "@rms/components/ui/loading";
import { Activity } from "@rms/models/CommonModel";
import { getActivities } from "@rms/service/activity-service";
import ActivityTable from "@rms/widgets/table/activity-table";
import React, { Suspense } from "react";

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

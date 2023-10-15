import { getActivities } from "@rms/service/activity-service";
import ActivityTable from "@rms/widgets/table/activity-table";
import React from "react";

export default async function page() {
  const result = await getActivities();

  return <ActivityTable data={result.result} />;
}

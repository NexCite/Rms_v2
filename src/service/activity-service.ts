"use server";

import { handlerServiceAction } from "@nexcite/lib/handler";
import { ActivityStatus } from "@nexcite/models/CommonModel";
/**
 * Perform confirmation of an activity by updating its status.
 *
 * @param id - The ID of the activity to be confirmed.
 * @param status - (Optional) The new status of the activity (default: undefined).
 * @returns The HTTP status code after the confirmation request.
 */
export async function confirmActivity({
  id,
  status,
}: {
  id: number;
  status?: ActivityStatus;
}) {
  return handlerServiceAction(
    async () => {
      const result = await fetch(process.env.APEX_URL!, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          key: process.env.APEX_KEY!,
        }),
      });

      return result.status;
    },
    status === ActivityStatus.Provided ? "Update_Activity" : "Delete_Activity",
    {
      update: true,
    }
  );
}

/**
 * Retrieve activities based on optional ID and configuration ID.
 *
 * @param id - (Optional) The ID of a specific activity to retrieve (default: undefined).
 * @param config_id - (Optional) The configuration ID related to the activities (default: undefined).
 * @returns The JSON representation of the retrieved activities.
 */
export async function getActivities(id?: number, config_id?: number) {
  return handlerServiceAction(
    async () => {
      const result = await fetch(process.env.APEX_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: process.env.APEX_KEY!,
          id,
          config_id,
        }),
      });

      return result.json();
    },
    id ? "View_Activity" : "View_Activities",
    { update: false }
  );
}

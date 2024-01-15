"use server";

import { handlerServiceAction } from "@rms/lib/handler";
import { ActivityStatus } from "@rms/models/CommonModel";

/**
 *
 * Done
 *
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
      var result = await fetch(process.env["APEX_URL"], {
        body: JSON.stringify({
          id,
          status,
          key: process.env["APEX_KEY"],
        }),
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
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
 *
 * Done
 *
 */
export async function getActivities(id?: number, config_id?: number) {
  return handlerServiceAction(
    async () => {
      var result = await fetch(process.env["APEX_URL"], {
        body: JSON.stringify({
          key: process.env["APEX_KEY"],

          id,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return result.json();
    },
    id ? "View_Activity" : "View_Activities",
    { update: false }
  );
}

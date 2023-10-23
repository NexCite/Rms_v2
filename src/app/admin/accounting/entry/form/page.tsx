import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getConfigId } from "@rms/lib/config";
import { Activity } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { getActivities } from "@rms/service/activity-service";
import { getUserStatus } from "@rms/service/user-service";
import EntryForm from "@rms/widgets/form/entry-form";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id: string; activity_id: string };
}) {
  var id: number,
    entry: Prisma.EntryGetPayload<{
      include: { media: true; sub_entries: true };
    }>,
    activity_id: number | undefined;
  var activity: Activity;
  const config_id = await getConfigId();
  if (props.searchParams.id && !Number.isInteger(+props.searchParams.id)) {
    return (
      <>
        <BackButton />

        <div>Not Found</div>
      </>
    );
  } else if (props.searchParams.id) {
    id = +props.searchParams.id;
    entry = await prisma.entry.findFirst({
      where: { id: id, config_id },
      include: {
        media: true,
        sub_entries: true,
      },
    });
    if (!entry) {
      return (
        <>
          <BackButton />
          <div>Not Found</div>
        </>
      );
    }
  }

  if (Number.isInteger(+props.searchParams.activity_id)) {
    activity_id = +props.searchParams.activity_id;
  }

  const three_digit = await prisma.three_Digit.findMany({
    where: {
      config_id,
      status: await getUserStatus(),
      two_digit: { status: await getUserStatus() },
    },
    select: {
      two_digit: { select: { name: true, id: true } },
      name: true,
      id: true,
    },
    orderBy: { modified_date: "desc" },
  });
  const more_than_four_digit = await prisma.more_Than_Four_Digit.findMany({
    where: {
      config_id,
      status: await getUserStatus(),
      three_digit: { status: await getUserStatus() },
    },
    select: {
      three_digit: { select: { name: true, id: true } },
      name: true,
      id: true,
    },
    orderBy: { modified_date: "desc" },
  });
  const two_digits = await prisma.two_Digit.findMany({
    where: { config_id, status: await getUserStatus() },

    orderBy: { modified_date: "desc" },
  });
  const account_entry = await prisma.account_Entry.findMany({
    where: { config_id, status: await getUserStatus() },
    select: {
      username: true,
      type: true,
      id: true,
    },
    orderBy: { modified_date: "desc" },
  });
  const currencies = await prisma.currency.findMany({
    where: {
      config_id,
    },
    orderBy: { modified_date: "desc" },
  });
  if (activity_id) {
    const result = await getActivities(activity_id, config_id);
    activity = result.status !== 200 ? undefined : result.result;
  }

  return (
    <div>
      <EntryForm
        activity={activity}
        id={id}
        isEditMode={id ? true : false}
        entry={entry}
        currencies={currencies}
        three_digit={three_digit}
        account_entry={account_entry}
        more_than_four_digit={more_than_four_digit}
        two_digit={two_digits}
      />
    </div>
  );
}

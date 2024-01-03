import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { Activity } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { getActivities } from "@rms/service/activity-service";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import EntryForm from "@rms/widgets/form/entry-form";

export default async function page(props: {
  params: {};
  searchParams: { id: string; activity_id: string };
}) {
  const info = await getUserFullInfo();
  const userStates = getUserStatus(info.user);
  var id: number,
    entry: Prisma.EntryGetPayload<{
      include: { media: true; sub_entries: true };
    }>,
    activity_id: number | undefined;
  var activity: Activity;
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
      where: { id: id, config_id: info.config.id },
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
      config_id: info.config.id,
      status: userStates,
      two_digit: { status: userStates },
    },
    select: {
      two_digit: { select: { name: true, id: true } },
      name: true,
      id: true,
      type: true,
    },
    orderBy: { id: "desc" },
  });
  const more_than_four_digit = await prisma.more_Than_Four_Digit.findMany({
    where: {
      config_id: info.config.id,
      status: userStates,
      three_digit: { status: userStates },
    },
    select: {
      three_digit: { select: { name: true, id: true, type: true } },
      name: true,
      id: true,
      type: true,
    },
    orderBy: { id: "desc" },
  });
  const two_digits = await prisma.two_Digit.findMany({
    where: { config_id: info.config.id, status: userStates },

    orderBy: { id: "desc" },
  });
  const account_entry = await prisma.account_Entry.findMany({
    where: { config_id: info.config.id, status: userStates },
    select: {
      username: true,
      type: true,
      id: true,
      currency: true,
    },
    orderBy: { id: "desc" },
  });
  const currencies = await prisma.currency.findMany({
    where: {
      config_id: info.config.id,
    },
    orderBy: { id: "desc" },
  });
  if (activity_id) {
    const result = await getActivities(activity_id, info.config.id);
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
        three_digit={three_digit.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
        account_entry={account_entry.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
        more_than_four_digit={more_than_four_digit.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
        two_digit={two_digits.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
      />
    </div>
  );
}

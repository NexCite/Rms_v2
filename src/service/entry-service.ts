"use server";

import { $Enums, Prisma } from "@prisma/client";
import { FileMapper } from "@rms/lib/common";
import { handlerServiceAction } from "@rms/lib/handler";
import { ActivityStatus } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { confirmActivity } from "./activity-service";
import { getUserStatus } from "./user-service";
/**
 *
 * Done
 *
 */
export async function saveEntry(props: {
  entry: Prisma.EntryUncheckedCreateInput;
  media?: Prisma.MediaUncheckedCreateInput;
  subEntries: Prisma.SubEntryUncheckedCreateInput[];
  includeRate?: boolean;
  file?: FormData;
  id?: number;
  activity?: {
    id: number;
    status?: ActivityStatus;
  };
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.entry.user_id = info.user.id;
      props.entry.config_id = config_id;
      if (!props.includeRate) {
        props.entry.rate = null;
      }
      if (props.file) {
        props.media = await FileMapper({
          config_id,
          file: props.file,
          title: props.entry.title,
        });
      }

      if (props.activity) props.activity.status = ActivityStatus.Provided;

      const currency = await prisma.currency.findUnique({
        where: { id: props.entry.currency_id, rate: { gt: 0 } },
      });
      if (currency) {
        props.entry.rate = currency.rate;
      }
      var media: Prisma.MediaGetPayload<{}>;
      if (props.id) {
        var tempEntry = await prisma.entry.findUnique({
          where: { id: props.id },
          select: { media: true },
        });
        media = tempEntry.media;
      }
      const entry = props.id
        ? await prisma.entry[`update`]({
            where: { id: props.id },
            data: {
              ...props.entry,
              media: props.media
                ? media?.id === props.media.id
                  ? {
                      update: {
                        id: props.media?.id,
                      },
                    }
                  : undefined
                : media
                ? { delete: {} }
                : {},
            },
          })
        : await prisma.entry[`create`]({
            data: {
              ...props.entry,
              media: props.media
                ? {
                    connect: { id: props.media.id },
                  }
                : undefined,
            },
          });
      if (props.id) {
        await prisma.subEntry.deleteMany({ where: { entry_id: props.id } });
      }
      props.subEntries = props.subEntries.map((res, i) => {
        res.entry_id = entry.id;
        return res;
      });
      await prisma.subEntry.createMany({ data: props.subEntries });
      props.activity ? await confirmActivity(props.activity) : undefined;
      return;
    },
    "Add_Entry",
    true,
    props
  );
}

/**
 *
 * Done
 *
 */
export async function deleteEntry(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      return await prisma.entry.delete({ where: { id: id, config_id } });
    },
    "Delete_Entry",
    true,
    { id }
  );
}
export async function resetEntry(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.entry.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}

export async function findEnteris(props: {
  two_digit?: Prisma.Two_DigitGetPayload<{}>;
  three_digit?: Prisma.Three_DigitGetPayload<{}>;
  account?: Prisma.Account_EntryGetPayload<{}>;
  type?: $Enums.DigitType;
  more_than_four_digit?: Prisma.More_Than_Four_DigitGetPayload<{}>;
  include_reference?: boolean;
  debit?: $Enums.DebitCreditType;
  id?: number;
  from: Date;
  to: Date;
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      return prisma.entry.findMany({
        where: {
          config_id,
          id: props.id,
          to_date: {
            gte: props.from,
            lte: props.to,
          },
          AND: [
            {
              sub_entries: {
                some: {
                  OR: Number.isInteger(props.two_digit?.id)
                    ? [
                        {
                          [props.include_reference
                            ? "reference"
                            : "account_entry"]: {
                            two_digit_id: props.two_digit?.id,
                          },
                        },
                        {
                          [props.include_reference
                            ? "reference"
                            : "account_entry"]: {
                            three_digit: {
                              two_digit_id: props.two_digit?.id,
                            },
                          },
                        },
                        {
                          [props.include_reference
                            ? "reference"
                            : "account_entry"]: {
                            more_than_four_digit: {
                              three_digit: {
                                two_digit_id: props.two_digit?.id,
                              },
                            },
                          },
                        },
                        {
                          [props.include_reference
                            ? "reference"
                            : "account_entry"]: {
                            three_digit_id: props.three_digit?.id,
                          },
                        },
                        {
                          [props.include_reference
                            ? "reference"
                            : "account_entry"]: {
                            more_than_four_digit: {
                              three_digit_id: props.three_digit?.id,
                            },
                          },
                        },
                        {
                          [props.include_reference
                            ? "reference"
                            : "account_entry"]: {
                            more_than_four_digit_id:
                              props.more_than_four_digit?.id,
                          },
                        },
                        {
                          two_digit_id: props.two_digit?.id,
                        },
                        {
                          three_digit: {
                            two_digit_id: props.two_digit?.id,
                          },
                        },
                        {
                          more_than_four_digit: {
                            three_digit: {
                              two_digit_id: props.two_digit?.id,
                            },
                          },
                        },
                      ]
                    : Number.isInteger(props.three_digit?.id)
                    ? [
                        {
                          three_digit_id: props.three_digit?.id,
                        },
                        {
                          more_than_four_digit: {
                            three_digit_id: props.three_digit?.id,
                          },
                        },
                      ]
                    : Number.isInteger(props.more_than_four_digit?.id)
                    ? [
                        {
                          more_than_four_digit_id:
                            props.more_than_four_digit?.id,
                        },
                      ]
                    : undefined,
                },
              },
            },
            {
              sub_entries: {
                some: {
                  account_entry_id: props.include_reference
                    ? undefined
                    : props.account?.id,
                  reference_id: props.include_reference
                    ? props.account?.id
                    : undefined,
                },
              },
            },
          ],
        },
        include: {
          currency: true,
          sub_entries: {
            include: {
              three_digit: true,
              two_digit: true,
              account_entry: true,
              more_than_four_digit: true,
              reference: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    },
    "View_Entries",
    false
  );

  // const config = await prisma.config.findFirst({
  //   where: {
  //     id: config_id,
  //   },
  //   select: {
  //     logo: true,
  //     name: true,
  //   },
  // });

  // const currencies = await prisma.currency.findMany({ where: { config_id } });
}

type CommonInclude = {
  currency: true;

  sub_entries: {
    include: {
      account_entry: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } };
            };
          };

          three_digit: {
            include: {
              two_digit: true;
            };
          };
          two_digit: true;
        };
      };
      reference: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } };
            };
          };

          three_digit: {
            include: {
              two_digit: true;
            };
          };
          two_digit: true;
        };
      };
      more_than_four_digit: {
        include: {
          three_digit: { include: { two_digit: true } };
        };
      };

      three_digit: {
        include: {
          two_digit: true;
        };
      };
      two_digit: true;
    };
  };
};
const CommonInclude = {
  currency: true,

  sub_entries: {
    include: {
      account_entry: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } },
            },
          },

          three_digit: {
            include: {
              two_digit: true,
            },
          },
          two_digit: true,
        },
      },
      reference: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } },
            },
          },

          three_digit: {
            include: {
              two_digit: true,
            },
          },
          two_digit: true,
        },
      },
      more_than_four_digit: {
        include: {
          three_digit: { include: { two_digit: true } },
        },
      },

      three_digit: {
        include: {
          two_digit: true,
        },
      },
      two_digit: true,
    },
  },
};

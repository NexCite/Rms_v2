"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import {
  deleteMoreDigit,
  deleteThreeDigit,
  deleteTwoDigit,
} from "@rms/service/digit-service";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import Link from "next/link";

type Props = {
  node: CommonNode;
  value: {
    two: Prisma.Two_DigitGetPayload<{}>[];
    three: Prisma.Three_DigitGetPayload<{}>[];
    more: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  };
};
type CommonNode = "two" | "three" | "more";

export default function DigitTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setPadding] = useTransition();

  const store = useStore();

  const columns = useMemo<MRT_ColumnDef<any[]>>(
    () =>
      (
        [
          {
            accessorKey: "id",
            header: "ID",
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "center",
            },
            Cell: ({ row: { original } }) => (
              <div
                className={`text-center rounded-sm ${
                  original.status === "Deleted"
                    ? "bg-red-500"
                    : original.create_date.toLocaleTimeString() !==
                      original.modified_date.toLocaleTimeString()
                    ? "bg-yellow-400"
                    : ""
                }`}
              >
                {original.id}
              </div>
            ),
          },

          {
            accessorKey: "name",
            header: "Name",
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "center",
            },
          },
          {
            accessorKey: "type",
            header: "Type",
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "center",
            },
          },
          {
            accessorKey: "debit_credit",
            header: "Debit/Credit",
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "center",
            },
          },
        ] as any
      )
        .concat(
          props.node !== "two"
            ? ([
                {
                  accessorKey: props.node === "three" ? "two" : "three",
                  header: props.node === "three" ? "Two Digit" : "Three Digit",
                  accessorFn: (p) =>
                    `(${p.two_digit?.id ?? ""}${p.three_digit?.id ?? ""}) ${
                      p.two_digit?.name ?? ""
                    }${p.three_digit?.name ?? ""}  `,
                  muiTableHeadCellProps: {
                    align: "center",
                  },
                  muiTableBodyCellProps: {
                    align: "center",
                  },
                },
              ] as any)
            : []
        )
        .concat([
          {
            accessorKey: "create_date",
            header: "Create Date",

            accessorFn: (p) => p.create_date?.toLocaleDateString(),
          },

          {
            accessorKey: "modified_date",
            header: "Modified Date",

            accessorFn: (p) => p.modified_date?.toLocaleDateString(),
          },
        ] as any),
    [props.node]
  );
  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5">
            {props.node === "two"
              ? "Two Digit Or More"
              : props.node === "three"
              ? "Tree Digit Or More "
              : "Four Digit Or More "}{" "}
            Table
          </Typography>
        }
      />

      <MaterialReactTable
        initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
        state={{ showProgressBars: isPadding }}
        enableRowActions
        columns={columns as any}
        renderRowActionMenuItems={({
          row: {
            original: { id, name },
          },
        }) => [
          <Authorized
            key={1}
            permission={
              props.node === "two"
                ? "Edit_Two_Digit"
                : props.node === "three"
                ? "Edit_Three_Digit"
                : "Edit_More_Than_Four_Digit"
            }
          >
            <Link href={pathName + "/form?id=" + id}>
              <MenuItem className="cursor-pointer" disabled={isPadding}>
                Edit
              </MenuItem>
            </Link>
          </Authorized>,
          <Authorized
            key={2}
            permission={
              props.node === "two"
                ? "Delete_Two_Digit"
                : props.node === "three"
                ? "Delete_Three_Digit"
                : "Delete_More_Than_Four_Digit"
            }
          >
            <MenuItem
              disabled={isPadding}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${name} id:${id} `
                );
                if (isConfirm) {
                  setPadding(async () => {
                    const result =
                      props.node === "two"
                        ? await deleteTwoDigit(id)
                        : props.node === "three"
                        ? await deleteThreeDigit(id)
                        : await deleteMoreDigit(id);

                    store.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.value[props.node]}
      />
    </Card>
  );
}

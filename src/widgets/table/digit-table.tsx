"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, Divider, MenuItem, Typography } from "@mui/material";
import ExportData from "@rms/components/other/export-data";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import {
  deleteMoreDigit,
  deleteThreeDigit,
  deleteTwoDigit,
  resetDigit,
} from "@rms/service/digit-service";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
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
const columnHelper = createMRTColumnHelper<any>();

export default function DigitTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const store = useStore();
  const columns = useMemo(
    () =>
      (
        [
          columnHelper.accessor("id", {
            header: "ID",

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
          }),

          columnHelper.accessor("name", {
            header: "Name",
          }),
          columnHelper.accessor("type", {
            header: "Type",
          }),
          columnHelper.accessor("debit_credit", {
            header: "Debit/Credit",
          }),
        ] as any
      )
        .concat(
          props.node !== "two"
            ? ([
                columnHelper.accessor(
                  (row) =>
                    `(${row.two_digit?.id ?? ""}${row.three_digit?.id ?? ""}) ${
                      row.two_digit?.name ?? ""
                    }${row.three_digit?.name ?? ""}  `,
                  {
                    id: props.node === "three" ? "two" : "three",
                    header:
                      props.node === "three" ? "Two Digit" : "Three Digit",
                  }
                ),
              ] as any)
            : []
        )
        .concat([
          columnHelper.accessor(
            (row) => row.create_date?.toLocaleDateString(),
            {
              id: "create_date",
              header: "Create Date",
            }
          ),

          columnHelper.accessor(
            (row) => row.modified_date?.toLocaleDateString(),
            {
              id: "modified_date",
              header: "Modified Date",
            }
          ),
        ]),
    [props.node]
  );

  const table = useMaterialReactTable({
    columns,
    data: props.value[props.node],
    enableRowActions: true,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
    enableRowSelection: true,
    enableSelectAll: true,
    editDisplayMode: "row",

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
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
        <Authorized permission={"Reset"} key={2}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to reset ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await resetDigit(id, props.node);

                  store.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> reseting...</> : "Reset"}
          </MenuItem>
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
                setTransition(async () => {
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
      ];
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <ExportData data={props.value[props.node]} table={table} />
    ),

    initialState: {
      columnVisibility: {
        status: false,
        email: false,
        gender: false,
        country: false,
        address1: false,
        address2: false,
      },
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
  });
  return (
    <Card variant="outlined">
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
      <Divider />

      <MaterialReactTable table={table} />
    </Card>
  );
}

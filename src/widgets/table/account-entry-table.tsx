"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { Card, CardHeader, Divider, MenuItem, Typography } from "@mui/material";
import { $Enums, Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import {
  deleteAccountEntry,
  resetAcountEntry,
} from "@rms/service/account-entry-service";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";

import ExportData from "../../components/other/export-data";
type CommonAccountType = Prisma.Account_EntryGetPayload<{
  include: {
    more_than_four_digit: true;
    three_digit: true;
    two_digit: true;
  };
}>;

type Props = {
  accounts: CommonAccountType[];
  node: $Enums.Account_Entry_Type;
};
const columnHelper = createMRTColumnHelper<CommonAccountType>();
const columns = [
  columnHelper.accessor("status", {
    header: "Status",
  }),

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
  columnHelper.accessor("username", {
    header: "References",
  }),
  columnHelper.accessor("first_name", {
    header: "First Name",
  }),
  columnHelper.accessor("last_name", {
    header: "Last Name",
  }),
  columnHelper.accessor("info", {
    header: "Info",
  }),
  columnHelper.accessor("digit" as any, {
    header: "Digit",

    AggregatedCell: ({ row: { original } }) =>
      `
        
       (${original ?? ""}${original.two_digit_id ?? ""}${
        original.more_than_four_digit_id ?? ""
      })  ${original.three_digit?.name ?? ""}${original.two_digit?.name ?? ""}${
        original.more_than_four_digit?.name ?? ""
      }`,
  }),

  columnHelper.accessor("phone_number", {
    header: "Phone number",
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("gender", {
    header: "Gender",
  }),
  columnHelper.accessor("country", {
    header: "Country",
  }),
  columnHelper.accessor("address1", {
    header: "Address 1",
  }),
  columnHelper.accessor("address2", {
    header: "Address 2",
  }),
  columnHelper.accessor((res) => res.modified_date.toLocaleDateString(), {
    header: "Create Date",
    id: "create_date",
  }),

  columnHelper.accessor((res) => res.modified_date.toLocaleDateString(), {
    id: "modified_date",
    header: "Modified Date",
  }),
];
export default function Account_EntryTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransitionTransition] = useTransition();

  const store = useStore();
  const table = useMaterialReactTable({
    columns,
    data: props.accounts,
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
        original: { username, id },
      },
    }) {
      return [
        <Authorized
          permission={
            props.node === "Client"
              ? "Edit_Entry_Client"
              : props.node === "IB"
              ? "Edit_Entry_IB"
              : "Edit_Entry_Supplier"
          }
          key={1}
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
                `Do You sure you want to reset ${username} id:${id} `
              );
              if (isConfirm) {
                setTransitionTransition(async () => {
                  const result = await resetAcountEntry(id);

                  store.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> reseting...</> : "Reset"}
          </MenuItem>
        </Authorized>,
        <Authorized
          permission={
            props.node === "Client"
              ? "Delete_Entry_Client"
              : props.node === "IB"
              ? "Delete_Entry_IB"
              : "Delete_Entry_Supplier"
          }
          key={2}
        >
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${username} id:${id} `
              );
              if (isConfirm) {
                setTransitionTransition(async () => {
                  const result = await deleteAccountEntry(id, props.node);

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
      <ExportData data={props.accounts} table={table} />
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
    <div className="flex flex-col gap-5">
      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h5">{props.node}s Table</Typography>}
        />
        <Divider />
        <MaterialReactTable table={table} />
      </Card>
    </div>
  );
}

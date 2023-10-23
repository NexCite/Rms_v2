"use client";

import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import styled from "@emotion/styled";
import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import { $Enums, Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { deleteAccount_Entry } from "@rms/service/account-entry-service";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import Link from "next/link";
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

export default function Account_EntryTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const store = useStore();

  const columns = useMemo<MRT_ColumnDef<CommonAccountType>[]>(
    () => [
      {
        header: "Status",
        accessorKey: "status",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "id",
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
      },
      {
        accessorKey: "username",
        header: "References",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "first_name",
        header: "First Name",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "last_name",
        header: "Last Name",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "info",
        header: "Info",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "digit" as any,
        header: "Digit",
        accessorFn: (e) =>
          `
          
         (${e.three_digit_id ?? ""}${e.two_digit_id ?? ""}${
            e.more_than_four_digit_id ?? ""
          })  ${e.three_digit?.name ?? ""}${e.two_digit?.name ?? ""}${
            e.more_than_four_digit?.name ?? ""
          }`,
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        accessorKey: "phone_number",
        header: "Phone number",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "gender",
        header: "Gender",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "country",
        header: "Country",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "address1",
        header: "Address 1",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "address2",
        header: "Address 2",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        accessorKey: "modified_date",
        header: "Modified Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
      },
    ],
    []
  );

  return (
    <Style>
      <Card>
        <CardHeader
          title={<Typography variant="h5">{props.node} Table</Typography>}
        />
        <MaterialReactTable
          columns={columns}
          data={props.accounts}
          enableRowActions
          renderRowActionMenuItems={({
            row: {
              original: { username, id },
            },
          }) => [
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
                <MenuItem className="cursor-pointer" disabled={isActive}>
                  Edit
                </MenuItem>
              </Link>
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
                disabled={isActive}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${username} id:${id} `
                  );
                  if (isConfirm) {
                    setActiveTransition(async () => {
                      const result = await deleteAccount_Entry(id, props.node);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isActive ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
        />
      </Card>
    </Style>
  );
}
const Style = styled.div``;

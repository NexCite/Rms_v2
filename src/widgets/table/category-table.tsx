"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@nexcite/components/other/authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import {
  deleteCategoryById,
  resetCategory,
} from "@nexcite/service/category-service";
import { deleteSubCategoryById } from "@nexcite/service/sub-category-service";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";

type Props =
  | {
      node: "category";
      data: Prisma.CategoryGetPayload<{}>[];
    }
  | {
      node: "sub_category";
      data: Prisma.SubCategoryGetPayload<{}>[];
    };

export default function CategoryTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const toast = useToast();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
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
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h5">
            {props.node === "category" ? "Category" : "SubCategory"} Table
          </Typography>
        }
      ></CardHeader>
      <MaterialReactTable
        initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
        state={{ showProgressBars: isPadding }}
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, name },
          },
        }) => [
          <Authorized permission="Update_Currency" key={1}>
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
                    const result = await resetCategory(id);

                    toast.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> reseting...</> : "Reset"}
            </MenuItem>
          </Authorized>,
          <Authorized permission="Delete_Currency" key={3}>
            <MenuItem
              disabled={isPadding}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${name} id:${id} `
                );
                if (isConfirm) {
                  setTransition(async () => {
                    var result;
                    if (props.node === "category") {
                      result = await deleteCategoryById(id);
                    } else {
                      result = await deleteSubCategoryById(id);
                    }

                    toast.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.data}
        enableGlobalFilter
      />
    </Card>
  );
}

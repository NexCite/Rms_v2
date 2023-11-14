"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import styled from "@emotion/styled";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { useRouter } from "next/navigation";
import LoadingButton from "@mui/lab/LoadingButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import Link from "next/link";
import { deleteVacationById } from "@rms/service/vacation-service";

type Props = {
  date?: [Date, Date];
  vacations: Prisma.VacationGetPayload<{
    select: {
      id: true;
      to_date: true;
      from_date: true;
      description: true;
      type: true;
      employee: {
        select: {
          id: true;
          first_name: true;
          last_name: true;
        };
      };
      status: true;
    };
  }>[];
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
  };
}
export default function VacationTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setIsPadding] = useTransition();
  const [padding, setPadding] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const store = useStore();

  const { push, replace } = useRouter();

  const [tabValue, setTabValue] = useState(1);

  const [selectDate, setSelectDate] = useState<DateRange>({
    from: props.date[0],
    to: props.date[1],
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    let status = "";
    switch (newValue) {
      case 0: {
        status = "Accepted";
        break;
      }
      case 1: {
        status = "Pending";
        break;
      }
      case 2: {
        status = "Deleted";
        break;
      }
    }

    replaceUrlPath(status);
  };

  useEffect(() => {}, [tabValue]);

  const replaceUrlPath = (status?: string) => {
    replace(
      pathName +
        `?status=${
          status || "Accepted"
        }&from_date=${selectDate?.from?.getTime()}&to_date=${selectDate?.to?.getTime()}`,
      {}
    );
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsPadding(() => {
        replaceUrlPath();
      });
    },
    [selectDate, pathName, replace]
  );

  const columns = useMemo<
    MRT_ColumnDef<
      Prisma.VacationGetPayload<{
        select: {
          id: true;
          to_date: true;
          from_date: true;
          description: true;
          type: true;
          employee: {
            select: {
              id: true;
              first_name: true;
              last_name: true;
            };
          };
          status: true;
        };
      }>
    >[]
  >(
    () => [
      {
        header: "Status",
        accessorKey: "status",
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row: { original } }) => (
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
        accessorKey: "employee",
        header: "Employee",
        columnDefType: "data",
        id: "employee",
        accessorFn: (p) => p.employee.first_name + p.employee.last_name,
      },
      {
        accessorKey: "from_date",
        header: "Date From",
        columnDefType: "data",
        id: "from_date",
        accessorFn: (p) => p.from_date?.toLocaleDateString(),
      },
      {
        accessorKey: "to_date",
        header: "Date To",
        columnDefType: "data",
        id: "to_date",
        accessorFn: (p) => p.to_date?.toLocaleDateString(),
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
    ],
    [store.OpenAlert, , store]
  );

  return (
    <div className="w-full">
      <Card>
        <CardHeader
          title={<Typography variant="h5">Vacation Table</Typography>}
        />

        <form
          className=" grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5"
          onSubmit={handleSubmit}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="From Date"
              defaultValue={dayjs(selectDate.from)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, from: e?.toDate() }));
              }}
            />
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="To Date"
              defaultValue={dayjs(selectDate.to)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, to: e?.toDate() }));
              }}
            />
          </LocalizationProvider>

          <LoadingButton
            variant="contained"
            className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white"
            disableElevation
            loadingIndicator="Loading…"
            loading={isPadding}
            type="submit"
          >
            Search
          </LoadingButton>
        </form>

        <Card
          className="text-center p-4"
          style={{ width: 300, margin: "0px 10px 0px auto" }}
        >
          <CardHeader
            className="pt-0"
            title={<Typography variant="h5">Total Accepted</Typography>}
          />

          <span style={{ fontSize: 28, fontWeight: "bold" }}>{0}</span>
        </Card>

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              {/* {statusArray.slice().map((item, index) => ( */}
              <Tab label={"Accepted"} {...a11yProps(1)} />
              <Tab label={"Pending"} {...a11yProps(2)} />
              <Tab label={"Deleted"} {...a11yProps(3)} />
              {/* ))} */}
            </Tabs>
          </Box>

          <MaterialReactTable
            state={{ showProgressBars: isPadding }}
            enableRowActions
            columns={columns as any}
            renderRowActionMenuItems={({
              row: {
                original: { id },
              },
            }) => [
              <Authorized permission="Edit_Vacation" key={1}>
                <Link href={pathName + "/form?id=" + id}>
                  <MenuItem className="cursor-pointer" disabled={isPadding}>
                    Edit
                  </MenuItem>
                </Link>
              </Authorized>,
              <Authorized permission="View_Vacation" key={2}>
                <Link href={pathName + "/" + id}>
                  <MenuItem className="cursor-pointer" disabled={isPadding}>
                    View
                  </MenuItem>
                </Link>
              </Authorized>,
              <Authorized permission="Delete_Vacation" key={3}>
                <MenuItem
                  disabled={isPadding}
                  className="cursor-pointer"
                  onClick={() => {
                    const isConfirm = confirm(
                      `Do You sure you want to delete vacation id:${id} `
                    );
                    if (isConfirm) {
                      setPadding(async () => {
                        const result = await deleteVacationById(id);

                        store.OpenAlert(result);
                      });
                    }
                  }}
                >
                  {isPadding ? <> deleting...</> : "Delete"}
                </MenuItem>
              </Authorized>,
            ]}
            data={props.vacations}
          />
        </Box>
      </Card>
    </div>
  );
}
const Style = styled.div``;

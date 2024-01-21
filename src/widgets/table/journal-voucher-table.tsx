"use client";
import Table from "@mui/joy/Table";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_SortingState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  JournalVouchers,
  VoucherSearchSchema,
} from "../../schema/journal-voucher";

import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Authorized from "@rms/components/other/authorized";
import {
  FormatNumber,
  FormatNumberWithFixed,
  exportToExcel,
} from "@rms/lib/global";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Input from "@mui/joy/Input";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Card,
  Modal,
  ModalClose,
  ModalDialog,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@mui/joy";
import { MenuItem } from "@mui/material";
import NexCiteButton from "@rms/components/button/nexcite-button";
import { useToast } from "@rms/hooks/toast-hook";
import TableStateModel from "@rms/models/TableStateModel";
import {
  deleteVoucherService,
  findVoucherService,
} from "@rms/service/voucher-service";
import { Controller, set, useForm } from "react-hook-form";
import { MdSearch } from "react-icons/md";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import NexCiteCard from "@rms/components/card/nexcite-card";
import Image from "next/image";

const columnHelper = createMRTColumnHelper<JournalVouchers>();

export default function JournalVoucherTable(props: {
  config: { logo: string; name: string };
}) {
  const [data, setData] = useState<JournalVouchers[]>([]);
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const filter = useFilter();
  const toast = useToast();
  const table = useMaterialReactTable({
    columns,
    enableRowActions: true,
    enableRowSelection: false,
    enableStickyHeader: true,
    enableClickToCopy: true,
    enableGlobalFilter: false,
    enableGrouping: false,
    // onGlobalFilterChange: filter.setGlobalFilter,
    enableSelectAll: false,
    enableSubRowSelection: false,
    enableStickyFooter: true,

    // onGroupingChange: filter.setGroups,
    // onColumnFiltersChange: filter.setColumnsFilter,
    // onSortingChange: filter.setSorting,
    enableExpanding: true,
    enableExpandAll: true,
    // initialState: { showColumnFilters: filter.filterColumns?.length > 0 },
    // onExpandedChange: filter.setExpanded,
    // onPaginationChange: filter.setPagination,
    filterFromLeafRows: true,
    // onShowColumnFiltersChange: filter.setShowColumnFilters,
    // state: {
    //   expanded: filter.expanded,
    //   grouping: filter.groups,
    //   showColumnFilters: filter.showColumnFilters,
    //   pagination: filter.pagination,

    //   showLoadingOverlay: isPadding,
    //   sorting: filter.sorting,
    //   globalFilter: filter.globalFilter,
    //   columnFilters: filter.filterColumns,
    // },
    renderRowActionMenuItems: ({ row: { original } }) => [
      <Authorized key={1} permission="Update_Chart_Of_Account">
        <Link
          href={pathName + "/form?id=" + original.id}
          className="w-full block text-center"
        >
          <MenuItem>Edit</MenuItem>
        </Link>
      </Authorized>,
      <Authorized key={2} permission="Update_Chart_Of_Account">
        <MenuItem
          onClick={(e) => {
            setVoucher(original);
          }}
        >
          Export
        </MenuItem>
      </Authorized>,

      <Authorized permission="Delete_Chart_Of_Account" key={3}>
        <MenuItem
          disabled={isPadding}
          className="cursor-pointer"
          onClick={() => {
            const isConfirm = confirm(
              `Do You sure you want to delete  id:${original.id} `
            );
            if (isConfirm) {
              setTransition(async () => {
                const result = await deleteVoucherService({ id: original.id });
                handleSubmit(form.getValues());
                toast.OpenAlert(result);
              });
            }
          }}
        >
          {isPadding ? <> deleting...</> : "Delete"}
        </MenuItem>
      </Authorized>,
    ],
    data: data,
    renderDetailPanel: ({ row }) => (
      <Table>
        <thead>
          <tr>
            <th>D/C</th>
            <th>Amount</th>
            <th>Account</th>
            <th>Reffrence Account</th>
            <th>Amount/Rate</th>
          </tr>
        </thead>
        <tbody>
          {row.original.voucher_items.map((res) => (
            <tr key={res.id}>
              <td>{res.debit_credit}</td>
              <td>
                {res.currency.symbol}
                {FormatNumber(res.amount, 2)}
              </td>

              <td>
                {res.chart_of_account.id} {res.chart_of_account.name}
              </td>

              <td>
                {res.reference_chart_of_account?.id}{" "}
                {res.reference_chart_of_account?.name}
              </td>
              <td>${FormatNumberWithFixed(res.amount / res.rate, 2)}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </Table>
    ),
  });

  const form = useForm<VoucherSearchSchema>({
    resolver: zodResolver(VoucherSearchSchema),
    defaultValues: {
      include_reffrence: false,
      chart_of_accounts: [],
      pageIndex: 0,
      pageSize: 10,

      from: dayjs().startOf("D").toDate(),
      to: dayjs().endOf("D").toDate(),
      currencies: [],
      id: undefined,
    },
  });
  useEffect(() => {
    setTransition(() => {
      findVoucherService(form.formState.defaultValues as any).then((res) => {
        setData(res.result);
      });
    });
  }, [form.formState.defaultValues]);

  const handleSubmit = useCallback((values: VoucherSearchSchema) => {
    setTransition(() => {
      findVoucherService(values).then((res) => {
        setData(res.result);
      });
    });
  }, []);
  const [voucher, setVoucher] = useState<JournalVouchers>(null);

  return (
    <NexCiteCard title="Journal Voucher Table">
      <form
        className="mb-5 flex flex-col gap-5 "
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex justify-end">
          <NexCiteButton
            label="Search"
            icon={<MdSearch />}
            isPadding={isPadding}
          ></NexCiteButton>
        </div>
        <div className="flex gap-5 flex-col">
          <div className="flex flex-col lg:flex-row  gap-5 items-center">
            <Controller
              control={form.control}
              name="id"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>Id</FormLabel>
                  <Input
                    onChange={(e) => {
                      field.onChange(
                        isNaN(e.target.valueAsNumber)
                          ? undefined
                          : e.target.valueAsNumber
                      );
                    }}
                    value={field.value}
                    placeholder="id"
                    type="number"
                  />
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="from"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>From Date</FormLabel>
                  <Input
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      field.onChange(
                        dayjs(e.target.valueAsDate).startOf("d").toDate()
                      )
                    }
                    placeholder="from date"
                    type="date"
                  />
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="to"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>To Date</FormLabel>
                  <Input
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      field.onChange(
                        dayjs(e.target.valueAsDate).endOf("d").toDate()
                      )
                    }
                    placeholder="to date"
                    type="date"
                  />
                </FormControl>
              )}
            />
          </div>
        </div>
      </form>
      <ExportVoucher
        config={props.config}
        voucher={voucher}
        onClose={() => {
          setVoucher(null);
        }}
      />
      <MaterialReactTable table={table} />
    </NexCiteCard>
  );
}

const columns = [
  columnHelper.accessor("id", {
    header: "Id",
  }),
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor(
    (row) => dayjs(row.to_date).format("DD-MM-YYYY hh:mm a"),
    {
      id: "to_date",
      header: "Date",
    }
  ),
  columnHelper.accessor((row) => row.currency.name, {
    id: "currency_id",
    header: "Currency",
  }),
];
const useFilter = create<TableStateModel>()(
  persist(
    (set, get) => ({
      filterColumns: [],
      fromDate: dayjs().startOf("D").toDate(),
      toDate: dayjs().endOf("D").toDate(),
      showColumnFilters: false,
      groups: [],
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },

      expanded: {},
      globalFilter: "",
      setExpanded(newValue) {
        if (typeof newValue === "function") {
          get().expanded = (
            newValue as (prevValue: MRT_ExpandedState) => MRT_ExpandedState
          )(get().expanded);
        } else {
          get().expanded = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },

      setShowColumnFilters(newValue) {
        if (typeof newValue === "function") {
          get().showColumnFilters = (
            newValue as (prevValue: boolean) => boolean
          )(get().showColumnFilters);
        } else {
          get().showColumnFilters = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setGlobalFilter(newValue) {
        if (typeof newValue === "function") {
          get().globalFilter = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().globalFilter);
        } else {
          get().globalFilter = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setColumnsFilter(newValue) {
        if (typeof newValue === "function") {
          get().filterColumns = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().filterColumns);
        } else {
          get().filterColumns = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setGroups(newValue) {
        if (typeof newValue === "function") {
          get().groups = (
            newValue as (prevValue: MRT_GroupingState) => MRT_GroupingState
          )(get().groups);
        } else {
          get().groups = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setFromDate(newValue) {
        if (typeof newValue === "function") {
          get().fromDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().fromDate)
          )
            .endOf("D")
            .toDate();
        } else {
          get().fromDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ fromDate: get().fromDate });
      },
      setToDate(newValue) {
        if (typeof newValue === "function") {
          get().toDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().toDate)
          )
            .endOf("D")
            .toDate();
        } else {
          get().toDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ toDate: get().toDate });
      },
      sorting: [],
      setSorting(newValue) {
        if (typeof newValue === "function") {
          get().sorting = (
            newValue as (prevValue: MRT_SortingState) => MRT_SortingState
          )(get().sorting);
        } else {
          get().sorting = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setPagination(newValue) {
        if (typeof newValue === "function") {
          get().pagination = (
            newValue as (prevValue: MRT_PaginationState) => MRT_PaginationState
          )(get().pagination);
        } else {
          get().pagination = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
    }),
    {
      name: "vocuher-account-table",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
const doc = new jsPDF();
doc.setFont("Arial");

function ExportVoucher(props: {
  voucher: JournalVouchers;
  onClose?: () => void;
  config: {
    name: string;
    logo: string;
  };
}) {
  const client = useMemo(
    () =>
      props?.voucher?.voucher_items
        .filter(
          (res) =>
            res.chart_of_account.account_type ||
            res.reference_chart_of_account?.account_type
        )
        .map((res) => {
          if (res.chart_of_account.account_type) {
            return {
              label:
                res.chart_of_account.first_name +
                " " +
                res.chart_of_account.last_name,
              value: res.chart_of_account.id,
            };
          } else {
            return {
              label:
                res.reference_chart_of_account.first_name +
                " " +
                res.reference_chart_of_account.last_name,
              value: res.reference_chart_of_account.id,
            };
          }
        }),
    [props.voucher]
  );
  const [tabIndex, setTabIndex] = useState(1);
  const total = useMemo(
    () =>
      props?.voucher?.voucher_items.reduce((a, b) => {
        if (b.debit_credit === "Debit") {
          return a + b.amount;
        }
        return a + 0;
      }, 0),
    [props.voucher]
  );
  const [selectedClient, setSelectedClient] = useState<any>(null);
  return (
    props.voucher && (
      <Modal open={props.voucher ? true : false}>
        <ModalDialog
          style={{
            maxWidth: 1400,
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <ModalClose
            onClick={() => {
              props.onClose();
            }}
          />
          <div className="flex justify-between items-end">
            <FormControl className="flex">
              <FormLabel>Select For Client</FormLabel>
              <Autocomplete
                options={client}
                onChange={(e, newValue) => {
                  setSelectedClient(newValue ?? null);
                }}
                value={selectedClient}
              />
            </FormControl>
            <div className="flex gap-5 w-[300px]">
              <NexCiteButton
                className="h-[25px] w-full"
                type="button"
                disabled={!selectedClient}
                onClick={(e) => {
                  exportToExcel({
                    to: props.voucher.to_date,
                    from: props.voucher.to_date,
                    username: selectedClient?.label,
                    sheet: `${
                      tabIndex === 1 ? "Receipt Voucher" : "Payment Voucher"
                    }-${selectedClient.label}-${props.voucher.id}`,
                    id: tabIndex === 1 ? "receipt-voucher" : "payment-voucher",
                  });
                }}
              >
                Export Excel
              </NexCiteButton>
              <NexCiteButton
                className="h-[20px] w-full"
                type="button"
                disabled={!selectedClient}
                onClick={async (e) => {
                  const canvas = await html2canvas(
                    document.querySelector(
                      tabIndex === 1 ? "#receipt-voucher" : "#payment-voucher"
                    ),
                    {}
                  );
                  const pdf = new jsPDF("p", "mm", "a4");
                  pdf.addImage(
                    canvas.toDataURL("image/png"),
                    "PNG",
                    10,
                    10,
                    180,
                    0
                  );
                  pdf.save(
                    `${
                      tabIndex === 1 ? "receipt-voucher" : "payment-voucher"
                    }-${selectedClient.label}-${props.voucher.id}.pdf`
                  );
                }}
              >
                Export PDF
              </NexCiteButton>
            </div>
          </div>
          <div>
            <Tabs value={tabIndex} onChange={(e, v: any) => setTabIndex(v)}>
              <TabList>
                <Tab variant="outlined" value={1}>
                  Receipt voucher
                </Tab>
                <Tab variant="outlined" value={2}>
                  Payment voucher
                </Tab>
              </TabList>
              <TabPanel value={1}>
                <Table id="receipt-voucher" variant="outlined" dir="rtl">
                  <tbody>
                    <tr>
                      <td colSpan={5}></td>
                      <td>
                        <Image
                          src={`/api/media/${props.config.logo}`}
                          className="border rounded-full
                     object-cover"
                          alt="logo"
                          width={100}
                          height={100}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} align="center" style={{ fontSize: 30 }}>
                        سند قبض
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} align="center" style={{ fontSize: 30 }}>
                        Receipt voucher
                      </td>
                    </tr>
                    <tr>
                      <td align="center" colSpan={3}>
                        سند قبض رقم
                      </td>{" "}
                      <td colSpan={3} align="center">
                        {props.voucher.id}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        التاريخ:{" "}
                        {dayjs(props.voucher.to_date).format("DD/MM/YYYY")}
                      </td>
                      <td></td>
                      <td colSpan={3} align="right">
                        {" "}
                      </td>

                      <td dir="ltr">
                        Date:{" "}
                        {dayjs(props.voucher.to_date).format("DD/MM/YYYY")}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        استلمت من السيد/السادة: {selectedClient?.label}
                      </td>

                      <td dir="ltr" colSpan={3}>
                        Received from Mr./Mrs.: {selectedClient?.label}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        مبلغ وقدره: {props.voucher?.currency?.symbol}
                        {FormatNumberWithFixed(total, 2)}
                      </td>

                      <td dir="ltr" colSpan={3}>
                        The sum of: {props.voucher?.currency?.symbol}
                        {FormatNumberWithFixed(total, 2)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        نقدا/شيك رقم:{" "}
                        <span contentEditable>....................</span>
                      </td>
                      <td colSpan={1}> </td>
                      <td colSpan={2} align="center">
                        تاريخ: <span contentEditable>....................</span>
                      </td>

                      <td colSpan={1}> </td>
                      <td align="left" dir="ltr">
                        Cash/Cheque No:{" "}
                        <span contentEditable>....................</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6}>
                        <div className="max-w-[550px]">
                          وذلك عن: {props.voucher.description}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6}> </td>
                    </tr>
                    <tr>
                      <td colSpan={3}> </td>
                      <td align="center">أعدها</td>
                      <td align="center">المستلم</td>
                      <td align="center">توقيع المدير</td>
                    </tr>

                    <tr>
                      <td colSpan={3}> </td>
                      <td align="center">Prepared by</td>
                      <td align="center">Received by</td>
                      <td align="center">Manager sign</td>
                    </tr>
                    <tr>
                      {" "}
                      <td colSpan={3}> </td>
                      <td align="center">
                        {props.voucher?.user.first_name +
                          " " +
                          props.voucher?.user.last_name}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </TabPanel>
              <TabPanel value={2}>
                <Table id="payment-voucher" variant="outlined" dir="rtl">
                  <tbody>
                    <tr>
                      <td colSpan={5}></td>
                      <td>
                        <Image
                          src={`/api/media/${props.config.logo}`}
                          className="border rounded-full
                     object-cover"
                          alt="logo"
                          width={100}
                          height={100}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} align="center" style={{ fontSize: 30 }}>
                        سند صرف{" "}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} align="center" style={{ fontSize: 30 }}>
                        Payment voucher{" "}
                      </td>
                    </tr>
                    <tr>
                      <td align="center" colSpan={3}>
                        سند صرف رقم
                      </td>{" "}
                      <td colSpan={3} align="center">
                        {props.voucher.id}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        التاريخ:{" "}
                        {dayjs(props.voucher.to_date).format("DD/MM/YYYY")}
                      </td>
                      <td></td>
                      <td colSpan={3} align="right">
                        {" "}
                      </td>

                      <td dir="ltr">
                        Date:{" "}
                        {dayjs(props.voucher.to_date).format("DD/MM/YYYY")}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        صرفنا إلى السيد/السادة: {selectedClient?.label}
                      </td>

                      <td dir="ltr" colSpan={3}>
                        We turned to Mr./Mrs.: {selectedClient?.label}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        مبلغ وقدره: {props.voucher?.currency?.symbol}
                        {FormatNumberWithFixed(total, 2)} Cash
                      </td>

                      <td dir="ltr" colSpan={3}>
                        The sum of: {props.voucher?.currency?.symbol}
                        {FormatNumberWithFixed(total, 2)} Cash
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={6}> </td>
                    </tr>
                    <tr>
                      <td colSpan={3}> </td>
                      <td align="center">أعدها</td>
                      <td align="center">المستلم</td>
                      <td align="center">توقيع المدير</td>
                    </tr>

                    <tr>
                      <td colSpan={3}> </td>
                      <td align="center">Prepared by</td>
                      <td align="center">Received by</td>
                      <td align="center">Manager sign</td>
                    </tr>
                    <tr>
                      {" "}
                      <td colSpan={3}> </td>
                      <td align="center">
                        {props.voucher?.user.first_name +
                          " " +
                          props.voucher?.user.last_name}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </TabPanel>
            </Tabs>
          </div>
        </ModalDialog>
      </Modal>
    )
  );
}

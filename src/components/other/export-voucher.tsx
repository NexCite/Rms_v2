import { useMemo, useState } from "react";

import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import { FormatNumberWithFixed, exportToExcel } from "@rms/lib/global";

import {
  Autocomplete,
  Modal,
  ModalClose,
  ModalDialog,
  Tab,
  TabList,
  TabPanel,
  Table,
  Tabs,
} from "@mui/joy";
import NexCiteButton from "@rms/components/button/nexcite-button";

import IVoucher from "@rms/models/VoucherModel";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
const doc = new jsPDF();
doc.setFont("Arial");

export default function ExportVoucher(props: {
  voucher: IVoucher;
  onClose?: () => void;
  config: {
    name: string;
    logo: string;
  };
}) {
  const client = useMemo(
    () =>
      props?.voucher?.voucher_items
        .filter((res) => res.chart_of_account.account_type)
        .map((res) => {
          return {
            label:
              res.chart_of_account.first_name +
              " " +
              res.chart_of_account.last_name,
            value: res.chart_of_account.id,
          };
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
                onClick={(e) => {
                  exportToExcel({
                    to: props.voucher.to_date,
                    from: props.voucher.to_date,
                    username: selectedClient?.label,
                    sheet: `${
                      tabIndex === 1 ? "Receipt Voucher" : "Payment Voucher"
                    }-${props.voucher.id}`,
                    id: tabIndex === 1 ? "receipt-voucher" : "payment-voucher",
                  });
                }}
              >
                Export Excel
              </NexCiteButton>
              <NexCiteButton
                className="h-[20px] w-full"
                type="button"
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
                    }-${props.voucher.id}.pdf`
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
                        استلمت من السيد/السادة:{" "}
                        <span contentEditable>
                          {selectedClient?.label ?? "........."}
                        </span>
                      </td>

                      <td dir="ltr" colSpan={3}>
                        Received from Mr./Mrs.:{" "}
                        <span contentEditable>
                          {selectedClient?.label ?? "........."}
                        </span>
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
                        صرفنا إلى السيد/السادة:{" "}
                        <span contentEditable>
                          {selectedClient?.label ?? "........"}{" "}
                        </span>
                      </td>

                      <td dir="ltr" colSpan={3}>
                        We turned to Mr./Mrs.:{" "}
                        <span contentEditable>
                          {selectedClient?.label ?? "........"}{" "}
                        </span>
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

import { Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import ExportVoucher from "@rms/widgets/view/export-voucher";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <Modal open>
      <ModalDialog>
        <Link href="/admin/accounting/journal_voucher">
          <ModalClose />
        </Link>
        <ExportVoucher />
      </ModalDialog>
    </Modal>
  );
}

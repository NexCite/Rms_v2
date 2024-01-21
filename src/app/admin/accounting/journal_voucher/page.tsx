import { userAuth } from "@rms/service/auth-service";
import JournalVoucherTable from "@rms/widgets/table/journal-voucher-table";

export default async function page() {
  const user = await userAuth();
  return (
    <div>
      <JournalVoucherTable config={{ logo: user.config.logo, name: "" }} />
    </div>
  );
}

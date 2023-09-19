import React, { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@rms/components/ui/alert";
import { AlertCircle } from "lucide-react";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import { useRouter } from "next/navigation";
type Props = {
  timeout?: number;
  message?: string;
  id?: string;
  loading?: boolean;
  status: HttpStatusCode;
  replace?: string;
};
export default function useAlertHook() {
  const [show, setShow] = useState(false);
  const [alert, setAlert] = useState<Props>();
  const { replace } = useRouter();

  const createAlert = useCallback((props: Props) => {
    setShow(true);
    setAlert(props);
    if (props.replace && props.status === 200) {
      replace(props.replace);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setShow(false);
      }, alert?.timeout ?? 3000);
    }
  }, [show]);
  const AlertComponent = () => (
    <>
      {show ? (
        <Alert
          variant={alert?.status !== 200 ? "destructive" : "default"}
          color="green"
          className="fixed top-3 md:right-3 w-10/12 sm:w-8/12 md:w-4/12 animate-in bg-white"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {alert?.status === 200 ? "Operation Successful" : "Operation Error"}
          </AlertTitle>
          <AlertDescription>{alert?.message}</AlertDescription>
        </Alert>
      ) : (
        <></>
      )}
    </>
  );

  return {
    createAlert,
    AlertComponent,
  };
}

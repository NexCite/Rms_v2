import { useCallback } from "react";

import HttpStatusCode from "@rms/models/HttpStatusCode";
import { useRouter } from "next/navigation";
import { toast } from "@rms/components/ui/use-toast";
type Props = {
  message?: string;
  id?: string;
  loading?: boolean;
  status: HttpStatusCode;
  replace?: string;
};
export default function useAlertHook() {
  const { replace } = useRouter();

  const createAlert = useCallback((props: Props) => {
    toast({
      title: props?.status === 200 ? "Operation Successful" : "Operation Error",
      variant: props?.status === 200 ? "default" : "destructive",
      description: props.message,
      type: "foreground",
    });

    if (props.replace) {
      replace(props.replace);
    }
  }, []);

  return {
    createAlert,
  };
}

// worker.ts
import { $Enums } from "@prisma/client";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import { UserFullInfoType } from "@rms/service/user-service";
import { parentPort } from "worker_threads";

const runActionInWorker = async (params: any) => {
  try {
    const { action, key, update, body } = params;

    // Reconstruct the async function in the worker
    const result = await action();

    parentPort.postMessage({
      status: HttpStatusCode.OK,
      result,
      message: "Operation Successfully",
    });
  } catch (error) {
    parentPort.postMessage({
      status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: (error as any).message,
    });
  }
};

parentPort.on("message", (message) => {
  runActionInWorker(message);
});

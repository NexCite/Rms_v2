import { readMedia } from "@rms/service/media-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      ""?: string[];
    };
  }
) {
  if (context.params[""]) {
    if (context.params[""].join("/")) {
      var result = await readMedia(context.params[""].join("/"));

      if (!result) {
        return NextResponse.error();
      }

      return new NextResponse(result);
    }
  }
  return NextResponse.error();
}

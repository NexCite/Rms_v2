import { readLogo, readMedia } from "@rms/service/media-service";
import { File } from "@web-std/file";
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
    if (context.params[""].includes("logo")) {
      var result = (await readLogo(context.params[""].join("/"))) as any;
      if (!result) {
        return NextResponse.error();
      }

      return new NextResponse(new File([result?.file], result.name));
    } else {
      if (Number.isInteger(+context.params[""].join("/"))) {
        var result = (await readMedia(+context.params[""].join("/"))) as any;
        if (!result) {
          return NextResponse.error();
        }

        return new NextResponse(new File([result?.file], result.name));
      }
    }
  }
  return NextResponse.error();
}

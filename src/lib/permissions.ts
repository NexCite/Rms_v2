"use server";

import { $Enums } from "@prisma/client";
import { cookies } from "next/headers";

export async function setPermissions(params: $Enums.UserPermission[]) {}

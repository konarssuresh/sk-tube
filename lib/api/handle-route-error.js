import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";

export function toErrorResponse(error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      code: "INTERNAL",
      message: "Something went wrong. Please try again.",
    },
    { status: 500 },
  );
}

export async function handleRoute(handler) {
  try {
    return await handler();
  } catch (error) {
    return toErrorResponse(error);
  }
}

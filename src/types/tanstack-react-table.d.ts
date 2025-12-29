/* eslint-disable @typescript-eslint/no-unused-vars */
import "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Define custom properties for columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: {
      type: string;
      options?: Record<string | number, string>;
    };
  }
}

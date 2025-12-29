export function parseSort({
  sort: rawSort,
  allowedColumns,
  defaultSort,
  defaultSortDirection,
}: {
  sort: string | string[] | undefined;
  allowedColumns: string[];
  defaultSort?: string;
  defaultSortDirection?: "asc" | "desc";
}): {
  sort: string | undefined;
  sortDirection: "asc" | "desc" | undefined;
} {
  let sort = defaultSort;
  let sortDirection = defaultSortDirection;

  const sortableColumns = allowedColumns.map((c) => c.toLowerCase());
  if (rawSort && typeof rawSort === "string") {
    const segments = rawSort.toLowerCase().split(":");
    if (
      segments.length === 2 &&
      sortableColumns.includes(segments[0]) &&
      ["asc", "desc"].includes(segments[1])
    ) {
      sort = segments[0];
      sortDirection = segments[1] === "asc" ? "asc" : "desc";
    }
  }

  return {
    sort,
    sortDirection,
  };
}

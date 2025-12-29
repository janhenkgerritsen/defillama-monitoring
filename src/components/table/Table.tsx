import {
  ColumnDef,
  ColumnFilter,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Button from "../Button";
import { SortIcon } from "./SortIcon";
import Filter from "./Filter";

type TableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  pagination: {
    totalRows: number;
    pageIndex?: number;
    pageSize?: number;
    setPageIndex: (page: number) => void;
    setPageSize: (pageSize: number) => void;
  };
  sorting: {
    sort: string;
    sortDirection: "asc" | "desc";
    setSort: (sortColumn: string, sortDirection: "asc" | "desc") => void;
  };
  filtering: {
    filters: ColumnFilter[];
    setFilter: (column: string, value: string | number) => void;
    resetFilters: () => void;
  };
};

export default function Table<TData extends object>({
  data,
  columns,
  pagination: {
    totalRows,
    pageIndex = 0,
    pageSize = 25,
    setPageIndex,
    setPageSize,
  },
  sorting: { sort, sortDirection, setSort },
  filtering: { filters, setFilter, resetFilters },
}: TableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalRows,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting: [{ id: sort, desc: sortDirection === "desc" }],
      columnFilters: filters,
    },
  });

  function handleFirstPage() {
    setPageIndex(0);
  }

  function handlePreviousPage() {
    setPageIndex(pageIndex - 1);
  }

  function handleNextPage() {
    setPageIndex(pageIndex + 1);
  }

  function handleLastPage() {
    setPageIndex(table.getPageCount() - 1);
  }

  function handlePageSize(e: React.ChangeEvent<HTMLSelectElement>) {
    const pageSize = Number(e.target.value);
    setPageIndex(0);
    setPageSize(pageSize);
  }

  return (
    <>
      <div className="mb-2 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {table
          .getHeaderGroups()
          .map((headerGroup) =>
            headerGroup.headers
              .filter((header) => header.column.getCanFilter())
              .map((header) => (
                <Filter
                  key={header.column.id}
                  column={header.column}
                  setFilter={setFilter}
                />
              ))
          )}
      </div>
      <div className="mb-4">
        <a
          className="text-sm color-link hover:cursor-pointer"
          onClick={resetFilters}
        >
          Reset filters
        </a>
      </div>
      <div className="overflow-x-scroll scrollbar-x">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={canSort ? "cursor-pointer" : ""}
                        onClick={
                          canSort
                            ? () =>
                                setSort(
                                  header.column.id,
                                  isSorted === false
                                    ? "asc"
                                    : isSorted === "asc"
                                    ? "desc"
                                    : "asc"
                                )
                            : undefined
                        }
                      >
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && <SortIcon direction={isSorted} />}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            {table.getRowCount() === 0 ? (
              <tr>
                <td colSpan={999} className="p-8 text-center hover:bg-main">
                  No results.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {table.getRowCount() > 0 && (
        <div className="flex max-w-96 mt-5 mx-auto">
          <Button
            className="mr-3"
            onClick={handleFirstPage}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            className="mr-3"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <div className="mr-3 min-w-16 flex items-center justify-center">
            {`${pageIndex + 1} / ${table.getPageCount()}`}
          </div>
          <Button
            className="mr-3"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            className="mr-3"
            onClick={handleLastPage}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
          <select
            id="page-size"
            className="form-select"
            value={table.getState().pagination.pageSize}
            onChange={handlePageSize}
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

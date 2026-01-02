import Table from "@/components/table/Table";
import {
  FILTERS,
  FILTERABLE_COLUMNS,
  ProtocolUrlType,
  SORTABLE_COLUMNS,
  STATUS_LABELS,
  TYPE_LABELS,
  type ProtocolUrlResult,
  type ProtocolUrlResultClassification,
} from "@/shared/protocols";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, ColumnFilter } from "@tanstack/react-table";
import Link from "next/link";
import useUrlTableState from "@/hooks/url-table-state";

export async function getStaticProps() {
  return {
    props: {
      heading: "Protocol URLs",
      seo: {
        title: "Protocol URLs",
      },
    },
  };
}

const columns: ColumnDef<ProtocolUrlResult>[] = [
  {
    header: "Name",
    accessorKey: "name",
    meta: {
      filter: FILTERS["name"],
    },
  },
  {
    header: "TVL",
    accessorKey: "tvl",
    cell: ({ getValue }) => {
      const value = Number(getValue());
      return (
        "$" +
        value.toLocaleString("en-US", {
          maximumFractionDigits: 0,
        })
      );
    },
    enableColumnFilter: false,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ getValue }) => TYPE_LABELS[getValue() as ProtocolUrlType],
    enableSorting: false,
    meta: {
      filter: FILTERS["type"],
    },
  },
  {
    header: "Result",
    accessorKey: "result",
    cell: ({ getValue }) =>
      STATUS_LABELS[getValue() as ProtocolUrlResultClassification],
    enableSorting: false,
    meta: {
      filter: FILTERS["result"],
    },
  },
  {
    header: "URL",
    accessorKey: "url",
    cell: ({ getValue }) => (
      <Link href={getValue() as string} target="_blank">
        {getValue() as string}
      </Link>
    ),
    enableSorting: false,
    meta: {
      filter: FILTERS["url"],
    },
  },
];

async function fetchData({
  pageIndex,
  pageSize,
  sort,
  sortDirection,
  filters,
}: {
  pageIndex: number;
  pageSize: number;
  sort: string | undefined;
  sortDirection: "asc" | "desc" | undefined;
  filters: ColumnFilter[];
}): Promise<{
  rows: ProtocolUrlResult[];
  totalRows: number;
}> {
  const queryParams: string[] = [];
  if (sort) {
    queryParams.push(`sort=${sort}:${sortDirection}`);
  }

  for (const filter of filters) {
    queryParams.push(`${filter.id}=${filter.value}`);
  }

  queryParams.push(`page=${pageIndex + 1}`);
  queryParams.push(`pageSize=${pageSize}`);

  const url = `/api/protocols?${queryParams.join("&")}`;
  const result = await fetch(url);

  if (!result.ok) throw new Error(`Failed to fetch ${url}`);

  return await result.json();
}

export default function Protocols() {
  const {
    pageIndex,
    pageSize,
    sort,
    sortDirection,
    filters,
    setPageIndex,
    setPageSize,
    setSort,
    setFilter,
    resetFilters,
  } = useUrlTableState({
    sortableColumns: SORTABLE_COLUMNS,
    filterableColumns: FILTERABLE_COLUMNS,
  });

  const query = useQuery({
    queryKey: [
      "protocol-urls",
      pageIndex,
      pageSize,
      sort,
      sortDirection,
      filters,
    ],
    queryFn: () =>
      fetchData({ pageIndex, pageSize, sort, sortDirection, filters }),
    staleTime: 60 * 60 * 1000,
  });

  const pagination = {
    totalRows: query.data?.totalRows ?? 0,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
  };

  const sorting = {
    sort: sort ?? "tvl",
    sortDirection: sortDirection ?? "desc",
    setSort,
  };

  const filtering = {
    filters,
    setFilter,
    resetFilters,
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <Table
            columns={columns}
            data={query.data?.rows ?? []}
            pagination={pagination}
            sorting={sorting}
            filtering={filtering}
          />
        </div>
      </div>
    </>
  );
}

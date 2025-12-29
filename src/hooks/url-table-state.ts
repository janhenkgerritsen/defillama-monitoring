import { parseSort } from "@/shared/helpers";
import { ColumnFilter } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { ParsedUrlQueryInput } from "querystring";
import { useMemo } from "react";

const DEFAULT_ALLOWED_PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_SORTABLE_COLUMNS: string[] = [];
const DEFAULT_FILTERABLE_COLUMNS: string[] = [];

type UseUrlTableStateOptions = {
  defaultPageSize?: number;
  defaultPage?: number;
  pageSizeParam?: string;
  pageParam?: string;
  allowedPageSizes?: number[];
  sortParam?: string;
  sortableColumns?: string[];
  filtersParam?: string;
  filterableColumns?: string[];
};

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function useUrlTableState({
  defaultPageSize = 25,
  defaultPage = 1,
  pageSizeParam = "pageSize",
  pageParam = "page",
  allowedPageSizes = DEFAULT_ALLOWED_PAGE_SIZES,
  sortParam = "sort",
  sortableColumns = DEFAULT_SORTABLE_COLUMNS,
  filtersParam = "f",
  filterableColumns = DEFAULT_FILTERABLE_COLUMNS,
}: UseUrlTableStateOptions = {}) {
  const router = useRouter();

  const pageQuery = router.query[pageParam];
  const pageSizeQuery = router.query[pageSizeParam];
  const sortQuery = router.query[sortParam];
  const filtersQuery = router.query[filtersParam];

  const { pageIndex, pageSize } = useMemo(() => {
    const pageIndex = toNumber(pageQuery) ?? defaultPage;
    const pageSize = toNumber(pageSizeQuery) ?? defaultPageSize;

    return {
      pageIndex: Math.max(0, pageIndex - defaultPage), // Convert to 0-based
      pageSize: allowedPageSizes.includes(pageSize)
        ? pageSize
        : defaultPageSize,
    };
  }, [
    pageQuery,
    pageSizeQuery,
    defaultPage,
    defaultPageSize,
    allowedPageSizes,
  ]);

  const { sort, sortDirection } = useMemo(() => {
    return parseSort({
      sort: sortQuery,
      allowedColumns: sortableColumns,
    });
  }, [sortQuery, sortableColumns]);

  const filtersState = useMemo(() => {
    const filtersArray = Array.isArray(filtersQuery)
      ? filtersQuery
      : filtersQuery
      ? [filtersQuery]
      : [];

    const result: ColumnFilter[] = [];

    for (const filter of filtersArray) {
      const segments = filter.split(":");
      if (segments.length !== 2) continue;

      if (filterableColumns.includes(segments[0])) {
        result.push({ id: segments[0], value: segments[1] });
      }
    }

    return result;
  }, [filtersQuery, filterableColumns]);

  function pushQuery(callback: (nextQuery: ParsedUrlQueryInput) => void) {
    if (!router.isReady) return;

    const nextQuery: ParsedUrlQueryInput = { ...router.query };

    callback(nextQuery);

    // Prevent push loops if nothing effectively changed.
    // Extra defensive measure, setters should not call pushQuery() if nothing changed.
    if (shallowEqualQuery(nextQuery, router.query)) return;

    router.push({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
  }

  function setPageIndex(nextPageIndex: number) {
    const normalizedPageIndex = Math.max(0, nextPageIndex);

    if (String(normalizedPageIndex + defaultPage) === router.query[pageParam])
      return;

    pushQuery((nextQuery) => {
      if (normalizedPageIndex > 0) {
        nextQuery[pageParam] = normalizedPageIndex + defaultPage;
      } else {
        delete nextQuery[pageParam];
      }
    });
  }

  function setPageSize(nextPageSize: number) {
    if (String(nextPageSize) === router.query[pageSizeParam]) return;

    pushQuery((nextQuery) => {
      delete nextQuery[pageParam];

      if (nextPageSize === defaultPageSize) delete nextQuery[pageSizeParam];
      else nextQuery[pageSizeParam] = nextPageSize;
    });
  }

  function setSort(nextSort: string, nextSortDirection: "asc" | "desc") {
    const nextSortQuery = `${nextSort}:${nextSortDirection}`;

    if (router.query[sortParam] === nextSortQuery) return;

    pushQuery((nextQuery) => {
      delete nextQuery[pageParam];

      if (nextSort) nextQuery[sortParam] = nextSortQuery;
      else delete nextQuery[sortParam];
    });
  }

  function setFilter(column: string, value: string | number) {
    const nextFilters = [...filtersState];

    const shouldRemove = value === "" || value === undefined || value === null;
    const index = nextFilters.findIndex((f) => f.id === column);

    if (index >= 0) {
      if (shouldRemove) {
        nextFilters.splice(index, 1);
      } else {
        // Only update value if it has not changed
        if (String(nextFilters[index].value) === String(value)) return;
        nextFilters[index].value = value;
      }
    } else {
      if (shouldRemove) return;
      nextFilters.push({ id: column, value });
    }

    const filtersArray = nextFilters.map((f) => `${f.id}:${f.value}`);

    pushQuery((nextQuery) => {
      delete nextQuery[pageParam];

      if (filtersArray.length) nextQuery[filtersParam] = filtersArray;
      else delete nextQuery[filtersParam];
    });
  }

  function resetFilters() {
    pushQuery((nextQuery) => {
      delete nextQuery[pageParam];
      delete nextQuery[filtersParam];
    });
  }

  return {
    pageIndex,
    pageSize,
    sort,
    sortDirection,
    filters: filtersState,
    setPageIndex,
    setPageSize,
    setSort,
    setFilter,
    resetFilters,
  };
}

function shallowEqualQuery(a: ParsedUrlQueryInput, b: ParsedUrlQueryInput) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const k of aKeys) {
    const aValue = a[k];
    const bValue = b[k];

    // Normalize arrays vs singletons
    const aArray = Array.isArray(aValue)
      ? aValue
      : aValue === undefined
      ? []
      : [aValue];
    const bArray = Array.isArray(bValue)
      ? bValue
      : bValue === undefined
      ? []
      : [bValue];

    if (aArray.length !== bArray.length) return false;
    for (let i = 0; i < aArray.length; i++) {
      if (String(aArray[i]) !== String(bArray[i])) return false;
    }
  }

  return true;
}

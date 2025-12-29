import { protocolsUrlCache } from "@/cache";
import { parseSort } from "@/shared/helpers";
import {
  ProtocolUrlResult,
  SORTABLE_COLUMNS,
  FILTERS,
} from "@/shared/protocols";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let result = await protocolsUrlCache.getData();

    const filters: Array<{ property: string; type: string; value: string }> =
      [];
    for (const [name, filter] of Object.entries(FILTERS)) {
      if (req.query[name] && !Array.isArray(req.query[name])) {
        filters.push({
          property: name,
          type: filter!.type,
          value: req.query[name],
        });
      }
    }

    result = result.filter((r) => {
      for (const filter of filters) {
        const propertyValue = String(
          r[filter.property as keyof ProtocolUrlResult]
        ).toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.type) {
          case "text":
            if (!propertyValue.includes(filterValue)) return false;
            break;
          case "select":
            if (propertyValue !== filterValue) return false;
        }
      }

      return true;
    });

    const { sort, sortDirection } = parseSort({
      sort: req.query.sort,
      allowedColumns: SORTABLE_COLUMNS,
      defaultSort: "tvl",
      defaultSortDirection: "desc",
    });

    result = result.toSorted((a, b) => {
      const valueA = a[sort as keyof ProtocolUrlResult]!;
      const valueB = b[sort as keyof ProtocolUrlResult]!;

      if (valueA === valueB) return 0;

      const result = valueA < valueB ? -1 : 1;

      return sortDirection === "desc" ? result * -1 : result;
    });

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 25);

    const rows = result.slice((page - 1) * pageSize, page * pageSize - 1);

    res.status(200).json({
      rows,
      totalRows: result.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load data" });
  }
}

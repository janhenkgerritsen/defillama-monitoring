import { Column } from "@tanstack/react-table";
import DebouncedInput from "../DebouncedInput";

export default function Filter<TData>({
  column,
  setFilter,
}: {
  column: Column<TData, unknown>;
  setFilter: (column: string, value: string | number) => void;
}) {
  const id = `filter-${column.id}`;
  const label = column.columnDef.header;
  const filterValue = column.getFilterValue() as string;
  const { filter } = column.columnDef.meta ?? {};

  if (!filter) {
    return null;
  }

  return (
    <>
      {filter.type === "select" ? (
        <select
          id={id}
          className="form-select"
          onChange={(e) => setFilter(column.id, e.target.value)}
        >
          {Object.entries(filter.options!).map(([value, label]) => (
            <option key={label} value={value} selected={filterValue === value}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <DebouncedInput
          id={id}
          className="form-input"
          value={filterValue}
          onChange={(value) => setFilter(column.id, value)}
          placeholder={`${label}...`}
        />
      )}
    </>
  );
}

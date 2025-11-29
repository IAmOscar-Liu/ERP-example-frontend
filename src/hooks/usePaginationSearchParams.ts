import { useSearchParams } from "react-router";
import { type PageSize, type SearchQueries } from "../type";
import { useState, useEffect } from "react";

export function usePaginationSearchParams(initialSearchQueries: SearchQueries) {
  const [params, setParams] = useSearchParams();

  const [value, setValue] = useState<SearchQueries>(() => {
    if (
      params.get("page") ||
      params.get("limit") ||
      params.get("sortBy") ||
      params.get("sortDesc") ||
      params.get("textSearch") ||
      params.get("status") ||
      params.get("employeeId") ||
      params.get("from") ||
      params.get("to")
    )
      return {
        ...(params.get("page") ? { page: +params.get("page")! } : {}),
        ...(params.get("limit")
          ? { limit: +params.get("limit")! as PageSize }
          : {}),
        ...(params.get("sortBy") ? { sortBy: params.get("sortBy")! } : {}),
        ...(params.get("sortDesc")
          ? { sortDesc: params.get("sortDesc") === "true" }
          : {}),
        ...(params.get("textSearch")
          ? { textSearch: params.get("textSearch")! }
          : {}),
        ...(params.get("status") ? { status: params.get("status")! } : {}),
        ...(params.get("employeeId")
          ? { employeeId: params.get("employeeId")! }
          : {}),
        ...(params.get("from") ? { from: params.get("from")! } : {}),
        ...(params.get("to") ? { to: params.get("to")! } : {}),
      };
    return initialSearchQueries;
  });

  useEffect(() => {
    setParams(
      {
        ...(value.page ? { page: value.page + "" } : {}),
        ...(value.limit ? { limit: value.limit + "" } : {}),
        ...(value.sortBy ? { sortBy: value.sortBy + "" } : {}),
        ...(value.sortDesc !== undefined
          ? { sortDesc: value.sortDesc ? "true" : "false" }
          : {}),
        ...(value.textSearch ? { textSearch: value.textSearch + "" } : {}),
        ...(value.status ? { status: value.status + "" } : {}),
        ...(value.employeeId ? { employeeId: value.employeeId + "" } : {}),
        ...(value.from ? { from: value.from + "" } : {}),
        ...(value.to ? { to: value.to + "" } : {}),
      },
      { replace: true },
    );
  }, [value]);

  return [value, setValue] as const;
}

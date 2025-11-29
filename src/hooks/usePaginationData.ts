import { type SearchQueries } from "@/type";
import { usePaginationSearchParams } from "./usePaginationSearchParams";

export function usePaginationData(_initialQueries?: SearchQueries) {
  const initialQueries = _initialQueries ?? {};
  const [queryValue, setQueryValue] = usePaginationSearchParams({
    ...initialQueries,
    page: initialQueries.page || 1,
    limit: initialQueries.limit || 10,
  });

  const updateQueryValue = (update: SearchQueries) => {
    if (
      (update.textSearch && update.textSearch !== queryValue.textSearch) ||
      (update.limit !== undefined && update.limit !== queryValue.limit) ||
      update.sortBy !== undefined ||
      update.sortDesc != undefined ||
      (update.status && update.status !== queryValue.status) ||
      (update.employeeId && update.employeeId !== queryValue.employeeId) ||
      (update.from && update.from !== queryValue.from) ||
      (update.to && update.to !== queryValue.to)
    ) {
      return setQueryValue({ ...queryValue, ...update, page: 1 });
    }
    setQueryValue({ ...queryValue, ...update });
  };

  return [queryValue, updateQueryValue] as const;
}

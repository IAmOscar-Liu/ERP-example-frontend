import LeaveSearch from "@/feature/leave/components/LeaveSearch";
import type { SearchQueries } from "@/type";

function OvertimeSearch(props: {
  queryValue: SearchQueries;
  updateQueryValue: (update: SearchQueries) => void;
  className?: string;
  withEmployee?: boolean;
}) {
  return <LeaveSearch {...props} />;
}

export default OvertimeSearch;

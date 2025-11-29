import type { Dispatch, SetStateAction } from "react";

export type ApiResponse<T> =
  | {
      success: true;
      statusCode?: number;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: any;
    };

export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiPaginationResponse<T> =
  | {
      success: true;
      statusCode?: number;
      data: PaginationResponse<T>;
    }
  | {
      success: false;
      statusCode?: number;
      message: any;
    };

export const SEARCH_QUERY_PAGE_SIZE_SELECTIONS = [
  5, 10, 25, 50, 100, 1000,
] as const;

export type PageSize = (typeof SEARCH_QUERY_PAGE_SIZE_SELECTIONS)[number];

export interface PaginationValue extends SearchQueries {
  totalPages?: number;
  total?: number;
}

export interface SearchQueries {
  page?: number;
  limit?: PageSize;
  sortBy?: string;
  sortDesc?: boolean;
  textSearch?: string;
  status?: string;
  employeeId?: string;

  from?: string;
  to?: string;
}

export type ApiHookPropsWithoutInput = { enabled?: boolean };
export type ApiHookProps<T> = { enabled?: boolean; input: T };

export type User = {
  name: string;
  email: string;
};

export type RememberMe = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type DialogBasicProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export type DialogViewProps<T> = DialogBasicProps & { data: T };

export type DialogCreateProps = DialogBasicProps;

export type DialogUpdateProps<T> = DialogBasicProps & {
  data: T | undefined | null;
};

export type DialogEditProps<T> = DialogBasicProps &
  (
    | {
        mode: "create";
      }
    | {
        mode: "update";
        data: T | undefined | null;
      }
  );

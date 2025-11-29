import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { usePageData } from "../context/PageData";

function DefaultTitle({ className = "" }: { className?: string }) {
  const { pageTitle, pageBreadcrumbs } = usePageData();

  const separator = (
    <svg
      className="mx-2 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-600"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 13L10 3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  return (
    <div
      className={cn("flex flex-col justify-center", {
        [className]: !!className,
      })}
    >
      {pageTitle ? <h1 className="text-lg font-bold">{pageTitle}</h1> : null}
      {pageBreadcrumbs && pageBreadcrumbs.length > 0 && (
        <ol
          className="flex items-center whitespace-nowrap"
          aria-label="Breadcrumb"
        >
          {pageBreadcrumbs.map((item, index) => (
            <li
              key={`${item.path}${index}`}
              className="inline-flex items-center"
            >
              {!item.isSeparator ? (
                <>
                  {item.path ? (
                    <Link
                      className="flex items-center text-sm text-gray-500 hover:text-blue-600 focus:text-blue-600 focus:outline-none dark:focus:text-blue-500"
                      to={item.path}
                    >
                      {item.title}
                      {separator}
                    </Link>
                  ) : (
                    <p className="flex items-center text-sm text-gray-500">
                      {item.title}
                      {separator}
                    </p>
                  )}
                </>
              ) : (
                <span className="text-secondary-dark" />
              )}
            </li>
          ))}
          <li
            className="inline-flex items-center truncate text-sm font-semibold"
            aria-current="page"
          >
            {pageTitle}
          </li>
        </ol>
      )}
    </div>
  );
}

export default DefaultTitle;

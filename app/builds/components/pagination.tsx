import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildType?: string;
  search?: string;
  minLevel?: number;
  maxLevel?: number;
  sort?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildType,
  search,
  minLevel,
  maxLevel,
  sort,
}: PaginationProps) {
  // Generate the base URL with all current filters
  const generateUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Add the page parameter
    params.set("page", page.toString());
    
    // Add all other filter parameters if they exist
    if (buildType) params.set("buildType", buildType);
    if (search) params.set("search", search);
    if (minLevel !== undefined) params.set("minLevel", minLevel.toString());
    if (maxLevel !== undefined) params.set("maxLevel", maxLevel.toString());
    if (sort) params.set("sort", sort);
    
    return `/builds?${params.toString()}`;
  };

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("ellipsis1");
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("ellipsis2");
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-10">
      <nav className="flex items-center gap-1">
        {/* Previous page button */}
        <Link
          href={currentPage > 1 ? generateUrl(currentPage - 1) : "#"}
          className={`w-9 h-9 flex items-center justify-center rounded-md ${
            currentPage > 1
              ? "text-foreground/70 hover:text-primary hover:bg-primary/10"
              : "text-foreground/30 cursor-not-allowed"
          } transition-colors`}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          <span className="sr-only">Previous Page</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis1" || page === "ellipsis2") {
            return (
              <span
                key={page}
                className="w-9 h-9 flex items-center justify-center text-foreground/50"
              >
                ...
              </span>
            );
          }

          return (
            <Link
              key={index}
              href={generateUrl(page as number)}
              className={`w-9 h-9 flex items-center justify-center rounded-md ${
                currentPage === page
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/10"
              } transition-colors`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Link>
          );
        })}

        {/* Next page button */}
        <Link
          href={currentPage < totalPages ? generateUrl(currentPage + 1) : "#"}
          className={`w-9 h-9 flex items-center justify-center rounded-md ${
            currentPage < totalPages
              ? "text-foreground/70 hover:text-primary hover:bg-primary/10"
              : "text-foreground/30 cursor-not-allowed"
          } transition-colors`}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
        >
          <span className="sr-only">Next Page</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}

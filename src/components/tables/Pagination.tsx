type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const startPage = Math.max(currentPage - 1, 1);
  const endPage = Math.min(startPage + 2, totalPages);
  const pagesAroundCurrent = [];
  for (let page = startPage; page <= endPage; page++) {
    pagesAroundCurrent.push(page);
  }

  return (
    <div className="flex items-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="shadow-theme-xs me-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        الرجوع
      </button>
      <div className="flex items-center gap-2">
        {currentPage > 3 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded px-4 py-2 ${
              currentPage === page
                ? "bg-brand-blue text-white"
                : "text-gray-700 dark:text-gray-400"
            } hover:text-brand-blue dark:hover:text-brand-blue flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-blue-500/[0.08]`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="shadow-theme-xs ms-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        التالي
      </button>
    </div>
  );
};

export default Pagination;

interface PaginationProps {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    onPageChange: (page: number) => void;
}

export default function PaginationComponent({
    page,
    totalPages,
    hasNext,
    hasPrev,
    onPageChange,
}: PaginationProps) {

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 4) pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 3) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            <button
                disabled={!hasPrev}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-stone-500 font-medium px-2">
                {page} / {totalPages}
            </span>
            <button
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    )

}

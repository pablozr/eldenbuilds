import ErrorLayout from "./components/error-layout";

export default function Loading() {
  return (
    <ErrorLayout>
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary h-10 w-10 animate-spin-slow"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold font-cinzel text-primary mb-4">Loading...</h1>
        <div className="max-w-md">
          <div className="h-2 bg-primary/20 rounded animate-pulse mb-4 w-3/4 mx-auto"></div>
          <div className="h-2 bg-primary/10 rounded animate-pulse mb-4 w-1/2 mx-auto"></div>
        </div>

        {/* Loading skeleton for content */}
        <div className="w-full max-w-3xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm overflow-hidden animate-pulse">
              <div className="h-24 bg-gradient-to-br from-primary/10 to-background/30"></div>
              <div className="p-4">
                <div className="h-4 bg-primary/10 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-primary/10 rounded mb-3 w-full"></div>
                <div className="h-3 bg-primary/10 rounded mb-3 w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-primary/10 rounded w-1/4"></div>
                  <div className="h-3 bg-primary/10 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorLayout>
  );
}

import Link from "next/link";
import ErrorLayout from "./components/error-layout";

export default function NotFound() {
  return (
    <ErrorLayout>
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors group w-fit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
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
            className="text-primary h-10 w-10"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold font-cinzel text-primary mb-4">Page Not Found</h1>
        <p className="text-foreground/70 max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved. Check the URL or explore other sections of the site.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-md border border-primary/30 hover:bg-primary/10 font-medium transition-all duration-300 text-primary flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Return Home
          </Link>
          <Link
            href="/builds"
            className="px-5 py-2.5 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 shadow-[0_0_10px_rgba(200,170,110,0.1)] hover:shadow-[0_0_15px_rgba(200,170,110,0.2)] flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 14 6-6" />
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" />
              <path d="M10 4v4h6" />
            </svg>
            Browse Builds
          </Link>
        </div>
      </div>
    </ErrorLayout>
  );
}

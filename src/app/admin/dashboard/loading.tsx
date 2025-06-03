
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="flex min-h-screen bg-neutral-dark text-neutral-extralight">
      {/* Sidebar Skeleton (only for md and up) */}
      <aside className="w-64 bg-neutral-medium border-r border-neutral-light p-4 flex-col hidden md:flex">
        <div className="mb-8">
          <Skeleton className="h-7 w-3/4" /> {/* Admin Title */}
        </div>
        <div className="flex-grow space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" /> // Nav items
          ))}
        </div>
        <div className="mt-auto space-y-2">
          <Skeleton className="h-10 w-full" /> {/* Back to Site */}
          <Skeleton className="h-10 w-full" /> {/* Logout */}
        </div>
      </aside>
      {/* Main Content Area Skeleton */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <Skeleton className="h-10 w-1/3 mb-8" /> {/* Page Title */}
        <div className="space-y-8">
          {/* Card Skeleton Example (repeat as needed) */}
          <div className="bg-neutral-medium border-neutral-light p-6 rounded-lg">
            <Skeleton className="h-6 w-1/4 mb-2" /> {/* Card Title */}
            <Skeleton className="h-4 w-1/2 mb-4" /> {/* Card Description */}
            <Skeleton className="h-10 w-full mb-4" /> {/* Input field */}
            <Skeleton className="h-20 w-full mb-4" /> {/* Textarea field */}
            <Skeleton className="h-10 w-1/4" /> {/* Button */}
          </div>
          <div className="bg-neutral-medium border-neutral-light p-6 rounded-lg">
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-40 w-full" /> {/* Placeholder for a list or grid */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BuildsLoading() {
  // Create an array of 9 items for the loading skeleton
  const skeletons = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {skeletons.map((index) => (
        <div 
          key={index} 
          className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm overflow-hidden animate-pulse"
        >
          {/* Header skeleton */}
          <div className="h-24 bg-gradient-to-br from-primary/10 to-background/30 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="h-6 w-2/3 bg-primary/20 rounded"></div>
            </div>
          </div>
          
          <div className="p-4">
            {/* Description skeleton */}
            <div className="h-4 bg-primary/10 rounded mb-3"></div>
            <div className="h-4 w-3/4 bg-primary/10 rounded mb-3"></div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-3 w-6 bg-primary/10 rounded mb-1"></div>
                  <div className="h-4 w-4 bg-primary/20 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Creator info skeleton */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-full bg-primary/20"></div>
              <div className="h-3 w-20 bg-primary/10 rounded"></div>
            </div>
            
            {/* Footer skeleton */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-primary/10 rounded-full"></div>
                <div className="h-4 w-16 bg-primary/10 rounded-full"></div>
              </div>
              <div className="h-3 w-20 bg-primary/10 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

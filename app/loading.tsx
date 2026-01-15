export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <div className="h-12 bg-muted rounded-lg w-96 mx-auto mb-4"></div>
          <div className="h-6 bg-muted rounded-lg w-2/3 mx-auto mb-8"></div>
          <div className="flex gap-4 justify-center">
            <div className="h-12 bg-muted rounded-lg w-32"></div>
            <div className="h-12 bg-muted rounded-lg w-32"></div>
          </div>
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-card rounded-lg border">
              <div className="h-12 bg-muted rounded-lg w-12 mb-4"></div>
              <div className="h-6 bg-muted rounded-lg w-3/4 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-lg w-full"></div>
                <div className="h-4 bg-muted rounded-lg w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
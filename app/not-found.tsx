import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The recipe you're looking for doesn't exist or has been moved. 
          Let's get you back to discovering delicious recipes!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all inline-block"
          >
            Go Home
          </Link>
          <Link
            href="/recipes"
            className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-all inline-block"
          >
            Browse Recipes
          </Link>
        </div>
      </div>
    </div>
  )
}
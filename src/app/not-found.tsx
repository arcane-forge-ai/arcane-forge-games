import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">
            Game Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The game you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/games" className="btn-primary">
            Browse All Games
          </Link>
          <div>
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
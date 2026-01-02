import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Quiz Management System
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Create, manage, and take quizzes with ease
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-center hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              Admin Dashboard
            </Link>
            <div className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center">
              Enter Quiz ID to take a quiz
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              To take a quiz, use the URL: <code className="bg-white px-2 py-1 rounded">/quiz/[quiz-id]</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home


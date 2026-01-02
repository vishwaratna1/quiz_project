import { adminAPI } from '../api'

function QuizList({ quizzes, selectedQuiz, onQuizSelect, onQuizDeleted }) {
  const handleDelete = async (quizId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this quiz? This will delete all questions.')) {
      try {
        await adminAPI.deleteQuiz(quizId)
        onQuizDeleted()
      } catch (error) {
        console.error('Error deleting quiz:', error)
        alert('Failed to delete quiz')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Quizzes</h2>
      </div>
      <div className="divide-y">
        {quizzes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No quizzes yet</div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => onQuizSelect(quiz.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedQuiz?.id === quiz.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{quiz.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(quiz.id, e)}
                  className="ml-2 text-red-600 hover:text-red-800 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default QuizList


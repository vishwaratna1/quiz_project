import { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import QuizForm from '../components/QuizForm'
import QuizList from '../components/QuizList'
import QuestionForm from '../components/QuestionForm'

function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const response = await adminAPI.getQuizzes()
      setQuizzes(response.data)
    } catch (error) {
      console.error('Error loading quizzes:', error)
      alert('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleQuizSelect = async (quizId) => {
    try {
      const response = await adminAPI.getQuiz(quizId)
      setSelectedQuiz(response.data)
      setShowQuestionForm(false)
    } catch (error) {
      console.error('Error loading quiz:', error)
      alert('Failed to load quiz details')
    }
  }

  const handleQuizCreated = () => {
    setShowQuizForm(false)
    loadQuizzes()
  }

  const handleQuizDeleted = () => {
    setSelectedQuiz(null)
    loadQuizzes()
  }

  const handleQuestionCreated = async () => {
    setShowQuestionForm(false)
    if (selectedQuiz) {
      await handleQuizSelect(selectedQuiz.id)
    }
  }

  const handleQuestionDeleted = async () => {
    if (selectedQuiz) {
      await handleQuizSelect(selectedQuiz.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowQuizForm(true)
                  setSelectedQuiz(null)
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + New Quiz
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz List */}
          <div className="lg:col-span-1">
            <QuizList
              quizzes={quizzes}
              selectedQuiz={selectedQuiz}
              onQuizSelect={handleQuizSelect}
              onQuizDeleted={handleQuizDeleted}
            />
          </div>

          {/* Quiz Details */}
          <div className="lg:col-span-2">
            {selectedQuiz ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                    {selectedQuiz.description && (
                      <p className="text-gray-600 mt-2">{selectedQuiz.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Questions ({selectedQuiz.questions?.length || 0})
                  </h3>
                  {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                    <div className="space-y-4">
                      {selectedQuiz.questions.map((question, index) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          index={index}
                          onDeleted={handleQuestionDeleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No questions yet. Add your first question!</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">Select a quiz to view and manage questions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQuizForm && (
        <QuizForm
          quiz={selectedQuiz}
          onClose={() => setShowQuizForm(false)}
          onSuccess={handleQuizCreated}
        />
      )}

      {showQuestionForm && selectedQuiz && (
        <QuestionForm
          quizId={selectedQuiz.id}
          onClose={() => setShowQuestionForm(false)}
          onSuccess={handleQuestionCreated}
        />
      )}
    </div>
  )
}

function QuestionCard({ question, index, onDeleted }) {
  const [showEditForm, setShowEditForm] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await adminAPI.deleteQuestion(question.id)
        onDeleted()
      } catch (error) {
        console.error('Error deleting question:', error)
        alert('Failed to delete question')
      }
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      {showEditForm ? (
        <QuestionForm
          quizId={question.quiz_id}
          question={question}
          onClose={() => setShowEditForm(false)}
          onSuccess={async () => {
            setShowEditForm(false)
            onDeleted()
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700">Q{index + 1}:</span>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {question.question_type}
                </span>
                <span className="text-sm text-gray-500">({question.points} points)</span>
              </div>
              <p className="text-gray-900 mb-3">{question.question_text}</p>
              
              {question.question_type === 'text' && question.correct_answer_text && (
                <p className="text-sm text-green-700 bg-green-50 p-2 rounded mb-2">
                  Correct Answer: {question.correct_answer_text}
                </p>
              )}

              {question.options && question.options.length > 0 && (
                <div className="space-y-1">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`text-sm p-2 rounded ${
                        option.is_correct
                          ? 'bg-green-100 text-green-800 font-semibold'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      {option.option_text} {option.is_correct && '✓'}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setShowEditForm(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard


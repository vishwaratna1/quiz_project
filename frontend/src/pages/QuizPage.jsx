import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { publicAPI } from '../api'

function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [userName, setUserName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    try {
      const response = await publicAPI.getQuiz(quizId)
      setQuiz(response.data)
      // Initialize answers object
      const initialAnswers = {}
      response.data.questions.forEach((q) => {
        initialAnswers[q.id] = {
          question_id: q.id,
          selected_option_id: null,
          text_response: '',
        }
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error('Error loading quiz:', error)
      alert('Quiz not found')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [type === 'option' ? 'selected_option_id' : 'text_response']: value,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submission = {
        user_name: userName || null,
        answers: Object.values(answers),
      }

      const response = await publicAPI.submitQuiz(quizId, submission)
      setResult(response.data)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert(error.response?.data?.detail || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
              <div className="text-6xl font-bold text-indigo-600 mt-4">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-xl text-gray-600 mt-2">
                Score: {result.score} / {result.total_points} points
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Results</h2>
              {result.responses.map((response, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    response.is_correct
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{response.question_text}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            response.is_correct
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {response.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {response.points_earned} / {response.question_points} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mb-8">{quiz.description}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-8 mb-8">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        Question {index + 1}
                      </span>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {question.question_type}
                      </span>
                      <span className="text-sm text-gray-500">({question.points} points)</span>
                    </div>
                    <p className="text-lg text-gray-900">{question.question_text}</p>
                  </div>

                  {question.question_type === 'text' ? (
                    <div>
                      <textarea
                        required
                        value={answers[question.id]?.text_response || ''}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value, 'text')
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                        placeholder="Type your answer here"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={answers[question.id]?.selected_option_id === option.id}
                            onChange={() =>
                              handleAnswerChange(question.id, option.id, 'option')
                            }
                            className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            required
                          />
                          <span className="text-gray-900">{option.option_text}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuizPage


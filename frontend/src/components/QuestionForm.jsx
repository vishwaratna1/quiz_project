import { useState, useEffect } from 'react'
import { adminAPI } from '../api'

function QuestionForm({ quizId, question, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'mcq',
    points: 1,
    order: 1,
    options: [{ option_text: '', is_correct: false, order: 1 }],
    correct_answer_text: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'mcq',
        points: question.points || 1,
        order: question.order || 1,
        options: question.options?.length > 0
          ? question.options.map((opt, idx) => ({
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              order: opt.order || idx + 1,
            }))
          : [{ option_text: '', is_correct: false, order: 1 }],
        correct_answer_text: question.correct_answer_text || '',
      })
    }
  }, [question])

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options]
    if (field === 'is_correct') {
      // For MCQ and True/False, only one option can be correct
      newOptions.forEach((opt, idx) => {
        opt.is_correct = idx === index ? value : false
      })
    } else {
      newOptions[index][field] = value
    }
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { option_text: '', is_correct: false, order: formData.options.length + 1 },
      ],
    })
  }

  const removeOption = (index) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, idx) => idx !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        question_text: formData.question_text,
        question_type: formData.question_type,
        points: formData.points,
        order: formData.order,
      }

      if (formData.question_type === 'text') {
        submitData.correct_answer_text = formData.correct_answer_text
      } else {
        submitData.options = formData.options.map((opt, idx) => ({
          ...opt,
          order: idx + 1,
        }))
      }

      if (question) {
        await adminAPI.updateQuestion(question.id, submitData)
      } else {
        await adminAPI.createQuestion(quizId, submitData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving question:', error)
      alert(error.response?.data?.detail || 'Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                required
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your question"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type *
                </label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="text">Text Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {formData.question_type === 'text' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.correct_answer_text}
                  onChange={(e) => setFormData({ ...formData, correct_answer_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter the correct answer"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options * (Select one as correct)
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      required
                      value={option.option_text}
                      onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Option ${index + 1}`}
                    />
                    <label className="flex items-center px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={option.is_correct}
                        onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                        className="mr-2"
                      />
                      Correct
                    </label>
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  + Add Option
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : question ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuestionForm


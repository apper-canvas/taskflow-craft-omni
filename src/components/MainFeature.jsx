import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'
import taskService from '../services/api/taskService'

const MainFeature = ({ tasks, categories, onTaskUpdate, onTaskAdd, onTaskDelete }) => {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        dueDate: editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '',
        priority: editingTask.priority || 'medium',
        category: editingTask.category || '',
        tags: editingTask.tags || []
      })
      setShowTaskForm(true)
    }
  }, [editingTask])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: '',
      tags: []
    })
    setTagInput('')
    setEditingTask(null)
    setShowTaskForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    setLoading(true)
    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        completed: editingTask?.completed || false,
        createdAt: editingTask?.createdAt || new Date().toISOString()
      }

      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.id, taskData)
        onTaskUpdate(updatedTask)
        toast.success('Task updated successfully!')
      } else {
        const newTask = await taskService.create(taskData)
        onTaskAdd(newTask)
        toast.success('Task created successfully!')
      }
      
      resetForm()
    } catch (error) {
      toast.error('Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.update(task.id, {
        ...task,
        completed: !task.completed
      })
      onTaskUpdate(updatedTask)
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task reopened!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

const handleDeleteTask = async (taskId) => {
    try {
      const success = await taskService.delete(taskId)
      if (success) {
        onTaskDelete(taskId)
        toast.success('Task deleted successfully!')
        setSelectedTask(null)
      } else {
        toast.error('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-surface-400'
    }
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM dd, yyyy')
  }

  const getDueDateColor = (dateString, completed) => {
    if (!dateString || completed) return 'text-surface-500'
    const date = new Date(dateString)
    if (isPast(date) && !isToday(date)) return 'text-red-500'
    if (isToday(date)) return 'text-yellow-600'
    return 'text-surface-600'
  }

  return (
    <div className="space-y-6">
      {/* Create Task Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center sm:justify-start"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTaskForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Create New Task</span>
        </motion.button>
      </motion.div>

      {/* Task Creation/Edit Form */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-surface-800 dark:text-surface-100">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetForm}
                    className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field min-h-[100px] resize-none"
                      placeholder="Add task description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="input-field"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {categories?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="input-field"
                      >
                        <option value="">Select category...</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="input-field flex-1"
                        placeholder="Add a tag..."
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addTag}
                        className="px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition-colors"
                      >
                        <ApperIcon name="Plus" className="w-4 h-4" />
                      </motion.button>
                    </div>
                    {formData.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <motion.span
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <ApperIcon name="X" className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetForm}
                      className="flex-1 px-4 py-3 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        </div>
                      ) : (
                        editingTask ? 'Update Task' : 'Create Task'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {tasks?.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 rounded-3xl flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="w-12 h-12 text-surface-400" />
            </div>
            <h3 className="text-xl font-semibold text-surface-600 dark:text-surface-300 mb-2">
              No tasks yet
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              Create your first task to get started with TaskFlow
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  key={task?.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`task-card p-4 sm:p-6 rounded-2xl cursor-pointer group ${
                    task?.completed ? 'opacity-75' : ''
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleComplete(task)
                      }}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task?.completed
                          ? 'bg-secondary border-secondary'
                          : 'border-surface-300 hover:border-secondary'
                      }`}
                    >
                      {task?.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="task-completed"
                        >
                          <ApperIcon name="Check" className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-surface-800 dark:text-surface-100 truncate ${
                            task?.completed ? 'line-through opacity-60' : ''
                          }`}>
                            {task?.title || 'Untitled Task'}
                          </h3>
                          {task?.description && (
                            <p className={`text-sm text-surface-600 dark:text-surface-400 mt-1 line-clamp-2 ${
                              task?.completed ? 'opacity-60' : ''
                            }`}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task?.priority)}`} />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingTask(task)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-all"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4 text-surface-500" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-sm">
                          {task?.dueDate && (
                            <span className={`font-medium ${getDueDateColor(task.dueDate, task?.completed)}`}>
                              <ApperIcon name="Calendar" className="w-4 h-4 inline mr-1" />
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                          {task?.category && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {task.category}
                            </span>
                          )}
                        </div>

                        {task?.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {task.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="px-2 py-1 bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 rounded-full text-xs">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-surface-800 dark:text-surface-100">
                    Task Details
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTask(null)}
                    className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getPriorityColor(selectedTask?.priority)}`} />
                    <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100">
                      {selectedTask?.title || 'Untitled Task'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTask?.completed 
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-accent/20 text-accent'
                    }`}>
                      {selectedTask?.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  {selectedTask?.description && (
                    <div>
                      <h4 className="font-medium text-surface-700 dark:text-surface-300 mb-2">Description</h4>
                      <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTask?.dueDate && (
                      <div>
                        <h4 className="font-medium text-surface-700 dark:text-surface-300 mb-1">Due Date</h4>
                        <p className={`${getDueDateColor(selectedTask.dueDate, selectedTask?.completed)}`}>
                          {formatDueDate(selectedTask.dueDate)}
                        </p>
                      </div>
                    )}

                    {selectedTask?.category && (
                      <div>
                        <h4 className="font-medium text-surface-700 dark:text-surface-300 mb-1">Category</h4>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {selectedTask.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedTask?.tags?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-surface-700 dark:text-surface-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingTask(selectedTask)
                        setSelectedTask(null)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteTask(selectedTask?.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import taskService from '../services/api/taskService'
import categoryService from '../services/api/categoryService'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [tasksResult, categoriesResult] = await Promise.all([
          taskService.getAll(),
          categoryService.getAll()
        ])
        setTasks(tasksResult || [])
        setCategories(categoriesResult || [])
      } catch (err) {
        console.error('Failed to load data:', err)
        setError(err?.message || 'Failed to load data')
        setTasks([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const filteredTasks = tasks?.filter(task => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'completed' && task?.completed) ||
      (activeFilter === 'pending' && !task?.completed)
    
    const matchesSearch = !searchQuery || 
      task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  }) || []

  const stats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(task => task?.completed)?.length || 0,
    pending: tasks?.filter(task => !task?.completed)?.length || 0,
    overdue: tasks?.filter(task => {
      if (!task?.dueDate || task?.completed) return false
      return new Date(task.dueDate) < new Date()
    })?.length || 0
  }

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks?.map(task => 
        task?.id === updatedTask?.id ? updatedTask : task
      ) || []
    )
  }

  const handleTaskAdd = (newTask) => {
    setTasks(prevTasks => [...(prevTasks || []), newTask])
  }

  const handleTaskDelete = (taskId) => {
    setTasks(prevTasks => 
      prevTasks?.filter(task => task?.id !== taskId) || []
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertTriangle" className="w-12 h-12 text-accent mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-effect border-b border-white/20 dark:border-surface-700/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </motion.div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl glass-effect hover:bg-white/20 dark:hover:bg-surface-700/20 transition-colors"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="w-5 h-5 text-surface-600 dark:text-surface-300" 
                />
              </motion.button>
              
              <div className="hidden sm:flex items-center space-x-4 px-4 py-2 rounded-xl glass-effect">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-surface-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">{stats.completed}</div>
                  <div className="text-xs text-surface-500">Done</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{stats.pending}</div>
                  <div className="text-xs text-surface-500">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Stats */}
      <div className="sm:hidden px-4 pt-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="text-center p-3 glass-effect rounded-xl">
            <div className="text-lg font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-surface-500">Total</div>
          </div>
          <div className="text-center p-3 glass-effect rounded-xl">
            <div className="text-lg font-bold text-secondary">{stats.completed}</div>
            <div className="text-xs text-surface-500">Done</div>
          </div>
          <div className="text-center p-3 glass-effect rounded-xl">
            <div className="text-lg font-bold text-accent">{stats.pending}</div>
            <div className="text-xs text-surface-500">Pending</div>
          </div>
        </motion.div>
      </div>

      {/* Filter and Search */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'completed'].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-soft'
                    : 'glass-effect text-surface-600 dark:text-surface-300 hover:bg-white/20 dark:hover:bg-surface-700/20'
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <MainFeature 
          tasks={filteredTasks}
          categories={categories}
          onTaskUpdate={handleTaskUpdate}
          onTaskAdd={handleTaskAdd}
          onTaskDelete={handleTaskDelete}
        />
      </main>
    </div>
  )
}

export default Home
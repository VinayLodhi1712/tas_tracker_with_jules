import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Clock, Target, TrendingUp, Sparkles, Zap, Star, Filter } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      setTasks(prev => [...prev, data]);
      setTitle('');
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}/toggle`, {
        method: 'PATCH',
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      });
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'completed') return tasks.filter(task => task.completed);
    if (filter === 'active') return tasks.filter(task => !task.completed);
    return tasks;
  }, [tasks, filter]);

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-600/20 to-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="pt-12 pb-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 mb-6 hover:bg-white/15 transition-all duration-300">
              <Sparkles className="text-yellow-400 animate-pulse" size={20} />
              <span className="text-white/90 font-medium">Professional Task Management</span>
              <Star className="text-yellow-400 animate-pulse" size={20} />
            </div>
            
            <h1 className="text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4 tracking-tight">
              Task<span className="text-yellow-400">Pro</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Elevate your productivity with our premium task management solution
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        {showStats && (
          <div className="px-6 mb-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/30 rounded-xl">
                        <Target className="text-blue-300" size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">{totalCount}</p>
                        <p className="text-blue-200 text-sm font-medium">Total Tasks</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-500/30 rounded-xl">
                        <CheckCircle className="text-green-300" size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">{completedCount}</p>
                        <p className="text-green-200 text-sm font-medium">Completed</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-500/30 rounded-xl">
                        <Clock className="text-orange-300" size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">{totalCount - completedCount}</p>
                        <p className="text-orange-200 text-sm font-medium">Pending</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-1000" style={{ width: `${100 - progressPercentage}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-500/30 rounded-xl">
                        <TrendingUp className="text-purple-300" size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">{progressPercentage.toFixed(0)}%</p>
                        <p className="text-purple-200 text-sm font-medium">Progress</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Add Task Section */}
            <div className="group relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                    <Zap className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Create New Task</h2>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What amazing thing will you accomplish today?"
                      className="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  
                  <button
                    onClick={handleAdd}
                    disabled={isLoading || !title.trim()}
                    className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/25 hover:shadow-2xl hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                      )}
                      <span>Add Task</span>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Filter className="text-white/70" size={20} />
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All Tasks', color: 'from-slate-600 to-slate-700' },
                    { key: 'active', label: 'Active', color: 'from-blue-600 to-blue-700' },
                    { key: 'completed', label: 'Completed', color: 'from-green-600 to-green-700' }
                  ].map((filterType) => (
                    <button
                      key={filterType.key}
                      onClick={() => setFilter(filterType.key)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                        filter === filterType.key
                          ? `bg-gradient-to-r ${filterType.color} text-white shadow-lg`
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {filterType.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Calendar className="text-white/70" size={20} />
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {filter === 'all' ? 'No tasks yet' : 
                     filter === 'active' ? 'No active tasks' : 
                     'No completed tasks'}
                  </h3>
                  <p className="text-white/60 text-lg">
                    {filter === 'all' ? 'Create your first task to get started!' : 
                     filter === 'active' ? 'All caught up! Great work!' : 
                     'Complete some tasks to see them here!'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      task.completed 
                        ? 'from-green-600/20 to-emerald-600/20' 
                        : 'from-blue-600/20 to-purple-600/20'
                    } rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-2xl ${
                      task.completed ? 'opacity-75' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                              task.completed 
                                ? 'bg-green-500/30 hover:bg-green-500/40' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            {task.completed ? (
                              <CheckCircle size={24} className="text-green-400" />
                            ) : (
                              <Circle size={24} className="text-white/70 hover:text-white" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <span
                              className={`text-lg font-medium transition-all duration-300 ${
                                task.completed
                                  ? 'text-white/60 line-through'
                                  : 'text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">
                                {new Date(task.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {task.completed && (
                                <div className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
                                  ✓ Completed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Progress Section */}
            {totalCount > 0 && (
              <div className="mt-12 group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Overall Progress</h3>
                        <p className="text-white/60">Keep up the great work!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">{completedCount}/{totalCount}</p>
                      <p className="text-white/60">tasks completed</p>
                    </div>
                  </div>
                  
                  <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-white/60 text-sm">0%</span>
                    <span className="text-lg font-bold text-white">{progressPercentage.toFixed(0)}% Complete</span>
                    <span className="text-white/60 text-sm">100%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
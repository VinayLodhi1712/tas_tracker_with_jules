import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Clock, Target, TrendingUp, Sparkles, Zap, Star, Filter, Tag as TagIcon, XCircle, CalendarDays, ArrowDownUp, ArrowDownNarrowWide, ArrowUpWideNarrow, SortAlphaDown, SortAlphaUp, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [currentTag, setCurrentTag] = useState(''); 
  const [dueDate, setDueDate] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const [tagFilter, setTagFilter] = useState(null); 
  const [sortBy, setSortBy] = useState('newest'); 
  const [searchQuery, setSearchQuery] = useState(''); // State for immediate search input
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery); // State for debounced search query
  const [showStats, setShowStats] = useState(true);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchTasks();
  }, [tagFilter, sortBy, debouncedSearchQuery]); // Re-fetch tasks when tag filter, sort order, or debounced search query changes

  // Fetches tasks from the backend.
  // Server-side filtering is applied for tags, sorting, and search.
  // Client-side filtering (via useMemo for filteredTasks) is applied for task status (all/active/completed).
  const fetchTasks = async () => {
    try {
      let url = 'http://localhost:5000/api/tasks';
      const params = new URLSearchParams();

      if (tagFilter) {
        params.append('tag', tagFilter);
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }
      if (debouncedSearchQuery.trim() !== '') {
        params.append('search', debouncedSearchQuery.trim());
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    const tags = currentTag.split(',').map(tag => tag.trim()).filter(tag => tag);
    const taskData = { title: title.trim(), tags };
    if (dueDate) {
      taskData.dueDate = dueDate;
    }

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      // Optimistically add the new task to the local state.
      // For stricter consistency with server-side sorting/filtering, 
      // one might prefer to call fetchTasks() here to get the updated list.
      // However, this optimistic update provides a faster UI response.
      setTasks(prev => [...prev, data]); 
      setTitle('');
      setCurrentTag(''); 
      setDueDate(''); 
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
    // Prevent adding task if Enter is pressed in the tag input field
    if (e.key === 'Enter' && e.target.id !== 'tag-input') { 
      handleAdd();
    }
  };

  // Client-side filtering based on the 'filter' state (all, active, completed).
  // This operates on the 'tasks' array which is already potentially filtered 
  // by tag, search, and sorted by the server.
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
                  <div className="flex-1 space-y-4">
                    <div className="relative group">
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
                    <div className="relative group">
                      <input
                        type="text"
                        id="tag-input" // Added id for handleKeyPress check
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add tags (e.g., work, personal, urgent)"
                        className="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <div className="relative group">
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                        title="Set due date"
                      />
                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
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
            <div className="flex flex-col gap-6 mb-8"> 
              <div className="flex items-center gap-4"> {/* Row for Search */}
                <SearchIcon className="text-white/70" size={20} />
                <span className="text-white/80 font-medium">Search:</span>
                <div className="flex-1 relative group">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tasks (title, description, tags)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent backdrop-blur-sm hover:bg-white/10 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4"> {/* Row for Status Filters */}
                <Filter className="text-white/70" size={20} />
                <span className="text-white/80 font-medium">Filter:</span>
                <div className="flex gap-2 items-center">
                  {[
                    { key: 'all', label: 'All Tasks', color: 'from-slate-600 to-slate-700' },
                    { key: 'active', label: 'Active', color: 'from-blue-600 to-blue-700' },
                    { key: 'completed', label: 'Completed', color: 'from-green-600 to-green-700' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => { setFilter(item.key); setTagFilter(null); setSortBy('newest'); }}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                        filter === item.key
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  {tagFilter && (
                    <button
                      onClick={() => setTagFilter(null)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-600/80 text-white hover:bg-red-700/80 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <XCircle size={18} />
                      Tag: {tagFilter}
                    </button>
                  )}
                </div>
                 <button
                onClick={() => setShowStats(!showStats)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 ml-auto" /* Added ml-auto */
              >
                <Calendar className="text-white/70" size={20} />
              </button>
              </div>
              <div className="flex items-center gap-4">
                <ArrowDownUp className="text-white/70" size={20} />
                <span className="text-white/80 font-medium">Sort by:</span>
                <div className="flex gap-2 items-center">
                  {[
                    { key: 'newest', label: 'Newest', icon: <ArrowDownNarrowWide size={16} className="mr-1.5" /> },
                    { key: 'oldest', label: 'Oldest', icon: <ArrowUpWideNarrow size={16} className="mr-1.5" /> },
                    { key: 'alphabetical', label: 'A-Z', icon: <SortAlphaDown size={16} className="mr-1.5" /> },
                    { key: 'dueDateAsc', label: 'Due Date Asc', icon: <CalendarDays size={16} className="mr-1.5" /> },
                    { key: 'dueDateDesc', label: 'Due Date Desc', icon: <CalendarDays size={16} className="mr-1.5" /> }
                  ].map((sortOption) => (
                    <button
                      key={sortOption.key}
                      onClick={() => setSortBy(sortOption.key)}
                      className={`flex items-center px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                        sortBy === sortOption.key
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {sortOption.icon} {sortOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {debouncedSearchQuery ? `No tasks found for "${debouncedSearchQuery}"` :
                     tagFilter ? `No tasks with tag "${tagFilter}"` : 
                     filter === 'all' ? 'No tasks yet' : 
                     filter === 'active' ? 'No active tasks' : 
                     'No completed tasks'}
                  </h3>
                  <p className="text-white/60 text-lg">
                    {debouncedSearchQuery ? 'Try a different search term or clear other filters.' :
                     tagFilter ? 'Try a different tag or clear the filter.' :
                     filter === 'all' ? 'Create your first task to get started!' : 
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
                            <div className="flex items-center gap-4 mt-1"> {/* Reduced margin top for date/tags */}
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
                            {task.tags && task.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {task.tags.map(tag => (
                                  <span 
                                    key={tag} 
                                    className="text-xs bg-purple-500/40 text-purple-200 px-3 py-1 rounded-full cursor-pointer hover:bg-purple-500/60 transition-all duration-200 hover:shadow-md"
                                    onClick={() => setTagFilter(tag)}
                                  >
                                    <TagIcon size={12} className="inline mr-1" />{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="mt-2 text-xs flex items-center">
                                <CalendarDays size={14} className={`mr-1.5 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-400' : 'text-blue-300'}`} />
                                <span className={`font-medium px-2 py-1 rounded-full ${
                                  new Date(task.dueDate) < new Date() && !task.completed 
                                    ? 'bg-red-500/30 text-red-300' 
                                    : 'bg-blue-500/30 text-blue-300'
                                }`}>
                                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {new Date(task.dueDate) < new Date() && !task.completed && (
                                  <span className="ml-2 text-red-400 font-semibold">(Overdue)</span>
                                )}
                              </div>
                            )}
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
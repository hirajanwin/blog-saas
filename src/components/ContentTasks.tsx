import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface ContentTasksProps {
  postId: string;
  tasks: Task[];
  teamMembers: Array<{ id: string; name: string; avatar?: string }>;
  currentUserId: string;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function ContentTasks({
  postId,
  tasks,
  teamMembers,
  currentUserId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: ContentTasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignedToId: '',
    dueDate: '',
  });
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const assignedTo = newTask.assignedToId
      ? teamMembers.find(m => m.id === newTask.assignedToId)
      : undefined;

    onAddTask({
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name, avatar: assignedTo.avatar } : undefined,
      dueDate: newTask.dueDate || undefined,
    });

    setNewTask({ title: '', description: '', priority: 'medium', assignedToId: '', dueDate: '' });
    setIsAdding(false);
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          
          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                {task.assignedTo.avatar ? (
                  <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{task.assignedTo.name}</span>
              </div>
            )}
            
            {task.dueDate && (
              <span className={`flex items-center space-x-1 ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{isOverdue(task.dueDate) ? 'Overdue: ' : ''}{formatDate(task.dueDate)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <select
            value={task.status}
            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Task['status'] })}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          
          <button
            onClick={() => onDeleteTask(task.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Content Workflow
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Task['status'] | 'all')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks ({tasks.length})</option>
            <option value="todo">To Do ({tasksByStatus.todo.length})</option>
            <option value="in_progress">In Progress ({tasksByStatus.in_progress.length})</option>
            <option value="review">Review ({tasksByStatus.review.length})</option>
            <option value="done">Done ({tasksByStatus.done.length})</option>
          </select>
          
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
          >
            {isAdding ? 'Cancel' : 'Add Task'}
          </Button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Review introduction section"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add details about the task..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={newTask.assignedToId}
                  onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newTask.title.trim()}>
                Create Task
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>No tasks yet</p>
            <p className="text-sm mt-1">Create tasks to manage your content workflow</p>
          </div>
        ) : (
          <>
            {filter === 'all' ? (
              <>
                {tasksByStatus.todo.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      To Do ({tasksByStatus.todo.length})
                    </h4>
                    <div className="space-y-2">{tasksByStatus.todo.map(renderTask)}</div>
                  </div>
                )}
                
                {tasksByStatus.in_progress.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      In Progress ({tasksByStatus.in_progress.length})
                    </h4>
                    <div className="space-y-2">{tasksByStatus.in_progress.map(renderTask)}</div>
                  </div>
                )}
                
                {tasksByStatus.review.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Review ({tasksByStatus.review.length})
                    </h4>
                    <div className="space-y-2">{tasksByStatus.review.map(renderTask)}</div>
                  </div>
                )}
                
                {tasksByStatus.done.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Done ({tasksByStatus.done.length})
                    </h4>
                    <div className="space-y-2">{tasksByStatus.done.map(renderTask)}</div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">{filteredTasks.map(renderTask)}</div>
            )}
          </>
        )}
      </div>

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex space-x-4">
              <span className="text-gray-600">
                {tasks.filter(t => t.status === 'done').length}/{tasks.length} completed
              </span>
              <span className="text-gray-600">
                {tasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== 'done').length} overdue
              </span>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { Task };
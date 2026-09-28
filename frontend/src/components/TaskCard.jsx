import React from 'react';
import { Check, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';

export function TaskCard({ task, onToggleComplete, onDelete }) {
  const isCompleted = Boolean(task.completed);

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return <span className="badge badge-high"><AlertCircle size={12} /> High</span>;
      case 'low':
        return <span className="badge badge-low">Low</span>;
      default:
        return <span className="badge badge-medium">Medium</span>;
    }
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return null;
    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${day} ${MONTHS[month - 1]} ${year}`;
  };

  return (
    <div className={`glass-card task-card ${isCompleted ? 'completed' : ''}`} data-task-id={task.id}>
      <div 
        className={`custom-checkbox ${isCompleted ? 'checked' : ''}`} 
        onClick={() => onToggleComplete(task)}
        role="checkbox"
        aria-checked={isCompleted}
        id={`toggle-task-${task.id}`}
        title={isCompleted ? 'Mark as active' : 'Mark as completed'}
      >
        {isCompleted && <Check size={16} strokeWidth={3} />}
      </div>

      <div className="task-content">
        <div className="task-header">
          <h4 className="task-title">{task.title}</h4>
          <div className="task-actions">
            <button 
              className="delete-btn" 
              onClick={() => onDelete(task.id)}
              title="Delete task"
              id={`delete-task-${task.id}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        <div className="task-meta">
          {getPriorityBadge(task.priority)}
          
          {task.category && (
            <span className="badge badge-category">
              <Tag size={10} />
              {task.category}
            </span>
          )}

          <span className="task-date">
            <Calendar size={12} />
            {formatDueDate(task.due_date) || 'No Due Date'}
          </span>
        </div>
      </div>
    </div>
  );
}

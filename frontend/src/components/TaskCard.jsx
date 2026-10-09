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

  // due_date is a date-only "YYYY-MM-DD" string. We must NOT run it through
  // `new Date(dateStr)` + local-timezone `toLocaleDateString`: `new Date('YYYY-MM-DD')`
  // is parsed as UTC midnight, and rendering it with local-timezone fields shifts
  // the displayed day back by one in any timezone behind UTC (e.g. US/Americas).
  // Instead, parse the stored calendar-date components directly so the displayed
  // date always matches the stored value regardless of the viewer's timezone.
  // Month name is taken from a fixed 3-letter table (not Intl) to guarantee the
  // "Sep" (3-letter) shape required by AC-002, since locale ICU data can render
  // the 4-letter "Sept" instead.
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
      if (!match) throw new Error('Unrecognized date format');
      const [, yearStr, monthStr, dayStr] = match;
      const day = parseInt(dayStr, 10);
      const month = MONTHS[parseInt(monthStr, 10) - 1];
      if (!month || Number.isNaN(day)) throw new Error('Invalid date components');
      return `${day} ${month} ${yearStr}`;
    } catch {
      return dateStr;
    }
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
            {task.due_date ? formatDate(task.due_date) : 'No Due Date'}
          </span>
        </div>
      </div>
    </div>
  );
}

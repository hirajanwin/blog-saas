import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';

interface ContentItem {
  id: string;
  title: string;
  type: 'post' | 'social' | 'email' | 'task';
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: string;
  assignee?: string;
  color: string;
}

interface ContentCalendarProps {
  items: ContentItem[];
  onMoveItem: (itemId: string, newDate: string) => void;
  onAddItem: (date: string) => void;
  onEditItem: (item: ContentItem) => void;
}

export default function ContentCalendar({
  items,
  onMoveItem,
  onAddItem,
  onEditItem,
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number; fullDate: string; items: ContentItem[] }> = [];

    // Empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: 0, fullDate: '', items: [] });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayItems = items.filter(item => item.scheduledDate === fullDate);
      days.push({ date: day, fullDate, items: dayItems });
    }

    return days;
  }, [currentDate, items]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    if (draggedItem && date) {
      onMoveItem(draggedItem, date);
      setDraggedItem(null);
    }
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'post': return '📝';
      case 'social': return '📱';
      case 'email': return '📧';
      case 'task': return '✅';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Content Calendar</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Button size="sm" onClick={() => onAddItem(new Date().toISOString().split('T')[0])}>
            + Add Content
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day, index) => {
            const isToday = day.fullDate === new Date().toISOString().split('T')[0];
            const isWeekend = index % 7 === 0 || index % 7 === 6;

            return (
              <div
                key={index}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.fullDate)}
                className={`min-h-[120px] border rounded-lg p-2 transition-colors ${
                  day.date === 0
                    ? 'bg-gray-50 border-gray-100'
                    : isToday
                    ? 'bg-blue-50 border-blue-300'
                    : isWeekend
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {day.date > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {day.date}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {day.items.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(item.id)}
                          onClick={() => onEditItem(item)}
                          className={`text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(item.status)}`}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{getTypeIcon(item.type)}</span>
                            <span className="truncate">{item.title}</span>
                          </div>
                        </div>
                      ))}
                      
                      {day.items.length === 0 && (
                        <button
                          onClick={() => onAddItem(day.fullDate)}
                          className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 border border-dashed border-gray-200 rounded hover:border-gray-300"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-600">Legend:</span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
            <span>Published</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></span>
            <span>Scheduled</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></span>
            <span>Draft</span>
          </span>
          <span className="text-gray-400">• Drag items to reschedule</span>
        </div>
      </div>
    </div>
  );
}

export type { ContentItem };
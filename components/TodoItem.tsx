'use client';

import { Item } from '@/types';
import { useState, useEffect, useRef } from 'react';

interface TodoItemProps {
  item: Item;
  onUpdate: () => void;
  showReorder?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isTodayView?: boolean;
}

export default function TodoItem({
  item,
  onUpdate,
  showReorder = true,
  canMoveUp = true,
  canMoveDown = true,
  isTodayView = false,
}: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHovered && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDelete();
      }
      if (isHovered && e.key === 'Escape') {
        handleClearDate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, item.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDatePicker) {
        setShowDatePicker(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showDatePicker]);

  const handleComplete = async () => {
    await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !item.is_completed }),
    });
    onUpdate();
  };

  const handleDelete = async () => {
    await fetch(`/api/items/${item.id}`, {
      method: 'DELETE',
    });
    onUpdate();
  };

  const handleReorder = async (direction: 'up' | 'down') => {
    await fetch('/api/items/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        direction,
        categoryId: item.category_id,
        isTodayView,
      }),
    });
    onUpdate();
  };

  const handleSetDate = async (date: string) => {
    if (!date) return;

    await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: date }),
    });
    setShowDatePicker(false);
    onUpdate();
  };

  const handleClearDate = async () => {
    await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: null }),
    });
    onUpdate();
  };

  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Get local date, not UTC
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: today }),
    });
    onUpdate();
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return '📅';

    try {
      // Date string is already in YYYY-MM-DD format
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) {
        return '📅';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';

      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    } catch (e) {
      return '📅';
    }
  };

  const isOverdue = () => {
    if (!item.due_date) return false;

    try {
      const dueDate = new Date(item.due_date + 'T00:00:00');
      if (isNaN(dueDate.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return dueDate < today && !item.is_completed;
    } catch (e) {
      return false;
    }
  };

  return (
    <>
      <div
        ref={itemRef}
        className={`flex items-center gap-2 p-3 border rounded-lg bg-white transition-all ${
          isHovered ? 'shadow-md' : ''
        } ${isOverdue() ? 'border-red-500 border-2' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
      >
        {/* Reorder buttons */}
        {showReorder && (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleReorder('up')}
              disabled={!canMoveUp}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ▲
            </button>
            <button
              onClick={() => handleReorder('down')}
              disabled={!canMoveDown}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ▼
            </button>
          </div>
        )}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.is_completed}
          onChange={handleComplete}
          className="w-5 h-5 cursor-pointer"
        />

        {/* Content */}
        <span className={`flex-1 ${item.is_completed ? 'line-through text-gray-400' : ''}`}>
          {item.content}
        </span>

        {/* Schedule button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDatePicker(!showDatePicker);
            }}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
          >
            {item.due_date ? formatDueDate(item.due_date) : '📅'}
          </button>
          {showDatePicker && (
            <div
              className="absolute right-0 mt-2 p-2 bg-white border rounded shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="date"
                value={item.due_date || ''}
                onChange={(e) => handleSetDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

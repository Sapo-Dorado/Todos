'use client';

import { Item } from '@/types';
import { useState, useEffect, useRef } from 'react';

interface TodoItemProps {
  item: Item;
  onUpdate: () => void;
  showReorder?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export default function TodoItem({
  item,
  onUpdate,
  showReorder = true,
  canMoveUp = true,
  canMoveDown = true,
}: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHovered && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, item.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
      if (showDatePicker) {
        setShowDatePicker(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showContextMenu, showDatePicker]);

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

  const handleSetDueToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: today }),
    });
    setShowContextMenu(false);
    onUpdate();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const formatDueDate = (dateValue: string | Date | null) => {
    if (!dateValue) return '📅';

    // Parse the date properly - handle both string and Date objects
    let dateString: string;
    if (typeof dateValue === 'string') {
      dateString = dateValue;
    } else {
      dateString = dateValue.toISOString().split('T')[0];
    }

    const date = new Date(dateString + 'T00:00:00');
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
  };

  const isOverdue = () => {
    if (!item.due_date) return false;

    let dateString: string;
    if (typeof item.due_date === 'string') {
      dateString = item.due_date;
    } else {
      dateString = item.due_date.toISOString().split('T')[0];
    }

    const dueDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate < today && !item.is_completed;
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
                value={item.due_date ? (typeof item.due_date === 'string' ? item.due_date : item.due_date.toISOString().split('T')[0]) : ''}
                onChange={(e) => handleSetDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white border rounded shadow-lg py-1 z-50"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleSetDueToday}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Set due today
          </button>
        </div>
      )}
    </>
  );
}

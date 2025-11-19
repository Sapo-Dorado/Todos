'use client';

import { useState, useEffect } from 'react';
import { Item, Category, Universe } from '@/types';
import TodoItem from '@/components/TodoItem';

export default function TodayPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [newItemContent, setNewItemContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Get local date, not UTC
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUniverses();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  const fetchUniverses = async () => {
    const res = await fetch('/api/universes');
    const data = await res.json();
    setUniverses(data);
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/items?date=${today}`);
      const data = await res.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        // Sort to put items with today_position first, nulls last
        const sorted = data.sort((a: Item, b: Item) => {
          // First sort by is_completed
          if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
          }
          // Then by today_position (nulls last)
          if (a.today_position === null && b.today_position === null) return 0;
          if (a.today_position === null) return 1;
          if (b.today_position === null) return -1;
          return a.today_position - b.today_position;
        });
        setItems(sorted);
      } else {
        console.error('API did not return an array:', data);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleAddItem = async () => {
    if (!newItemContent.trim() || !selectedCategoryId) return;

    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newItemContent,
        category_id: selectedCategoryId,
        due_date: today,
      }),
    });

    setNewItemContent('');
    setShowAddForm(false);
    fetchItems();
  };

  const handleDeleteCompleted = async () => {
    await fetch('/api/items/completed', {
      method: 'DELETE',
    });
    fetchItems();
  };

  const incompleteItems = items.filter((item) => !item.is_completed);
  const completedItems = items.filter((item) => item.is_completed);

  // Group incomplete items by universe
  const itemsByUniverse: { [universeId: number]: Item[] } = {};
  incompleteItems.forEach((item) => {
    const category = categories.find(cat => cat.id === item.category_id);
    if (category) {
      const universeId = category.universe_id;
      if (!itemsByUniverse[universeId]) {
        itemsByUniverse[universeId] = [];
      }
      itemsByUniverse[universeId].push(item);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Add Item Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 mb-4 border-2 border-dashed rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400"
          >
            + Add Item
          </button>
        )}

        {/* Add Item Form */}
        {showAddForm && (
          <div className="mb-4 p-4 border rounded-lg bg-white">
            <input
              type="text"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
              placeholder="What needs to be done?"
              className="w-full mb-2 p-2 border rounded"
              autoFocus
            />
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="w-full mb-2 p-2 border rounded"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemContent('');
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Items List - Grouped by Universe */}
        <div className="space-y-6">
          {universes.map((universe) => {
            const universeItems = itemsByUniverse[universe.id] || [];
            if (universeItems.length === 0) return null;

            return (
              <div key={universe.id}>
                {/* Universe Label */}
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                  {universe.name}
                </div>

                {/* Items in this universe */}
                <div className="space-y-2">
                  {universeItems.map((item, index) => (
                    <TodoItem
                      key={item.id}
                      item={item}
                      onUpdate={fetchItems}
                      showReorder={true}
                      canMoveUp={index > 0}
                      canMoveDown={index < universeItems.length - 1}
                      isTodayView={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                Completed
              </div>
              <div className="space-y-2">
                {completedItems.map((item) => (
                  <TodoItem
                    key={item.id}
                    item={item}
                    onUpdate={fetchItems}
                    showReorder={false}
                    isTodayView={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No items for today. Add one to get started!
          </div>
        )}
      </div>

      {/* Erase Completed Button - Fixed at bottom right */}
      {completedItems.length > 0 && (
        <button
          onClick={handleDeleteCompleted}
          className="fixed bottom-8 right-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow-lg"
        >
          Erase Completed
        </button>
      )}
    </div>
  );
}

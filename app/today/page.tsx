'use client';

import { useState, useEffect } from 'react';
import { Item, Category } from '@/types';
import TodoItem from '@/components/TodoItem';
import Link from 'next/link';

export default function TodayPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItemContent, setNewItemContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  const fetchItems = async () => {
    const res = await fetch(`/api/items?date=${today}`);
    const data = await res.json();
    // Sort: incomplete items first, then completed
    const sorted = data.sort((a: Item, b: Item) => {
      if (a.is_completed === b.is_completed) {
        return a.position - b.position;
      }
      return a.is_completed ? 1 : -1;
    });
    setItems(sorted);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Today</h1>
          <div className="flex gap-4">
            <Link
              href="/overview"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Overview
            </Link>
            {completedItems.length > 0 && (
              <button
                onClick={handleDeleteCompleted}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Erase Completed
              </button>
            )}
          </div>
        </div>

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

        {/* Items List */}
        <div className="space-y-2">
          {incompleteItems.map((item, index) => (
            <TodoItem
              key={item.id}
              item={item}
              onUpdate={fetchItems}
              showReorder={true}
              canMoveUp={index > 0}
              canMoveDown={index < incompleteItems.length - 1}
            />
          ))}
          {completedItems.map((item) => (
            <TodoItem
              key={item.id}
              item={item}
              onUpdate={fetchItems}
              showReorder={false}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No items for today. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

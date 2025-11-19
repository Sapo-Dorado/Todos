'use client';

import { useState, useEffect } from 'react';
import { Item, Category } from '@/types';
import TodoItem from '@/components/TodoItem';

export default function OverviewPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<{ [key: number]: Item[] }>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [addingItemToCategory, setAddingItemToCategory] = useState<number | null>(null);
  const [newItemContent, setNewItemContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchCategories(), fetchItems()]);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data: Item[] = await res.json();

    // Group items by category
    const grouped: { [key: number]: Item[] } = {};
    data.forEach((item) => {
      if (!grouped[item.category_id]) {
        grouped[item.category_id] = [];
      }
      grouped[item.category_id].push(item);
    });

    // Sort items within each category
    Object.keys(grouped).forEach((categoryId) => {
      grouped[Number(categoryId)].sort((a, b) => {
        if (a.is_completed === b.is_completed) {
          return a.position - b.position;
        }
        return a.is_completed ? 1 : -1;
      });
    });

    setItemsByCategory(grouped);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName }),
    });

    setNewCategoryName('');
    setShowCategoryForm(false);
    fetchData();
  };

  const handleDeleteCategory = async (categoryId: number) => {
    await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
    fetchData();
  };

  const handleAddItem = async (categoryId: number) => {
    if (!newItemContent.trim()) return;

    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newItemContent,
        category_id: categoryId,
      }),
    });

    setNewItemContent('');
    setAddingItemToCategory(null);
    fetchData();
  };

  const handleDeleteCompleted = async () => {
    await fetch('/api/items/completed', {
      method: 'DELETE',
    });
    fetchData();
  };

  const hasCompletedItems = Object.values(itemsByCategory)
    .flat()
    .some((item) => item.is_completed);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {hasCompletedItems && (
          <div className="flex justify-end mb-8">
            <button
              onClick={handleDeleteCompleted}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Erase Completed
            </button>
          </div>
        )}

        {/* Add Category Button */}
        {!showCategoryForm && (
          <button
            onClick={() => setShowCategoryForm(true)}
            className="w-full p-4 mb-6 border-2 border-dashed rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400"
          >
            + Add Category
          </button>
        )}

        {/* Add Category Form */}
        {showCategoryForm && (
          <div className="mb-6 p-4 border rounded-lg bg-white">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
              placeholder="Category name"
              className="w-full mb-2 p-2 border rounded"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCategoryForm(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const items = itemsByCategory[category.id] || [];
            const incompleteItems = items.filter((item) => !item.is_completed);
            const completedItems = items.filter((item) => item.is_completed);
            const isEmpty = items.length === 0;

            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Category Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  {isEmpty && (
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      -
                    </button>
                  )}
                </div>

                {/* Add Item Button */}
                {addingItemToCategory !== category.id && (
                  <button
                    onClick={() => setAddingItemToCategory(category.id)}
                    className="w-full p-3 mb-3 border-2 border-dashed rounded text-gray-400 hover:text-gray-600 hover:border-gray-400"
                  >
                    + Add Item
                  </button>
                )}

                {/* Add Item Form */}
                {addingItemToCategory === category.id && (
                  <div className="mb-3 p-3 border rounded bg-gray-50">
                    <input
                      type="text"
                      value={newItemContent}
                      onChange={(e) => setNewItemContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddItem(category.id);
                        }
                      }}
                      placeholder="What needs to be done?"
                      className="w-full mb-2 p-2 border rounded"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddItem(category.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingItemToCategory(null);
                          setNewItemContent('');
                        }}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  {incompleteItems.map((item, index) => (
                    <TodoItem
                      key={item.id}
                      item={item}
                      onUpdate={fetchData}
                      showReorder={true}
                      canMoveUp={index > 0}
                      canMoveDown={index < incompleteItems.length - 1}
                    />
                  ))}
                  {completedItems.map((item) => (
                    <TodoItem
                      key={item.id}
                      item={item}
                      onUpdate={fetchData}
                      showReorder={false}
                    />
                  ))}
                </div>

                {isEmpty && (
                  <div className="text-center text-gray-400 py-4">
                    No items in this category
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No categories yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

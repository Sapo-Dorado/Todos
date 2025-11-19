'use client';

import { useState, useEffect } from 'react';
import { Universe } from '@/types';

export default function UniversesPage() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [newUniverseName, setNewUniverseName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUniverses();
  }, []);

  const fetchUniverses = async () => {
    const res = await fetch('/api/universes');
    const data = await res.json();
    setUniverses(data);
  };

  const handleAddUniverse = async () => {
    if (!newUniverseName.trim()) return;

    await fetch('/api/universes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newUniverseName }),
    });

    setNewUniverseName('');
    setShowAddForm(false);
    fetchUniverses();
  };

  const handleDeleteUniverse = async (universeId: number) => {
    const res = await fetch(`/api/universes/${universeId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchUniverses();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Universes</h1>

        {/* Add Universe Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 mb-6 border-2 border-dashed rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400"
          >
            + Add Universe
          </button>
        )}

        {/* Add Universe Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-white">
            <input
              type="text"
              value={newUniverseName}
              onChange={(e) => setNewUniverseName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddUniverse();
                }
              }}
              placeholder="Universe name"
              className="w-full mb-2 p-2 border rounded"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddUniverse}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewUniverseName('');
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Universes List */}
        <div className="space-y-4">
          {universes.map((universe) => (
            <div
              key={universe.id}
              className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center"
            >
              <h2 className="text-2xl font-semibold">{universe.name}</h2>
              <button
                onClick={() => handleDeleteUniverse(universe.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {universes.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No universes yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSync } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
  slug: string;
  movieCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });
  const [error, setError] = useState('');

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      setError('Error fetching categories');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setFormData({ name: '', slug: '' });
    setShowModal(true);
  };

  const handleEditClick = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (categoryId: string) => {
    if (!confirm('Are you sure you want to remove this category from all movies? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        // Update the movie count to 0 for this category
        setCategories(categories.map(cat => 
          cat._id === categoryId ? { ...cat, movieCount: 0 } : cat
        ));
      } else {
        setError(data.message || 'Failed to remove category from movies');
      }
    } catch (error) {
      setError('Error removing category from movies');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = modalMode === 'add' 
        ? '/api/categories' 
        : `/api/categories/${selectedCategory?._id}`;
      
      const response = await fetch(url, {
        method: modalMode === 'add' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        if (modalMode === 'add') {
          setCategories([...categories, data.data]);
        } else {
          setCategories(categories.map(cat => 
            cat._id === selectedCategory?._id ? data.data : cat
          ));
        }
        setShowModal(false);
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch (error) {
      setError('Error saving category');
      console.error('Error:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      name,
      slug: generateSlug(name)
    });
  };

  const handleRefresh = async () => {
    await fetchCategories();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1">
            Manage movie categories (synced with phimapi.com)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <FaSync />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleAddClick}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Categories table */}
      <div className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Slug
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Movies
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {categories.map(category => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{category.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{category.movieCount || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEditClick(category)}
                    className="text-blue-500 hover:text-blue-400 mr-3"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(category._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
              onClick={() => setShowModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-zinc-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-white mb-4">
                    {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
                  </h3>
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="bg-zinc-700 text-white block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-400 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="bg-zinc-700 text-white block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="bg-zinc-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {modalMode === 'add' ? 'Add' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-zinc-800 text-base font-medium text-gray-300 hover:bg-zinc-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
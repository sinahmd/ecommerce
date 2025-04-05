'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import CategoryModal from '../components/CategoryModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { toast } from '@/hooks/use-toast';

// Default placeholder image as data URL
const DATA_URL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M16 12h-8'%3E%3C/path%3E%3Cpath d='M12 8v8'%3E%3C/path%3E%3C/svg%3E";

// Interface for categories from the API
interface CategoryFromAPI {
  id: number;
  name: string;
  description: string;
  image: string | null;
  product_count: number;
}

// Interface for the CategoryModal component
interface CategoryForModal {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryForModal | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching categories...');
      const response = await fetch('/api/admin/categories');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error parsing response' }));
        console.error('Categories API Error:', errorData);
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Categories fetched successfully:', data);
      
      // Verify the data structure
      if (!Array.isArray(data)) {
        console.error('Invalid API response format:', data);
        throw new Error('Invalid API response format: Expected an array');
      }
      
      setCategories(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Failed to fetch categories:', error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditClick = (category: CategoryFromAPI) => {
    const modalCategory: CategoryForModal = {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image || undefined
    };
    setSelectedCategory(modalCategory);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: CategoryFromAPI) => {
    setSelectedCategoryId(category.id);
    setSelectedCategoryName(category.name);
    setIsDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchCategories();
  };

  const renderLoadingState = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      <p className="text-center mt-4 text-gray-500">Loading categories...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-red-600 mb-4">Failed to load categories</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={handleRefresh}>
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <div className="bg-white rounded-lg shadow">
          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No categories found. Create your first category!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image ? (
                        <div className="h-12 w-12 relative">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="rounded-md object-cover"
                            unoptimized={!category.image.startsWith('http')}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = DATA_URL_PLACEHOLDER;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{category.product_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(category)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(category)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchCategories}
      />

      {selectedCategory && (
        <CategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchCategories}
          category={selectedCategory}
        />
      )}

      {selectedCategoryId && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={fetchCategories}
          itemId={selectedCategoryId}
          itemType="category"
          itemName={selectedCategoryName}
        />
      )}
    </div>
  );
} 
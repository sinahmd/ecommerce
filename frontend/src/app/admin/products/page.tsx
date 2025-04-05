'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ProductModal from '../components/ProductModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

// Interface for products from the API
interface ProductFromAPI {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: {
    id: number;
    name: string;
  }[];
  category_names: string[];
  image: string | null;
  available: boolean;
  created_at: string;
}

// Interface for the ProductModal component
interface ProductForModal {
  id: number;
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
  categories: number[] | string[];
  available: boolean;
  image?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductForModal | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error: unknown) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product: ProductFromAPI) => {
    console.log("Original product for edit:", product);
    console.log("Categories from API:", product.categories);
    
    // Handle different formats of categories from API
    // Sometimes categories come as array of objects, sometimes as array of numbers
    let categoryIds: string[] = [];
    
    if (product.categories) {
      if (product.categories.length > 0) {
        // Check if categories are objects with id property or direct numbers
        if (typeof product.categories[0] === 'object' && product.categories[0] !== null) {
          // Categories are objects with id property
          categoryIds = product.categories
            .filter(cat => cat && cat.id !== undefined && cat.id !== null)
            .map(cat => String(cat.id));
        } else {
          // Categories are direct number values
          categoryIds = product.categories.map(cat => String(cat));
        }
      }
    }
    
    console.log("Extracted and filtered category IDs:", categoryIds);
    
    const modalProduct: ProductForModal = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categories: categoryIds,
      available: product.available,
      image: product.image || undefined
    };
    
    console.log("Prepared product for modal:", modalProduct);
    setSelectedProduct(modalProduct);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: ProductFromAPI) => {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.image ? (
                    <div className="h-12 w-12 relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {product.category_names && product.category_names.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.category_names.map((catName, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                          >
                            {catName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No categories</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(product)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClick(product)}
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
      </div>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProducts}
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchProducts}
          product={selectedProduct}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedProductId && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={fetchProducts}
          itemId={selectedProductId}
          itemType="product"
          itemName={selectedProductName}
        />
      )}
    </div>
  );
} 
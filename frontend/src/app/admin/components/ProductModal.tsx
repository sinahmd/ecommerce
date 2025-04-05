'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

// Debug function to print the structure of an object
const debugObject = (obj: unknown): string => {
  if (Array.isArray(obj)) {
    return `Array(${obj.length}): [${obj.map(item => typeof item + ':' + item).join(', ')}]`;
  }
  return JSON.stringify(obj);
};

interface Category {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
  categories: number[] | string[];
  available: boolean;
  image?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: Product; // For edit mode
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  console.log('ProductModal rendered with product:', product ? 'Product exists' : 'No product');
  console.log('Product categories:', product?.categories ? debugObject(product.categories) : 'No categories');
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    categories: product?.categories || [],
    available: product?.available !== undefined ? product.available : true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(product?.categories) 
      ? product?.categories
          .filter(c => c !== undefined && c !== null)
          .map(c => String(c)) 
      : []
  );

  // Reset form when product changes (for edit mode)
  useEffect(() => {
    if (product) {
      console.log('Product for edit:', product);
      console.log('Product categories type:', Array.isArray(product.categories) ? 'array' : typeof product.categories);
      console.log('Product categories values:', product.categories);
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '0',
        categories: product.categories || [],
        available: product.available !== undefined ? product.available : true,
      });
      
      // Convert all categories to strings for consistent comparison
      const categoryIds = Array.isArray(product.categories) 
        ? product.categories
            .filter(c => c !== undefined && c !== null)
            .map(c => String(c))
        : [];
      
      console.log('Setting selected categories to:', categoryIds);
      setSelectedCategories(categoryIds);
      setImagePreview(product.image || '');
    } else {
      // Reset form when no product is provided (for create mode)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '0',
        categories: [],
        available: true,
      });
      setSelectedCategories([]);
      setImagePreview('');
    }
  }, [product]);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        console.log('Fetched categories:', data);
        setCategories(data);
      } catch (error: unknown) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId: string, selected: boolean) => {
    console.log('Category change:', categoryId, 'selected:', selected);
    console.log('Current selectedCategories before change:', selectedCategories);
    
    // Update the selected categories state
    const newSelectedCategories = selected
      ? [...selectedCategories, categoryId].filter((id, index, self) => self.indexOf(id) === index) // Add, ensure unique
      : selectedCategories.filter(id => id !== categoryId); // Remove
    
    console.log('New selectedCategories after change:', newSelectedCategories);
    setSelectedCategories(newSelectedCategories);
    
    // Update form data with the new categories array
    setFormData(prev => {
      // Convert prev.categories to string[] to ensure type consistency
      const currentCategories = Array.isArray(prev.categories) 
        ? prev.categories.map(c => String(c))
        : [];
      
      // Use the same logic as above for consistency
      const updatedCategories = selected
        ? [...currentCategories, categoryId].filter((id, index, self) => self.indexOf(id) === index)
        : currentCategories.filter(id => id !== categoryId);
      
      console.log('Updated form data categories:', updatedCategories);
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });
  };

  const handleAvailableChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      available: checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name || selectedCategories.length === 0 || !formData.price) {
        throw new Error('Please fill out all required fields');
      }

      // Validate price is a number
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      // Validate stock is a number
      if (isNaN(parseInt(formData.stock))) {
        throw new Error('Stock must be a valid number');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      
      // Add each category ID to the form data
      selectedCategories.forEach(categoryId => {
        formDataToSend.append('categories', categoryId);
      });
      
      formDataToSend.append('available', formData.available.toString());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (product?.id) {
        // Edit mode
        response = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Create mode
        response = await fetch('/api/admin/products', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      toast({
        title: "Success",
        description: product?.id ? "Product updated successfully" : "Product created successfully",
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '0',
        categories: [],
        available: true,
      });
      setImageFile(null);
      setImagePreview('');
      
      // Close modal and refresh list
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product?.id ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
              {categories.map((category) => {
                const categoryIdString = String(category.id);
                const isChecked = selectedCategories.includes(categoryIdString);
                console.log(`Category ${category.id} (${category.name}) checked:`, isChecked, 
                  'categoryIdString:', categoryIdString, 
                  'selectedCategories:', selectedCategories);
                
                return (
                  <div key={category.id} className="flex items-center space-x-2 py-1">
                    <Checkbox 
                      id={`category-${category.id}`} 
                      checked={isChecked}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(categoryIdString, checked === true)
                      }
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                );
              })}
              {categories.length === 0 && isFetchingCategories && (
                <div className="text-center py-2 text-sm text-gray-500">
                  Loading categories...
                </div>
              )}
              {categories.length === 0 && !isFetchingCategories && (
                <div className="text-center py-2 text-sm text-gray-500">
                  No categories available
                </div>
              )}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please select at least one category
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Product name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product description"
              className="h-20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                required  
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="relative w-full h-40 mt-2">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={formData.available}
              onCheckedChange={handleAvailableChange}
            />
            <Label htmlFor="available">Available for sale</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (product?.id ? "Updating..." : "Creating...") 
                : (product?.id ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Category {
  id?: number;
  name: string;
  description: string;
  image?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  category?: Category; // For edit mode
}

export default function CategoryModal({ isOpen, onClose, onSuccess, category }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(category?.image || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset form when category changes (for edit mode)
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
      setImagePreview(category.image || '');
    }
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (category?.id) {
        // Edit mode
        response = await fetch(`/api/admin/categories/${category.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Create mode
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save category');
      }

      toast({
        title: "Success",
        description: category?.id ? "Category updated successfully" : "Category created successfully",
      });
      
      // Reset form
      setFormData({ name: '', description: '' });
      setImageFile(null);
      setImagePreview('');
      
      // Close modal and refresh list
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category?.id ? "Edit Category" : "Add New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Category name"
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
              placeholder="Category description"
              className="h-20"
            />
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
                  alt="Category preview"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
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
              {isLoading ? (category?.id ? "Updating..." : "Creating...") : (category?.id ? "Update Category" : "Create Category")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
'use client';

import { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  itemId: number;
  itemType: 'product' | 'category';
  itemName: string;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemType,
  itemName
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/${itemType}s/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }

      toast({
        title: "Success",
        description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`,
      });
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to delete ${itemType}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{itemName}</strong> {itemType === 'product' 
              ? 'and all associated data.' 
              : 'and may affect products assigned to this category.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
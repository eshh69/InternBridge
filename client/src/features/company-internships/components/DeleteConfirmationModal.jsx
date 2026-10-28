import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  internshipTitle = '',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete Listing"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Listing
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">
            Are you sure you want to delete this internship listing?
          </p>
          {internshipTitle && (
            <p className="text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
              "{internshipTitle}"
            </p>
          )}
          <p className="text-xs text-gray-500">
            This action cannot be undone. Student applications associated with this post will no longer be active.
          </p>
        </div>
      </div>
    </Modal>
  );
};

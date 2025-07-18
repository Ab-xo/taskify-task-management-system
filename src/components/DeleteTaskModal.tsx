import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle
}) => {
  const [deleteText, setDeleteText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (deleteText.toLowerCase() === 'delete') {
      onConfirm();
      setDeleteText('');
      onClose();
    }
  };

  const handleClose = () => {
    setDeleteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-black mb-4">Delete Task</h2>
        <p className="text-gray-600 mb-6">
          This action can't be undone. Enter the word "delete" in the given field below to delete task
        </p>
        
        <Input
          value={deleteText}
          onChange={(e) => setDeleteText(e.target.value)}
          placeholder="Type delete in here"
          className="mb-6 border-gray-300"
        />
        
        <div className="flex gap-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleteText.toLowerCase() !== 'delete'}
            className="flex-1 bg-[#ec4c7d] hover:bg-[#d43e6b] text-white"
          >
            Delete Task
          </Button>
        </div>
      </div>
    </div>
  );
};
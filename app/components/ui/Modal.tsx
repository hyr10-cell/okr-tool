import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
  showFooter = true,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} p-6`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

        <div className="mb-6">{children}</div>

        {showFooter && (
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={onClose} variant="secondary">
              {cancelText}
            </Button>
            {onConfirm && <Button onClick={onConfirm}>{confirmText}</Button>}
          </div>
        )}
      </div>
    </div>
  );
}

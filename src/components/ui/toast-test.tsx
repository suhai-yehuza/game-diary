'use client';

import React from 'react';

import { useToast } from '@/components/ui/use-toast';

export function ToastTest() {
  const { toast } = useToast();

  const testSuccessToast = () => {
    toast({
      title: '🎉 Success Test',
      description: 'This is a success toast test!',
    });
  };

  const testErrorToast = () => {
    toast({
      title: '❌ Error Test', 
      description: 'This is an error toast test!',
      variant: 'destructive',
    });
  };

  const testBasicToast = () => {
    toast({
      title: '🧪 Basic Test',
      description: 'This is a basic toast test!',
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <button
        onClick={testBasicToast}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Test Basic Toast
      </button>
      <button
        onClick={testSuccessToast}
        style={{
          padding: '8px 16px',
          backgroundColor: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Test Success Toast
      </button>
      <button
        onClick={testErrorToast}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Test Error Toast
      </button>
    </div>
  );
} 
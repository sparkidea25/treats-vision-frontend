import React from 'react';

interface StreamPreviewButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title: string
}

export const StreamPreviewButton: React.FC<StreamPreviewButtonProps> = ({ 
  onClick, 
  disabled = false,
  className = "",
  title = ""
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative
        px-6 py-2
        bg-lime-50
        border-4 border-black
        rounded-full
        text-black text-lg font-medium
        transition-all duration-150
        hover:translate-y-[-2px]
        hover:shadow-[0_6px_0_0_#000]
        active:translate-y-0
        active:shadow-[0_2px_0_0_#000]
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:translate-y-0
        disabled:hover:shadow-[0_4px_0_0_#000]
        shadow-[0_4px_0_0_#000]
        ${className}
      `}
      style={{
        backgroundColor: '#fefdf8'
      }}
    >
      {title}
    </button>
  );
};
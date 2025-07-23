import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ListboxProps {
  value: any;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

interface ListboxButtonProps {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

interface ListboxOptionsProps {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
   onChange?: (value: string) => void;
  currentValue?: string;
}

interface ListboxOptionProps {
  value: string;
  children: React.ReactNode;
  onChange?: (value: string) => void;
  setIsOpen?: (open: boolean) => void;
  currentValue?: string;
}


export const Listbox = ({ value, onChange, children }: ListboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              value,
              onChange,
              isOpen,
              setIsOpen,
              currentValue: value,
            })
          : child // return child as-is if it's not a valid ReactElement
      )}
    </div>
  );
};


export const ListboxButton: React.FC<ListboxButtonProps> = ({ 
  children, 
  isOpen = false, 
  setIsOpen = () => {} 
}) => (
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  >
    <div className="flex items-center gap-3">
      {children}
    </div>
    <ChevronDown 
      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
        isOpen ? 'rotate-180' : ''
      }`} 
    />
  </button>
);
// export const ListboxOptions = ({ children, isOpen = false, setIsOpen = () => {} }) => (
export const ListboxOptions: React.FC<ListboxOptionsProps> = ({ 
  children, 
  isOpen = false, 
  setIsOpen = () => {},
  onChange,
  currentValue
}) => (
  <>
   {isOpen && (
      <>
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
          {React.Children.map(children, child => 
            React.cloneElement(child as React.ReactElement, { 
              onChange, 
              setIsOpen,
              currentValue
            })
          )}
        </div>
      </>
    )}
  </>
);

export const ListboxOption: React.FC<ListboxOptionProps> = ({ 
  value, 
  children, 
  onChange = () => {}, 
  setIsOpen = () => {}, 
  currentValue 
}) => (
  <button
    onClick={() => {
      onChange(value);
      setIsOpen(false);
    }}
    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-purple-50 transition-colors ${
      currentValue === value ? 'bg-purple-100' : ''
    }`}
  >
    {children}
  </button>
);

Listbox.Button = ListboxButton;
Listbox.Options = ListboxOptions;
Listbox.Option = ListboxOption;
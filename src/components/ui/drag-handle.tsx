import React from 'react';

const DragHandle: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`grid grid-cols-2 gap-0.5 w-3 h-4 ${className}`}>
      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
    </div>
  );
};

export default DragHandle;
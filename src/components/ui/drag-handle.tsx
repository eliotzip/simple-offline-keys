import React from 'react';

const DragHandle: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`grid grid-cols-2 gap-0.5 w-2.5 h-3 ${className}`}>
      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-60"></div>
      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-60"></div>
      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-60"></div>
      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-60"></div>
      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-60"></div>
      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-60"></div>
    </div>
  );
};

export default DragHandle;
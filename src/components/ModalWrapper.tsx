import React from 'react';
import { motion } from 'motion/react';
import { ScrollableWrapper } from './common/ScrollableWrapper';

interface ModalWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalWrapper({ title, onClose, children }: ModalWrapperProps) {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left"
    >
      <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
        <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-805">{title}</h4>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-650 text-xs font-mono font-bold"
        >
          CLOSE
        </button>
      </div>
      <ScrollableWrapper className="p-5 flex-1 min-h-0">
        {children}
      </ScrollableWrapper>
    </motion.div>
  );
}

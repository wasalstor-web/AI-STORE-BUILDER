import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { EditorSection } from './types';

interface Props {
  section: EditorSection;
  isActive: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onSelect: () => void;
}

export default function SortableSection({ section, isActive, onToggle, onRemove, onSelect }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        isDragging
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 z-50'
          : isActive
            ? 'border-primary/50 bg-primary/5'
            : 'border-dark-border bg-dark-surface hover:border-dark-hover'
      } ${!section.enabled ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-1 rounded hover:bg-dark-hover cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-text-muted" />
      </button>

      {/* Icon */}
      <span className="text-lg">{section.icon}</span>

      {/* Label */}
      <span className="flex-1 text-sm font-medium truncate">{section.label}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-text-primary transition-colors"
          title="إعدادات"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-text-primary transition-colors"
          title={section.enabled ? 'إخفاء' : 'إظهار'}
        >
          {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-danger transition-colors"
          title="حذف"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

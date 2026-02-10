import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Undo2,
  Redo2,
  Save,
  Monitor,
  Smartphone,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

import SortableSection from "./SortableSection";
import SectionProperties from "./SectionProperties";
import StorePreview from "./StorePreview";
import {
  SECTION_TEMPLATES,
  createSection,
  DEFAULT_SECTIONS,
  type EditorSection,
} from "./types";

interface Props {
  storeName?: string;
  primaryColor?: string;
  initialSections?: EditorSection[];
  onSave?: (sections: EditorSection[]) => void;
}

export default function StoreEditor({
  storeName = "متجري",
  primaryColor = "#6c5ce7",
  initialSections,
  onSave,
}: Props) {
  const [sections, setSections] = useState<EditorSection[]>(
    initialSections || DEFAULT_SECTIONS,
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [showPreview, setShowPreview] = useState(true);
  const [history, setHistory] = useState<EditorSection[][]>([
    initialSections || DEFAULT_SECTIONS,
  ]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const pushHistory = useCallback(
    (newSections: EditorSection[]) => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIdx + 1);
        return [...trimmed, newSections];
      });
      setHistoryIdx((i) => i + 1);
    },
    [historyIdx],
  );

  const updateSections = useCallback(
    (newSections: EditorSection[]) => {
      setSections(newSections);
      pushHistory(newSections);
    },
    [pushHistory],
  );

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setSections(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setSections(history[historyIdx + 1]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      updateSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const addSection = (type: string) => {
    const newSection = createSection(type as EditorSection["type"]);
    updateSections([...sections, newSection]);
    setActiveId(newSection.id);
    setShowAddPanel(false);
    toast.success(`تم إضافة: ${newSection.label}`);
  };

  const removeSection = (id: string) => {
    updateSections(sections.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const toggleSection = (id: string) => {
    updateSections(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const updateProps = (id: string, props: Record<string, unknown>) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, props } : s)));
  };

  const handleSave = () => {
    onSave?.(sections);
    toast.success("تم حفظ التصميم! ✅");
  };

  const activeSection = sections.find((s) => s.id === activeId) || null;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4">
      {/* Left Panel — Sections List */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col glass-card overflow-hidden max-h-[40vh] lg:max-h-none">
        {/* Toolbar */}
        <div className="p-3 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIdx <= 0}
              className="p-1.5 rounded-lg hover:bg-dark-hover disabled:opacity-30 transition-colors"
              title="تراجع"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIdx >= history.length - 1}
              className="p-1.5 rounded-lg hover:bg-dark-hover disabled:opacity-30 transition-colors"
              title="إعادة"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            حفظ
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  isActive={activeId === section.id}
                  onToggle={() => toggleSection(section.id)}
                  onRemove={() => removeSection(section.id)}
                  onSelect={() => setActiveId(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add Section Button */}
          <button
            type="button"
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="w-full border-2 border-dashed border-dark-border hover:border-primary rounded-xl p-3 text-sm text-text-muted hover:text-primary-light transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة قسم
          </button>
        </div>

        {/* Add Panel */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-dark-border overflow-hidden"
            >
              <div className="p-3 max-h-60 overflow-y-auto space-y-1">
                <p className="text-xs text-text-muted mb-2">
                  اختر قسماً لإضافته:
                </p>
                {SECTION_TEMPLATES.filter(
                  (t) =>
                    !sections.some(
                      (s) =>
                        s.type === t.type &&
                        ["hero", "newsletter"].includes(s.type),
                    ),
                ).map((template) => (
                  <button
                    key={template.type}
                    type="button"
                    onClick={() => addSection(template.type)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark-hover transition-colors text-right"
                  >
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{template.label}</p>
                      <p className="text-xs text-text-muted truncate">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center — Preview */}
      {showPreview && (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 bg-dark-surface rounded-xl p-1 border border-dark-border">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded-lg transition-colors ${previewMode === "desktop" ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded-lg transition-colors ${previewMode === "mobile" ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-text-muted">معاينة مباشرة</span>
          </div>

          {/* Preview Frame */}
          <div
            className={`flex-1 flex items-start justify-center overflow-hidden ${previewMode === "mobile" ? "px-[25%]" : ""}`}
          >
            <div
              className={`h-full transition-all duration-300 ${previewMode === "mobile" ? "w-[375px]" : "w-full"}`}
            >
              <StorePreview
                sections={sections}
                primaryColor={primaryColor}
                storeName={storeName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Right Panel — Properties */}
      <div className="w-full lg:w-64 shrink-0 glass-card overflow-hidden flex flex-col max-h-[40vh] lg:max-h-none">
        <div className="p-3 border-b border-dark-border flex items-center justify-between">
          <span className="text-sm font-semibold">الإعدادات</span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-1.5 rounded-lg transition-colors ${showPreview ? "text-primary-light" : "text-text-muted"}`}
            title={showPreview ? "إخفاء المعاينة" : "إظهار المعاينة"}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SectionProperties section={activeSection} onUpdate={updateProps} />
        </div>
      </div>
    </div>
  );
}

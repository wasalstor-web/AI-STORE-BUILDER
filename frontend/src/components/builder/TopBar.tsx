import { memo } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Undo2,
  Redo2,
  Code2,
  Download,
  Rocket,
  ChevronRight,
  Zap,
  Share2,
} from "lucide-react";

interface TopBarProps {
  storeName: string;
  historyIndex: number;
  historyLength: number;
  previewDevice: "desktop" | "tablet" | "mobile";
  showCode: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeviceChange: (device: "desktop" | "tablet" | "mobile") => void;
  onCodeToggle: () => void;
  onDownload: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export default memo(function TopBar({
  storeName,
  historyIndex,
  historyLength,
  previewDevice,
  showCode,
  onBack,
  onUndo,
  onRedo,
  onDeviceChange,
  onCodeToggle,
  onDownload,
  onPublish,
  isPublishing,
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between h-11 px-3 bg-[#0e1015] border-b border-white/6 shrink-0 select-none">
      {/* ── Left: Logo + Project ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-white/30 hover:text-white/70 p-1 transition-colors"
          title="رجوع"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/15">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-[13px] text-white/90 truncate max-w-[140px]">
            {storeName}
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/15 text-[9px] font-semibold text-violet-400 tracking-wide">
          AI PRO
        </span>
      </div>

      {/* ── Center: Controls ── */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <IconBtn onClick={onUndo} disabled={historyIndex <= 0} title="تراجع">
          <Undo2 className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn
          onClick={onRedo}
          disabled={historyIndex >= historyLength - 1}
          title="إعادة"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </IconBtn>
        <div className="w-px h-4 bg-white/8 mx-1.5" />

        {/* Device Switcher */}
        <div className="flex items-center gap-0.5 rounded-lg bg-white/4 border border-white/6 p-0.5">
          <DeviceBtn
            icon={Monitor}
            active={previewDevice === "desktop"}
            onClick={() => onDeviceChange("desktop")}
          />
          <DeviceBtn
            icon={Tablet}
            active={previewDevice === "tablet"}
            onClick={() => onDeviceChange("tablet")}
          />
          <DeviceBtn
            icon={Smartphone}
            active={previewDevice === "mobile"}
            onClick={() => onDeviceChange("mobile")}
          />
        </div>
        <div className="w-px h-4 bg-white/8 mx-1.5" />

        {/* Code Toggle */}
        <IconBtn onClick={onCodeToggle} active={showCode} title="عرض الكود">
          <Code2 className="w-3.5 h-3.5" />
        </IconBtn>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1.5">
        <IconBtn onClick={onDownload} title="تحميل HTML">
          <Download className="w-3.5 h-3.5" />
        </IconBtn>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="hidden sm:flex p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          title="مشاركة"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Publish Button */}
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-violet-600 to-blue-600 text-white text-xs font-semibold hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Rocket className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isPublishing ? "جاري النشر..." : "نشر"}</span>
        </button>
      </div>
    </div>
  );
});

/* ── Icon Button ── */
const IconBtn = memo(function IconBtn({
  onClick,
  disabled,
  active,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        active
          ? "bg-violet-500/20 text-violet-400"
          : "text-white/30 hover:text-white/70 hover:bg-white/5"
      } disabled:opacity-20 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
});

/* ── Device Button ── */
const DeviceBtn = memo(function DeviceBtn({
  icon: Icon,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-md transition-all ${
        active
          ? "bg-violet-500/25 text-violet-400 shadow-sm"
          : "text-white/30 hover:text-white/60"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
});

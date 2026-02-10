import { memo, useRef, useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";

interface PreviewPanelProps {
  currentHTML: string;
  deviceWidth: string;
  showCode: boolean;
  isGenerating: boolean;
  storeName?: string;
}

export default memo(function PreviewPanel({
  currentHTML,
  deviceWidth,
  showCode,
  isGenerating,
  storeName = "my-store",
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [zoom, setZoom] = useState(100);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (doc) {
      const start = performance.now();
      doc.open();
      doc.write(currentHTML);
      doc.close();
      const elapsed = Math.round(performance.now() - start);
      queueMicrotask(() => setLoadTime(elapsed));

      // Capture console logs from iframe
      try {
        const iframeWindow = iframe.contentWindow as
          | (WindowProxy & typeof globalThis)
          | null;
        if (iframeWindow) {
          const origLog = iframeWindow.console.log;
          iframeWindow.console.log = (...args: unknown[]) => {
            setConsoleLogs((prev) => [
              ...prev.slice(-50),
              args.map(String).join(" "),
            ]);
            origLog.apply(iframeWindow.console, args);
          };
        }
      } catch {
        // cross-origin blocked — safe to ignore
      }
    }
  }, [currentHTML]);

  const refreshPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;
    doc.open();
    doc.write(currentHTML);
    doc.close();
  }, [currentHTML]);

  // Memoize iframe style
  const iframeStyle = useMemo(
    () => ({
      height: "100%",
      border: "none",
      borderRadius:
        deviceWidth === "375px"
          ? "20px"
          : deviceWidth === "768px"
            ? "12px"
            : "0",
      boxShadow:
        deviceWidth !== "100%"
          ? "0 0 0 1px rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.5)"
          : "none",
    }),
    [deviceWidth],
  );

  const slug = storeName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-\u0600-\u06FF]/g, "");

  return (
    <div className="flex-1 flex flex-col bg-[#0a0b0f] relative overflow-hidden">
      {/* ── Address Bar ── */}
      <div className="flex items-center h-9 px-3 bg-[#0e1015] border-b border-white/6 shrink-0 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={refreshPreview}
            className="p-1 rounded text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
            title="تحديث"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/4 border border-white/6">
          <Globe className="w-3 h-3 text-white/25 shrink-0" />
          <span className="text-[11px] text-white/40 truncate font-mono">
            {slug}.aibuilder.app
          </span>
          <div className="mr-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            {loadTime > 0 && (
              <span className="text-[9px] text-white/20 font-mono">
                {loadTime}ms
              </span>
            )}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="hidden md:flex items-center gap-0.5">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
            title="تصغير"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-1.5 text-[9px] font-mono text-white/25 hover:text-white/50 transition-colors rounded hover:bg-white/5"
            title="إعادة الحجم"
          >
            {zoom}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
            title="تكبير"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={() => {
            const win = window.open("", "_blank");
            if (win) {
              win.document.write(currentHTML);
              win.document.close();
            }
          }}
          className="p-1 rounded text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
          title="فتح في تبويب جديد"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-[#0a0b0f]/85 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-violet-500/30 animate-ping" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70 font-medium">
                    جاري البناء...
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    AI يعمل على تطبيق التعديلات
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview or Code */}
        {showCode ? (
          <CodeView code={currentHTML} />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                width: deviceWidth,
                height: zoom !== 100 ? `${(100 / zoom) * 100}%` : "100%",
              }}
              className="transition-transform duration-200"
            >
              <iframe
                ref={iframeRef}
                title="Store Preview"
                sandbox="allow-scripts allow-same-origin"
                style={{
                  ...iframeStyle,
                  width: "100%",
                }}
                className="transition-all duration-300 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Console Panel ── */}
      <div className="border-t border-white/6 shrink-0">
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-white/30 hover:text-white/50 hover:bg-white/2 transition-all"
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            <span className="text-[10px] font-mono">CONSOLE</span>
            {consoleLogs.length > 0 && (
              <span className="px-1 py-px rounded bg-white/6 text-[9px]">
                {consoleLogs.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showConsole && consoleLogs.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConsoleLogs([]);
                }}
                className="p-0.5 rounded text-white/20 hover:text-red-400 hover:bg-white/5 transition-all"
                title="مسح الكونسول"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
            {showConsole ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {showConsole && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 120 }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="h-30 overflow-y-auto px-3 py-2 bg-[#08090d] font-mono text-[10px]">
                {consoleLogs.length === 0 ? (
                  <p className="text-white/20">لا توجد رسائل</p>
                ) : (
                  consoleLogs.map((log, i) => (
                    <p
                      key={i}
                      className="text-white/40 py-0.5 border-b border-white/3"
                    >
                      <span className="text-white/20 mr-2">{">"}</span>
                      {log}
                    </p>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

/* ── Code View ── */
const CodeView = memo(function CodeView({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Simple syntax highlighting lines
  const lines = code.split("\n");

  return (
    <div className="w-full h-full flex flex-col bg-[#0e1015]">
      {/* File tab bar */}
      <div className="flex items-center h-8 px-2 gap-1 bg-[#0a0b0f] border-b border-white/6 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/4 rounded-t text-[10px] text-white/60 border border-white/6 border-b-0">
          <span className="w-2 h-2 rounded-sm bg-orange-400/70" />
          index.html
        </div>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              نسخ
            </>
          )}
        </button>
      </div>

      {/* Code with line numbers */}
      <div className="flex-1 overflow-auto">
        <pre className="text-[11px] leading-5 font-mono">
          <code className="flex">
            {/* Line numbers gutter */}
            <div className="sticky left-0 select-none text-right pr-3 pl-3 py-3 text-white/15 bg-[#0e1015] border-r border-white/4">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code content */}
            <div className="py-3 px-4 text-white/70 flex-1 min-w-0">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="hover:bg-white/2 -mx-4 px-4 whitespace-pre"
                >
                  {line || " "}
                </div>
              ))}
            </div>
          </code>
        </pre>
      </div>
    </div>
  );
});

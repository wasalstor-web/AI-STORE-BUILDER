import { memo, useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  ImagePlus,
  X,
  Lightbulb,
  Wand2,
  Palette,
  ShoppingBag,
  Star,
  Zap,
  Layout,
  Type,
  Globe,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  attachments?: string[]; // base64 image URLs
}

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  isGenerating: boolean;
  onInputChange: (value: string) => void;
  onSend: (attachments?: string[]) => void;
  onQuickAction: (prompt: string) => void;
}

/* ── AI Suggestion Categories ── */
const SUGGESTION_CATEGORIES = [
  {
    id: "design",
    label: "تصميم",
    icon: Palette,
    color: "text-violet-400",
    bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
    suggestions: [
      {
        label: "وضع مظلم أنيق",
        prompt: "حوّل المتجر لوضع مظلم أنيق مع ألوان نيون",
      },
      {
        label: "ستايل فاخر",
        prompt: "حوّل التصميم لستايل فاخر وملكي مع ألوان ذهبية وخلفية داكنة",
      },
      {
        label: "مينيمال",
        prompt: "اجعل التصميم مينيمال بسيط وأنيق مع مساحات بيضاء",
      },
      {
        label: "ألوان دافئة",
        prompt: "غيّر الألوان لدرجات دافئة (برتقالي، أحمر، ذهبي)",
      },
    ],
  },
  {
    id: "content",
    label: "محتوى",
    icon: Type,
    color: "text-blue-400",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
    suggestions: [
      {
        label: "أضف منتجات",
        prompt: "أضف 6 منتجات جديدة بأسماء وأسعار وصور حقيقية",
      },
      {
        label: "أضف عروض",
        prompt: "أضف قسم عروض خاصة مع بطاقات ملونة وخصومات",
      },
      {
        label: "تقييمات عملاء",
        prompt: "أضف قسم آراء العملاء مع 4 تقييمات بنجوم",
      },
      { label: "نشرة بريدية", prompt: "أضف قسم اشتراك بريد إلكتروني احترافي" },
    ],
  },
  {
    id: "layout",
    label: "تخطيط",
    icon: Layout,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
    suggestions: [
      {
        label: "هيدر مع بحث",
        prompt: "أضف شريط بحث في الهيدر مع أيقونة سلة المشتريات",
      },
      {
        label: "فوتر احترافي",
        prompt: "أضف فوتر احترافي مع روابط سريعة ووسائل تواصل",
      },
      {
        label: "سلايدر منتجات",
        prompt: "حوّل قسم المنتجات لسلايدر أفقي متحرك",
      },
      { label: "أقسام متعرّجة", prompt: "اجعل الأقسام متعرّجة بتصميم zigzag" },
    ],
  },
  {
    id: "advanced",
    label: "متقدم",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
    suggestions: [
      {
        label: "حركات دخول",
        prompt: "أضف حركات دخول (animations) لكل الأقسام عند التمرير",
      },
      {
        label: "تأثير باراللاكس",
        prompt: "أضف تأثير parallax scrolling للبانر الرئيسي",
      },
      {
        label: "عداد تنازلي",
        prompt: "أضف عداد تنازلي للعرض مع تأثيرات بصرية",
      },
      {
        label: "تحسين SEO",
        prompt: "حسّن كود المتجر لمحركات البحث مع meta tags",
      },
    ],
  },
];

/* ── Quick Action Chips (Top Level) ── */
const QUICK_CHIPS = [
  {
    icon: Wand2,
    label: "نفّذ التصميم 🚀",
    prompt: "نفّذ التصميم بناءً على ما ناقشناه",
  },
  { icon: Palette, label: "ألوان", prompt: "أبي أغير ألوان المتجر" },
  { icon: ShoppingBag, label: "منتجات", prompt: "أبي أضيف منتجات" },
  { icon: Star, label: "ستايل فاخر", prompt: "أبي ستايل فاخر وأنيق" },
  { icon: Globe, label: "وضع داكن", prompt: "أبي وضع داكن للمتجر" },
];

export default memo(function ChatPanel({
  messages,
  input,
  isGenerating,
  onInputChange,
  onSend,
  onQuickAction,
}: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Image attachments
  const [attachments, setAttachments] = useState<string[]>([]);

  // Suggestions panel
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionCat, setActiveSuggestionCat] = useState("design");

  // Scroll state
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    const messageAttachments = attachments.length > 0 ? attachments : undefined;
    onSend(messageAttachments);
    setAttachments([]);
  };

  /* ── Voice Recording ── */
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onInputChange(input + " [التسجيل الصوتي غير مدعوم في هذا المتصفح]");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onInputChange(input + (input ? " " : "") + transcript);
      textareaRef.current?.focus();
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };

    recognition.start();
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  }, [input, onInputChange]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        // Fallback to speech recognition for now
        startSpeechRecognition();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      // Fallback: use Web Speech API
      startSpeechRecognition();
    }
  }, [startSpeechRecognition]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  }, [mediaRecorder]);

  /* ── Image Upload ── */
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) return; // 5MB limit

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setAttachments((prev) => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      });

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [],
  );

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const isFirstMessage = messages.length <= 1;
  const charCount = input.length;
  const maxChars = 2000;

  /* ── Drag & Drop images ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files.length) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAttachments((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className="flex flex-col h-full bg-[#0e1015] w-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Drag overlay ── */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-violet-600/10 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-dashed border-violet-500/40 rounded-xl m-2"
          >
            <div className="text-center">
              <ImagePlus className="w-10 h-10 text-violet-400 mx-auto mb-2" />
              <p className="text-sm text-violet-300 font-medium">
                اسحب الصور هنا
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                PNG, JPG — حتى 5MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Header ── */}
      <div className="p-3 border-b border-white/6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {/* Online pulse */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0e1015]" />
          </div>
          <div>
            <h3 className="font-semibold text-[13px] text-white/90">
              AI Assistant
            </h3>
            <div className="flex items-center gap-1.5">
              {isGenerating ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 text-violet-400 animate-spin" />
                  <span className="text-[10px] text-violet-400">
                    يعالج طلبك...
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-white/40">
                  {messages.length - 1} رسالة • جاهز
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`p-1.5 rounded-lg transition-all ${
              showSuggestions
                ? "bg-violet-500/20 text-violet-400"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
            title="اقتراحات AI"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── AI Suggestions Panel (Collapsible) ── */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-white/6"
          >
            <div className="p-3">
              {/* Category tabs */}
              <div className="flex gap-1 mb-2.5">
                {SUGGESTION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveSuggestionCat(cat.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                      activeSuggestionCat === cat.id
                        ? cat.bg + " border-current"
                        : "text-white/40 border-transparent hover:bg-white/5"
                    }`}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Suggestion chips */}
              <div className="grid grid-cols-2 gap-1.5">
                {SUGGESTION_CATEGORIES.find(
                  (c) => c.id === activeSuggestionCat,
                )?.suggestions.map((s) => (
                  <button
                    key={s.prompt}
                    onClick={() => {
                      onQuickAction(s.prompt);
                      setShowSuggestions(false);
                    }}
                    disabled={isGenerating}
                    className="text-[11px] text-right px-2.5 py-2 rounded-lg bg-white/3 hover:bg-white/7 border border-white/6 hover:border-white/12 text-white/70 hover:text-white/90 transition-all disabled:opacity-40"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onRetry={onQuickAction} />
          ))}
        </AnimatePresence>
        {isGenerating && <TypingIndicator />}

        {/* Show quick chips on first message */}
        {isFirstMessage && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2"
          >
            <p className="text-[11px] text-white/30 mb-2">
              جرّب أحد الأوامر السريعة:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.prompt}
                  onClick={() => onQuickAction(chip.prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/15 text-[11px] text-white/60 hover:text-white/90 transition-all group"
                >
                  <chip.icon className="w-3 h-3 group-hover:text-violet-400 transition-colors" />
                  {chip.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-violet-600/90 text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div className="p-3 border-t border-white/6 shrink-0">
        {/* Image Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 mb-2 overflow-x-auto pb-1"
            >
              {attachments.map((src, i) => (
                <div key={i} className="relative shrink-0 group">
                  <img
                    src={src}
                    alt={`مرفق ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10"
                  />
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400">جاري التسجيل...</span>
              <span className="text-xs text-red-400/60 font-mono">
                {formatTime(recordingTime)}
              </span>
              <button
                onClick={stopRecording}
                className="mr-auto text-xs text-red-400 hover:text-red-300"
              >
                إيقاف
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input */}
        <div
          className={`rounded-xl bg-white/4 border transition-all ${
            isDraggingOver
              ? "border-violet-500/60 bg-violet-500/5"
              : "border-white/8 focus-within:border-violet-500/40 focus-within:bg-white/6"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                onInputChange(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="اكتب ما تريد تغييره... مثال: غيّر الألوان، أضف منتجات"
            disabled={isGenerating}
            className="w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm text-white/90 placeholder-white/25 focus:outline-none disabled:opacity-50"
            rows={1}
            style={{ minHeight: "36px", maxHeight: "120px" }}
          />

          {/* Action buttons row */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-0.5">
              {/* Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all disabled:opacity-30"
                title="رفع صورة"
              >
                <ImagePlus className="w-4 h-4" />
              </button>

              {/* Voice Recording */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isGenerating}
                className={`p-1.5 rounded-lg transition-all disabled:opacity-30 ${
                  isRecording
                    ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                    : "text-white/25 hover:text-white/60 hover:bg-white/5"
                }`}
                title={isRecording ? "إيقاف التسجيل" : "تسجيل صوتي"}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Suggestions toggle */}
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`p-1.5 rounded-lg transition-all ${
                  showSuggestions
                    ? "text-violet-400 bg-violet-500/10"
                    : "text-white/25 hover:text-white/60 hover:bg-white/5"
                }`}
                title="اقتراحات"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={
                isGenerating || (!input.trim() && attachments.length === 0)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-violet-600 to-blue-600 text-white text-xs font-medium hover:from-violet-500 hover:to-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5 px-1">
          <p className="text-[9px] text-white/20">
            Enter للإرسال • Shift+Enter لسطر جديد • اسحب صورة للإرفاق
          </p>
          {charCount > 0 && (
            <span
              className={`text-[9px] font-mono ${
                charCount > maxChars * 0.9 ? "text-red-400/60" : "text-white/15"
              }`}
            >
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

/* ── Message Bubble ── */
const MessageBubble = memo(function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: (prompt: string) => void;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeStr = message.timestamp.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold: **text**
      let processed: React.ReactNode = line;

      if (line.startsWith("• ") || line.startsWith("- ")) {
        processed = (
          <span className="flex items-start gap-1.5">
            <span className="text-violet-400 mt-0.5 shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </span>
        );
      } else if (
        line.startsWith("✅") ||
        line.startsWith("⚠️") ||
        line.startsWith("🎨") ||
        line.startsWith("💡")
      ) {
        processed = <span className="font-medium">{line}</span>;
      }

      return (
        <div key={i} className={line === "" ? "h-1.5" : ""}>
          {processed}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-2 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isSystem && (
        <div className={`shrink-0 mt-1 ${isUser ? "order-1" : ""}`}>
          {isUser ? (
            <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center">
              <User className="w-3 h-3 text-white/50" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-sm shadow-violet-500/20">
              <Bot className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[85%] ${isSystem ? "mx-auto max-w-[95%]" : ""}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed relative ${
            isUser
              ? "bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/10 rounded-tr-md"
              : isSystem
                ? "bg-white/3 border border-white/6 text-white/60"
                : "bg-white/6 text-white/85 border border-white/4 rounded-tl-md"
          }`}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex gap-1.5 mb-2">
              {message.attachments.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap">
            {renderContent(message.content)}
          </div>
        </div>

        {/* Message footer: time + actions */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-[9px] text-white/20">{timeStr}</span>

          {/* Hover actions */}
          <AnimatePresence>
            {showActions && !isSystem && (
              <motion.div
                initial={{ opacity: 0, x: isUser ? 5 : -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-0.5"
              >
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
                  title="نسخ"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                {isUser && (
                  <button
                    onClick={() => onRetry(message.content)}
                    className="p-1 rounded text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
                    title="إعادة إرسال"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

/* ── Typing Indicator ── */
const TypingIndicator = memo(function TypingIndicator() {
  const [stage, setStage] = useState(0);
  const stages = ["يحلل طلبك...", "يكتب الكود...", "يصمم المتجر..."];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2"
    >
      <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-violet-500/20">
        <Bot className="w-3 h-3 text-white" />
      </div>
      <div className="bg-white/6 border border-white/4 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-violet-400 rounded-full"
                animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
          <motion.span
            key={stage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-white/40"
          >
            {stages[stage]}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
});

/* ── TypeScript: Web Speech API types ── */
declare global {
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }
  const SpeechRecognition: { new (): SpeechRecognitionInstance };
  const webkitSpeechRecognition: { new (): SpeechRecognitionInstance };
  interface SpeechRecognitionInstance extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof webkitSpeechRecognition;
  }
}

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { storesApi, aiChatApi, jobsApi } from "../lib/api";
import { STORE_TEMPLATES, getTemplateHTML } from "../data/templates";
import toast from "react-hot-toast";

import TopBar from "../components/builder/TopBar";
import ChatPanel from "../components/builder/ChatPanel";
import PreviewPanel from "../components/builder/PreviewPanel";

interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

interface HistoryEntry {
  html: string;
  label: string;
  timestamp: Date;
}

export default function AIBuilderOptimized() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const storeName = searchParams.get("name") || "متجري";
  const storeType = searchParams.get("type") || "general";
  const templateId = searchParams.get("template") || "";
  const existingStoreId = searchParams.get("storeId") || "";

  useEffect(() => {
    document.title = "بناء بالذكاء الاصطناعي | ويب فلو";
  }, []);

  // ══ State ══
  const [storeId, setStoreId] = useState<string>(existingStoreId);
  const [isPublishing, setIsPublishing] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");

  // ══ Conversation Memory — restore from localStorage ══
  const conversationKey = `webflow_chat_${existingStoreId || storeType}_${storeName}`;
  const savedMessages = (() => {
    try {
      const raw = localStorage.getItem(conversationKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {
      /* ignore */
    }
    return null;
  })();

  const [messages, setMessages] = useState<ChatMessage[]>(
    savedMessages || [
      {
        id: "welcome",
        role: "system",
        content: `مرحباً! 👋 أنا WebFlow AI — مطورك الشخصي لبناء "${storeName}".\n\nأخبرني عن مشروعك وأنا أبنيه لك بمستوى احترافي:\n• وش نوع المحتوى أو المنتجات؟\n• وش الألوان والستايل المفضل؟ (فاخر، بسيط، عصري، داكن)\n• هل تبي أقسام معينة؟ (عروض، تقييمات، عنّا، FAQ)\n\n🚀 لما تكون جاهز، قول "نفّذ" وأنا أبني لك الموقع من الصفر!`,
        timestamp: new Date(),
      },
    ],
  );

  // Auto-save conversation to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(conversationKey, JSON.stringify(messages));
    }
  }, [messages, conversationKey]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentHTML, setCurrentHTML] = useState(() => {
    if (templateId) return getTemplateHTML(templateId, storeName);
    const match =
      STORE_TEMPLATES.find((t) => t.storeType === storeType) ||
      STORE_TEMPLATES[4];
    return getTemplateHTML(match.id, storeName);
  });
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [showCode, setShowCode] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ══ Load existing store HTML if editing ══
  useEffect(() => {
    if (existingStoreId) {
      storesApi
        .get(existingStoreId)
        .then((res) => {
          const previewHtml = res.data?.config?.preview_html;
          if (previewHtml && typeof previewHtml === "string") {
            setCurrentHTML(previewHtml);
            pushHistory(previewHtml, "تصميم محفوظ");
          }
        })
        .catch(() => {
          /* store not found, use template */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingStoreId]);

  // ══ History Management ══
  const pushHistory = useCallback(
    (html: string, label: string) => {
      setHistory((prev) => {
        const newHistory = [
          ...prev.slice(0, historyIndex + 1),
          { html, label, timestamp: new Date() },
        ];
        return newHistory.slice(-20); // Keep last 20
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  // Initial history
  useMemo(() => {
    if (!existingStoreId) {
      pushHistory(currentHTML, "تصميم أولي");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ══ Execution Keywords Detection ══
  const isExecutionCommand = useCallback((text: string) => {
    const triggers = [
      "نفذ",
      "نفّذ",
      "ابدأ",
      "ابدا",
      "ابني",
      "نفذه",
      "طبق",
      "طبّق",
      "ابدأ البناء",
      "ابدا البناء",
      "ابني المتجر",
      "ابني الموقع",
      "نفذ التصميم",
      "شغّل",
      "شغل",
      "باشر",
      "يلا ابدأ",
      "يلا نفذ",
      "جاهز",
      "ابني لي",
      "صمم لي",
      "أنشئ",
      "انشئ",
      "سوّ لي",
      "سو لي",
      "execute",
      "build",
      "build it",
      "start",
      "go",
      "create",
      "generate",
    ];
    const lower = text.trim().toLowerCase();
    return triggers.some((t) => lower.includes(t));
  }, []);

  // ══ Build context summary from conversation for AI generation ══
  const buildConversationContext = useCallback(() => {
    return messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "المستخدم" : "المساعد"}: ${m.content}`)
      .join("\n");
  }, [messages]);

  // ══ AI Chat Handler ══
  const handleSend = useCallback(
    async (textOverride?: string, attachments?: string[]) => {
      const text = (textOverride || input).trim();
      if (!text || isGenerating) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (!textOverride) setInput("");
      setIsGenerating(true);

      // ── Check if this is an execution command ──
      if (isExecutionCommand(text)) {
        setMobileView("preview");
        try {
          const conversationContext = buildConversationContext();
          const buildPrompt = conversationContext
            ? `بناءً على المحادثة التالية:\n${conversationContext}\n\nالمستخدم يطلب: ${text}\n\nأنشئ المتجر بناءً على ما تم مناقشته.`
            : text;

          const aiMessage =
            attachments && attachments.length > 0
              ? `${buildPrompt}\n\n[المستخدم أرفق ${attachments.length} صورة كمرجع للتصميم]`
              : buildPrompt;

          const { data } = await aiChatApi.send({
            message: aiMessage,
            current_html: currentHTML,
            store_name: storeName,
            store_type: storeType,
          });

          const newHTML = data.html || currentHTML;
          setCurrentHTML(newHTML);
          pushHistory(newHTML, text.slice(0, 30));

          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: "ai",
            content:
              "✅ تم بناء المتجر بنجاح! شوف المعاينة 👈\n\nتقدر تطلب تعديلات إضافية وأنفذها لك.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
        } catch {
          toast.error("حدث خطأ أثناء البناء، جرب مرة أخرى");
          const errorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            role: "ai",
            content: "⚠️ حدث خطأ أثناء بناء المتجر. جرب مرة أخرى أو عدّل طلبك.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          setMobileView("chat");
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      // ── Regular conversation mode ──
      try {
        const conversationHistory = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const { data } = await aiChatApi.converse({
          message: text,
          conversation_history: conversationHistory,
          store_name: storeName,
          store_type: storeType,
        });

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: data.reply || "أخبرني أكثر عن رؤيتك للمتجر! 😊",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        toast.error("حدث خطأ في الاتصال");
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "ai",
          content: "⚠️ حدث خطأ في الاتصال. جرب مرة أخرى.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      input,
      isGenerating,
      currentHTML,
      storeName,
      storeType,
      pushHistory,
      messages,
      isExecutionCommand,
      buildConversationContext,
    ],
  );

  // ══ History Navigation ══
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setCurrentHTML(history[historyIndex - 1].html);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setCurrentHTML(history[historyIndex + 1].html);
    }
  }, [historyIndex, history]);

  // ══ Publish — with proper job polling ══
  const handlePublish = useCallback(async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      let finalStoreId = storeId;

      if (finalStoreId) {
        // Already have a storeId — just update it
        await storesApi.update(finalStoreId, {
          html_content: currentHTML,
          status: "active",
        });
      } else {
        // Create a new store via generate
        const genRes = await storesApi.generate({
          name: storeName,
          store_type: storeType,
        });

        const jobId = genRes.data?.job_id;
        if (jobId) {
          // Poll the job status instead of setTimeout race condition
          let attempts = 0;
          const maxAttempts = 15;

          while (attempts < maxAttempts) {
            attempts++;
            await new Promise((r) => setTimeout(r, 2000));

            try {
              const jobRes = await jobsApi.get(jobId);
              const job = jobRes.data;

              if (job.status === "completed" && job.result?.store_id) {
                finalStoreId = job.result.store_id;
                setStoreId(finalStoreId);
                break;
              } else if (job.status === "failed") {
                throw new Error(job.error || "فشل إنشاء المتجر");
              }
              // Still processing — continue polling
            } catch (_pollErr) {
              // If job endpoint fails, fallback to store search
              if (attempts >= 3) {
                const storesRes = await storesApi.list(0, 50);
                const stores = storesRes.data?.stores || [];
                const ourStore = stores.find(
                  (s: { name: string; status: string }) =>
                    s.name === storeName &&
                    (s.status === "pending" || s.status === "active"),
                );
                if (ourStore) {
                  finalStoreId = ourStore.id;
                  setStoreId(finalStoreId);
                  break;
                }
              }
            }
          }

          // Update with our custom HTML
          if (finalStoreId) {
            await storesApi.update(finalStoreId, {
              html_content: currentHTML,
              status: "active",
            });
          }
        }
      }

      if (finalStoreId) {
        toast.success("تم نشر متجرك بنجاح! 🚀");
        navigate(`/stores/${finalStoreId}`);
      } else {
        toast.error("لم يتم العثور على المتجر — جرب مرة أخرى");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء النشر";
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [storeId, storeName, storeType, currentHTML, navigate, isPublishing]);

  const downloadHTML = useCallback(() => {
    const blob = new Blob([currentHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storeName}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الملف");
  }, [currentHTML, storeName]);

  // ══ Memoized Values ══
  const deviceWidth = useMemo(() => {
    return previewDevice === "mobile"
      ? "375px"
      : previewDevice === "tablet"
        ? "768px"
        : "100%";
  }, [previewDevice]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0b0f] overflow-hidden -m-4 lg:-m-8">
      {/* Top Bar */}
      <TopBar
        storeName={storeName}
        historyIndex={historyIndex}
        historyLength={history.length}
        previewDevice={previewDevice}
        showCode={showCode}
        onBack={() => navigate("/stores/create")}
        onUndo={undo}
        onRedo={redo}
        onDeviceChange={setPreviewDevice}
        onCodeToggle={() => setShowCode(!showCode)}
        onDownload={downloadHTML}
        onPublish={handlePublish}
      />

      {/* Mobile Toggle */}
      <div className="flex lg:hidden border-b border-white/6 shrink-0">
        <button
          onClick={() => setMobileView("chat")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            mobileView === "chat"
              ? "text-violet-400 border-b-2 border-violet-500 bg-violet-500/5"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          💬 الشات
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
            mobileView === "preview"
              ? "text-violet-400 border-b-2 border-violet-500 bg-violet-500/5"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          👁️ المعاينة
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel — responsive */}
        <div
          className={`${
            mobileView === "chat" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[28%] lg:min-w-[320px] lg:max-w-100 border-r border-white/6`}
        >
          <ChatPanel
            messages={messages}
            input={input}
            isGenerating={isGenerating}
            onInputChange={setInput}
            onSend={(attachments) => handleSend(undefined, attachments)}
            onQuickAction={(prompt) => handleSend(prompt)}
          />
        </div>

        {/* Preview Panel — responsive */}
        <div
          className={`${
            mobileView === "preview" ? "flex" : "hidden"
          } lg:flex flex-1`}
        >
          <PreviewPanel
            currentHTML={currentHTML}
            deviceWidth={deviceWidth}
            showCode={showCode}
            isGenerating={isGenerating}
            storeName={storeName}
          />
        </div>
      </div>
    </div>
  );
}

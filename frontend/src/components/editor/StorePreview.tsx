import { useMemo, useRef, useEffect } from "react";
import {
  generateStoreHTML,
  type SectionConfig,
  type StoreTheme,
} from "../../data/templateEngine";
import type { EditorSection } from "./types";

interface Props {
  sections: EditorSection[];
  primaryColor: string;
  storeName: string;
  storeType?: string;
}

// Map editor section types to templateEngine section types
function mapEditorSectionsToConfigs(
  sections: EditorSection[],
): SectionConfig[] {
  const enabled = sections.filter((s) => s.enabled);

  // Always add navbar at the top
  const configs: SectionConfig[] = [
    { id: "nav-auto", type: "navbar", props: {} },
  ];

  for (const section of enabled) {
    const mapped = mapSingleSection(section);
    if (mapped) configs.push(mapped);
  }

  // Always add footer
  configs.push({ id: "footer-auto", type: "footer", props: {} });

  return configs;
}

function mapSingleSection(section: EditorSection): SectionConfig | null {
  const p = section.props;

  switch (section.type) {
    case "hero":
      return {
        id: section.id,
        type: "hero",
        props: {
          title: p.title || "مرحباً بكم في متجرنا",
          subtitle: p.subtitle || "أفضل المنتجات بأفضل الأسعار",
          buttonText: p.buttonText || "تسوق الآن",
        },
      };
    case "categories":
      return { id: section.id, type: "categories", props: {} };
    case "featured_products":
      return { id: section.id, type: "products", props: {} };
    case "banner":
      return {
        id: section.id,
        type: "banner",
        props: {
          text: p.text || "خصم 50% على جميع المنتجات!",
        },
      };
    case "testimonials":
      return { id: section.id, type: "testimonials", props: {} };
    case "features":
      return { id: section.id, type: "features", props: {} };
    case "newsletter":
      return {
        id: section.id,
        type: "newsletter",
        props: {
          title: p.title || "النشرة البريدية",
          subtitle: p.subtitle || "اشترك للحصول على أحدث العروض",
        },
      };
    case "brands":
      return { id: section.id, type: "brands", props: {} };
    case "gallery":
      return { id: section.id, type: "gallery", props: {} };
    case "faq":
      return { id: section.id, type: "faq", props: {} };
    default:
      return null;
  }
}

function buildTheme(primaryColor: string): StoreTheme {
  return {
    primary: primaryColor,
    primaryDark: primaryColor,
    accent: "#f59e0b",
    bg: "#ffffff",
    surface: "#f8fafc",
    surfaceAlt: "#f1f5f9",
    text: "#1e293b",
    textSecondary: "#64748b",
    heroGradient: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
    cardBg: "#ffffff",
    borderColor: "#e2e8f0",
    fontFamily: "'Tajawal', sans-serif",
    radius: "16px",
    style: "modern",
  };
}

export default function StorePreview({
  sections,
  primaryColor,
  storeName,
  storeType = "general",
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(() => {
    const sectionConfigs = mapEditorSectionsToConfigs(sections);
    const theme = buildTheme(primaryColor);
    return generateStoreHTML(storeName, storeType, theme, sectionConfigs);
  }, [sections, primaryColor, storeName, storeType]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-dark-border/50 h-full flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div
          className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 text-center"
          dir="ltr"
        >
          {storeName.toLowerCase().replace(/\s+/g, "-")}.aibuilder.app
        </div>
      </div>

      {/* Real store preview via iframe */}
      <iframe
        ref={iframeRef}
        title="معاينة المتجر"
        className="flex-1 w-full border-0"
        sandbox="allow-scripts"
      />
    </div>
  );
}

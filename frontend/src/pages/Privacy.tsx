import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useEffect } from "react";
import PublicLayout from "../components/layout/PublicLayout";

const sections = [
  {
    title: "المعلومات التي نجمعها",
    content:
      "نجمع المعلومات التي تقدمها مباشرة عند التسجيل واستخدام المنصة، مثل: الاسم، البريد الإلكتروني، ومحتوى المتاجر التي تنشئها. كما نجمع بيانات الاستخدام تلقائياً مثل عنوان IP ونوع المتصفح.",
  },
  {
    title: "كيف نستخدم معلوماتك",
    content:
      "نستخدم معلوماتك لتشغيل وتحسين المنصة، وتوفير الدعم الفني، وتخصيص تجربتك. لن نبيع معلوماتك الشخصية لأي طرف ثالث.",
  },
  {
    title: "الذكاء الاصطناعي",
    content:
      "عند استخدام ميزات الذكاء الاصطناعي، يتم إرسال محتوى رسائلك إلى مزودي خدمات AI (مثل Anthropic، OpenAI) لمعالجتها. لا يتم تخزين هذه الرسائل لدى المزودين بعد المعالجة.",
  },
  {
    title: "تخزين البيانات وأمانها",
    content:
      "نخزن بياناتك في خوادم آمنة مع تشفير كامل. نستخدم بروتوكول HTTPS لجميع الاتصالات. كلمات المرور تُخزّن مشفرة باستخدام bcrypt ولا يمكن الوصول إليها.",
  },
  {
    title: "ملفات تعريف الارتباط (Cookies)",
    content:
      "نستخدم ملفات تعريف الارتباط لتخزين جلسة تسجيل الدخول وتحسين تجربة التصفح. يمكنك تعطيلها من إعدادات المتصفح، لكن ذلك قد يؤثر على بعض وظائف المنصة.",
  },
  {
    title: "حقوقك",
    content:
      "لك الحق في الوصول إلى بياناتك، تعديلها، أو حذفها في أي وقت. يمكنك حذف حسابك بالكامل من الإعدادات أو بالتواصل مع فريق الدعم.",
  },
  {
    title: "تحديث السياسة",
    content:
      "قد نقوم بتحديث هذه السياسة من وقت لآخر. سنُعلمك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل المنصة.",
  },
];

export default function Privacy() {
  useEffect(() => {
    document.title = "سياسة الخصوصية | ويب فلو";
  }, []);

  return (
    <PublicLayout>
      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary-light" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
            <p className="text-sm text-text-muted mt-1">
              آخر تحديث: {new Date().toLocaleDateString("ar-SA")}
            </p>
          </div>
        </div>

        <p className="text-text-secondary leading-relaxed mb-10">
          نحن في ويب فلو نلتزم بحماية خصوصيتك. توضح هذه السياسة كيف نجمع ونستخدم
          ونحمي معلوماتك الشخصية عند استخدام منصتنا.
        </p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i} className="glass-card p-6">
              <h2 className="font-semibold text-lg mb-3">{s.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 glass-card text-center">
          <p className="text-text-secondary text-sm">
            لديك أسئلة حول سياسة الخصوصية؟
          </p>
          <Link
            to="/contact"
            className="text-primary-light hover:underline text-sm mt-2 inline-block"
          >
            تواصل معنا ←
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

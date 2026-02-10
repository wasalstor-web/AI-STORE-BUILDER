import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storesApi } from "../lib/api";
import StoreEditor from "../components/editor/StoreEditor";
import type { Store } from "../types";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function EditStore() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: store,
    isLoading,
    error,
  } = useQuery<Store>({
    queryKey: ["store", id],
    queryFn: async () => {
      const res = await storesApi.get(id!);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    document.title = "تحرير المتجر | ويب فلو";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        جاري التحميل...
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <p className="text-text-secondary">لم يتم العثور على المتجر</p>
        <Link
          to="/dashboard"
          className="btn-primary inline-flex items-center gap-2 mt-4"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const handleSave = async (sections: unknown[]) => {
    try {
      await storesApi.update(id!, { layout: sections });
      toast.success("تم حفظ التصميم بنجاح! ✅");
      navigate(`/stores/${id}`);
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/stores/${id}`}
            className="text-text-muted hover:text-text-secondary"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">تعديل تصميم: {store.name}</h1>
        </div>
      </div>
      <StoreEditor
        storeName={store.name}
        primaryColor={
          ((store.config?.branding as Record<string, unknown>)
            ?.primary_color as string) || "#6c5ce7"
        }
        onSave={handleSave}
      />
    </div>
  );
}

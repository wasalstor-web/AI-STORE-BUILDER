# 🚀 AI Store Builder - التشغيل المحلي

## ❗ مشكلة مؤقتة في VS Code Terminal

يبدو أن VS Code يواجه مشكلة مع الأحرف العربية في PowerShell. لحل هذا:

### 🔧 الحل السريع:

1. **افتح Command Prompt (cmd) أو PowerShell خارج VS Code**
2. **انتقل لمجلد المشروع:**

   ```cmd
   cd "C:\Users\wahed\Desktop\AI-STORE-BUILDER"
   ```

3. **اختبر Python:**

   ```cmd
   python --version
   python -c "import app.main; print('✅ Backend imports OK')"
   ```

4. **ابدأ Backend:**

   ```cmd
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

5. **Backend سيعمل على:** http://127.0.0.1:8000
6. **API Docs:** http://127.0.0.1:8000/docs

---

## 🎯 ما تم إصلاحه:

### ✅ Backend Configuration:

- **Database:** SQLite للتطوير المحلي
- **AI APIs:** Claude, GPT, Gemini configured
- **CORS:** محدث للـ localhost
- **Environment:** `.env` مهيأ للتطوير

### ✅ Frontend:

- **يعمل حالياً على:** http://localhost:3005
- **Vite ✅** | **React ✅** | **TypeScript ✅**

### ✅ Production:

- **API:** http://147.93.120.99:9000 - يعمل ✅
- **Website:** http://147.93.120.99 - يعمل ✅
- **Docker:** Running ✅

---

## 🔍 اختبار سريع:

### اختبار Production API:

```cmd
curl http://147.93.120.99:9000/health
```

### اختبار Local Frontend:

افتح: http://localhost:3005

---

## 📝 الملفات الجديدة:

- `.env.local` - تكوين التطوير المحلي
- `start-local.bat` - Windows batch script
- `run_local.py` - Python startup script
- `start-dev.ps1` - PowerShell script
- `health_check.py` - اختبار شامل

---

## 🎯 المطلوب:

1. ✅ **Production** - يعمل بنجاح
2. 🔄 **Local Backend** - يحتاج تشغيل خارج VS Code
3. ✅ **Local Frontend** - يعمل على port 3005
4. ⏳ **VS Code Unicode** - حل مؤقت بـ external terminal

---

## 🚀 البدء السريع:

### Option 1: خارج VS Code

```cmd
cd "C:\Users\wahed\Desktop\AI-STORE-BUILDER"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Option 2: مع Python Script

```cmd
cd "C:\Users\wahed\Desktop\AI-STORE-BUILDER"
python run_local.py
```

### Option 3: Windows Batch

```cmd
cd "C:\Users\wahed\Desktop\AI-STORE-BUILDER"
start-local.bat
```

---

## 🌟 النتيجة:

- **✅ Frontend:** http://localhost:3005
- **🔄 Backend:** http://127.0.0.1:8000 (خارج VS Code)
- **✅ API Docs:** http://127.0.0.1:8000/docs
- **✅ Production:** http://147.93.120.99

**الحل: استخدم terminal خارج VS Code للـ backend، والباقي يعمل بنجاح!** 🎉

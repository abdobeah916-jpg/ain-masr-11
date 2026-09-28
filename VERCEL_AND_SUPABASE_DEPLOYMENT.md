# دليل نشر تطبيق «عين مصر» على Vercel وربط Supabase و MongoDB

يقدم هذا الدليل الخطوات المحددة لرفع التطبيق على منصة **Vercel** مجاناً مع إمكانية رفع فيديوهات الأدلة الجنائية بحجم يصل إلى **500 ميجابايت** وتخزين البلاغات في **MongoDB Atlas**.

---

## 1. إعداد Supabase للفيديوهات الكبيرة (خلال دقيقتين)

1. سجل حساب مجاني على [supabase.com](https://supabase.com).
2. أنشئ مشروعاً جديداً باسم `ain-masr-vault`.
3. اذهب إلى قائمة **SQL Editor** من الشريط الجانبي واضغط **New query**.
4. الصق الكود التالي واضغط **Run**:

```sql
-- 1. إنشاء باكت الفيديوهات بحجم أقصى 500MB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'civic_evidence_videos',
  'civic_evidence_videos',
  true,
  524288000, -- 500 MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 524288000;

-- 2. إتاحة الرفع المباشر للمواطنين بأمان
CREATE POLICY "Public Upload to civic_evidence_videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'civic_evidence_videos');

-- 3. إتاحة مشاهدة الفيديوهات للجهات المعنية
CREATE POLICY "Public Read from civic_evidence_videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'civic_evidence_videos');
```

5. من **Project Settings** > **API**:
   - انسخ **Project URL** (مثل: `https://xyzabc.supabase.co`).
   - انسخ **anon / public key**.

---

## 2. إعداد قاعدة بيانات MongoDB Atlas (خلال دقيقتين)

1. سجل حساب مجاني على [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. أنشئ كلاستر مجاني من نوع **M0 Free Cluster**.
3. في قائمة **Network Access**: اضغط **Add IP Address** واختر **Allow Access from Anywhere (`0.0.0.0/0`)**.
4. في قائمة **Database Access**: أنشئ مستخدم بكلمة مرور (مثلاً `ainmasr_admin`).
5. اضغط **Connect** > **Drivers** وانسخ رابط الاتصال:
   ```text
   mongodb+srv://ainmasr_admin:<password>@cluster0.abcde.mongodb.net/ain_masr_civic?retryWrites=true&w=majority
   ```

---

## 3. الرفع على Vercel (خطوة واحدة)

1. ادخل على [vercel.com](https://vercel.com) واضغط **Add New Project**.
2. اختر مستودع المشروع (GitHub Repository).
3. في قسم **Environment Variables**، أضف المتغيرات التالية:

| اسم المتغير (Key) | القيمة (Value) |
|---|---|
| `MONGODB_URI` | رابط الاتصال بـ MongoDB Atlas المنسوخ أعلاه |
| `MONGODB_DB_NAME` | `ain_masr_civic` |
| `VITE_SUPABASE_URL` | رابط مشروع Supabase المنسوخ أعلاه |
| `VITE_SUPABASE_ANON_KEY` | مفتاح Anon المنسوخ أعلاه |
| `VITE_SUPABASE_BUCKET` | `civic_evidence_videos` |

4. اضغط **Deploy**.
5. خلال أقل من دقيقة، سيكون الموقع متاحاً على رابط مثل: `https://ain-masr.vercel.app`.

---

## كيف تعمل المنظومة الآن؟
* **الفيديوهات الكبيرة (حتى 500MB)**: تترفع مباشرة من متصفح المستخدم إلى سيرفرات Supabase فائقة السرعة مع حساب بصمة التشفير الجنائي `SHA-256`، دون أن تتأثر بحدود Vercel Serverless (4.5MB).
* **بيانات البلاغات**: تذهب فوراً عبر واجهة API السحابية (`/api/mongo/reports`) إلى MongoDB Atlas.
* **البلاغات والتحقيقات**: تظهر مباشرة في لوحة إدارة البلاغات مع إمكانية تشغيل ومعاينة الفيديوهات بكامل دقتها.

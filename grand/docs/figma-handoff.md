# Figma handoff

تم توثيق [رحلة الزائر والـwireframes والـdesign system](./design.md) وتنفيذ نموذج تفاعلي بالكود. **لم يُنشأ ملف Figma أو رابط prototype أصلي.** يحتاج هذا الجزء ملفًا متاحًا للفريق وأدوات تحرير Figma، ثم اعتماد التنسيق الذي سيرسله صاحب المشروع.

## تنظيم الملف المقترح

| الصفحة           | المحتوى                                    |
| ---------------- | ------------------------------------------ |
| `00 Cover`       | النطاق والقرارات المفتوحة                  |
| `01 Flows`       | استكشاف، جولة، تعرف، صوت وتقييم            |
| `02 Foundations` | الألوان والخطوط والمسافات والشبكة          |
| `03 Components`  | الأزرار والحقول والبطاقات والتنقل والحالات |
| `04 Desktop`     | شاشات 1440px بالعربية والإنجليزية          |
| `05 Mobile`      | شاشات 375px ومراجعة 320px                  |
| `06 Prototype`   | الروابط التفاعلية بين الشاشات              |
| `07 Handoff`     | خرائط المكونات وعقد API                    |

## شاشات الرسم

Home، Catalog (نتائج/بلا نتائج/خطأ)، Artifact Details وQR، Tour Planner والنتائج، Map والدور المختار، Scan قبل وبعد الرفع ونتيجة حقيقية ومثال Demo، Audio (checking/locked/allowed/transcript)، Quest، Feedback (تحقق/خطأ/حفظ حقيقي/Demo)، Services.

استخدم Auto Layout وVariants لحالات default/focus/disabled/loading/invalid. استخدم النصوص العربية والإنجليزية الفعلية، ولا تعكس رسومات القطع في RTL. حقول الروابط والبريد LTR. وفر حالة تركيز وهدف لمس واضحًا لكل تفاعل.

## سيناريوهات الربط

1. Home → Catalog → Artifact → Tour planner → Results → Map.
2. Home → Scan → Upload → Result → Artifact.
3. Scan → QR/link → Artifact.
4. Artifact → Audio → تحقق VIP → Player أو Locked.
5. Quest → Result → Feedback → التحقق → إيصال صحيح للحفظ.

لا تعرض مطابقة AI في مسار المثال، ولا نجاح حفظ في Demo، ولا تفتح صوت VIP دون حالة تحقق. أضف رابط الملف والـprototype إلى README بعد إنشائهما فعليًا.

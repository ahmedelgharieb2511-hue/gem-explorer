# GEM Explorer — المتحف المصري الكبير

واجهة زيارة تفاعلية للهاكاثون باستخدام **Next.js + React + TypeScript + Tailwind CSS**، ومنظمة حسب الهيكل المطلوب. التطبيق الفعلي داخل [grand/](./grand/).

[المستودع العام على GitHub](https://github.com/ahmedelgharieb2511-hue/gem-explorer)

## التشغيل السريع

تحتاج إلى Node.js 22 أو أحدث.

```sh
git clone https://github.com/ahmedelgharieb2511-hue/gem-explorer.git
cd gem-explorer
npm run install:app
npm run dev
```

لو المشروع موجود عندك بالفعل، ابدأ من `npm run install:app` داخل مجلد المشروع الرئيسي.

افتح [النسخة العربية](http://localhost:3000/ar) أو [النسخة الإنجليزية](http://localhost:3000/en).

```sh
npm test
npm run typecheck
npm run build
npm start
```

`npm run dev` للتطوير، و`npm start` لتشغيل نسخة الإنتاج **بعد** البناء. الأوامر هنا تمرر العمل إلى التطبيق، لذلك يمكن تشغيلها من مجلد المشروع الرئيسي دون الدخول يدويًا إلى المجلد الفرعي.

## أين تبدأ؟

- [دليل التطبيق الكامل وخريطة الملفات](./grand/README.md)
- [شرح المعمارية وملكية كل جزء](./grand/docs/architecture.md)
- [عقد الـAPI والتوصيل بالـBackend](./grand/docs/api-contract.md)
- [رحلة الزائر والـDesign System](./grand/docs/design.md)
- [تسليم Figma والشاشات المطلوبة](./grand/docs/figma-handoff.md)
- [Task Board وحالة كل Sprint](./grand/docs/task-board.md)
- [النشر وسيناريو العرض](./grand/docs/deployment.md)

النسخة الحالية نموذج عملي ببيانات تعليمية وصور فوتوغرافية حقيقية موثقة وخريطة تخطيطية. لا تمثل خدمة رسمية للمتحف. التكامل الحقيقي مع Backend/AI وملف Figma الأصلي والنشر العام يحتاج موارد الفريق الموضحة في الأدلة، ولا تُعد هذه الأجزاء منجزة بمجرد عمل واجهاتها.

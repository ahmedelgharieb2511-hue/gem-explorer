# GEM Explorer — دليل المطور

تجربة زيارة ثنائية اللغة للهاكاثون باستخدام Next.js وReact وTypeScript وTailwind. الهوية الحالية كحلي ولازورد وذهبي ورملي، بخطَّي Cairo وManrope محليًا وصور فوتوغرافية حقيقية موثقة. البناء لا يحتاج إلى تنزيل صور أو خطوط من مواقع خارجية.

## التشغيل

من هذا المجلد:

```sh
npm ci
npm run dev
```

من المجلد الأب يمكن استخدام الأوامر نفسها عبر السكربتات المختصرة. افتح `/ar` أو `/en`؛ المسار `/` يحول إلى العربية.

| الأمر                                                   | الاستخدام                                            |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `npm run dev`                                           | تشغيل التطوير على المنفذ 3000                        |
| `npm run typecheck`                                     | فحص TypeScript دون بناء                              |
| `npm test`                                              | اختبارات الخوارزمية وعقد API والترجمة                |
| `npm run build`                                         | بناء نسخة الإنتاج وفحص الأنواع                       |
| `npm start`                                             | تشغيل نسخة الإنتاج بعد البناء                        |
| `npm run test:e2e`                                      | اختبار رحلة الزائر داخل Chromium؛ يتطلب بناءً حديثًا |
| `node scripts/generate-art.mjs`                         | إعادة توليد الرسوم الأولية الاختيارية                |
| `node scripts/fetch-photographs.mjs`                    | تنزيل الصور الأصلية الموثقة الناقصة فقط              |
| `node scripts/optimize-photographs.mjs`                 | توليد نسخ WebP وملف بيانات الأحجام                   |
| `node scripts/measure-lcp.mjs http://127.0.0.1:3000/en` | قياس LCP لثلاث زيارات متصفح جديدة                    |

لتشغيل اختبارات المتصفح على جهاز جديد: `npx playwright install chromium`. ملف إعداد Playwright يشغل نسخة الإنتاج تلقائيًا إذا لم توجد نسخة على `127.0.0.1:3000`.

## خريطة المشروع

```text
grand/
├── src/
│   ├── app/
│   │   ├── (entry)/
│   │   │   ├── layout.tsx          # غلاف تحويل المسار الرئيسي
│   │   │   └── page.tsx            # تحويل / إلى /ar
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # اللغة والاتجاه ومزودات البيانات وNavbar/Footer
│   │   │   ├── page.tsx            # الصفحة الرئيسية
│   │   │   ├── artifacts/
│   │   │   │   ├── page.tsx        # البحث والتصفية وترقيم النتائج
│   │   │   │   └── [id]/page.tsx   # قصة قطعة ورابطها وQR
│   │   │   ├── tour-planner/page.tsx
│   │   │   ├── museum-map/page.tsx
│   │   │   ├── scan/page.tsx
│   │   │   ├── audio-guide/page.tsx
│   │   │   ├── quests/page.tsx
│   │   │   ├── feedback/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── [...rest]/page.tsx  # المسارات غير المعروفة
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── not-found.tsx
│   │   ├── api/[...path]/route.ts  # مسارات BFF محددة ومحمية بالتحقق
│   │   └── globals.css            # Tailwind + الهوية والتخطيط العام
│   ├── features/
│   │   ├── artifacts/
│   │   │   ├── data.ts            # أمثلة تعليمية وليست مخزونًا رسميًا
│   │   │   ├── index.tsx          # Catalog / ArtifactCard / ArtifactDetails وQR
│   │   │   ├── artifacts.css
│   │   │   └── messages/{ar,en}.json
│   │   ├── tours/
│   │   │   ├── planner.ts         # خوارزمية الجولة التجريبية وحساب ميزانية الوقت
│   │   │   ├── tour-planner.tsx
│   │   │   ├── tours.css
│   │   │   └── messages/{ar,en}.json
│   │   ├── navigation/
│   │   │   ├── museum-map.tsx     # SVG، الأدوار، المسار والقائمة البديلة
│   │   │   ├── navigation.css
│   │   │   └── messages/{ar,en}.json
│   │   ├── ai-recognition/
│   │   │   ├── index.tsx          # ScanExperience: رفع/كاميرا/روابط QR/نتائج
│   │   │   ├── recognition.css
│   │   │   └── messages/{ar,en}.json
│   │   ├── audio-guide/
│   │   │   ├── index.tsx          # AudioGuide: صلاحية السيرفر والصوت والنص
│   │   │   ├── audio-guide.css
│   │   │   └── messages/{ar,en}.json
│   │   ├── quests/
│   │   │   ├── quest.tsx          # اختبار تعليمي وحفظ تقدم محلي
│   │   │   ├── quests.css
│   │   │   └── messages/{ar,en}.json
│   │   └── feedback/
│   │       ├── index.tsx          # النموذج والتحقق وإيصال الاستجابة
│   │       ├── feedback.css
│   │       └── messages/{ar,en}.json
│   ├── components/
│   │   ├── ui/                    # Button / Field / EmptyState
│   │   ├── layout/                # Navbar / Footer
│   │   └── shared/                # Providers / Home / SectionHeading / ResponsivePhotograph / PhotoCredit
│   ├── hooks/use-persistent-state.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts          # fetch موحد وإلغاء الطلبات وApiError
│   │   │   ├── schemas.ts         # تحقق مدخلات وردود API وقت التشغيل
│   │   │   └── server.ts          # Demo أو تمرير آمن للـBackend
│   │   └── i18n/
│   │       ├── config.ts          # اللغات والروابط واختيار النصوص
│   │       └── messages.ts        # تجميع namespaces لكل لغة
│   ├── messages/{ar,en}.json      # النصوص العامة والتنقل والرئيسية والخدمات
│   └── types/index.ts             # نماذج البيانات والعقود المشتركة
├── public/images/                 # صور أصلية + WebP + CREDITS ورسوم أولية اختيارية
├── scripts/generate-art.mjs
├── tests/
│   ├── planner.test.ts
│   ├── api.test.ts
│   ├── i18n.test.ts
│   ├── server-only.ts
│   └── e2e/visitor.spec.ts
├── docs/                          # أدلة التصميم والعقود والنشر وحالة التنفيذ
├── .env.example
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── package-lock.json
```

## الصفحات والروابط

كل المسارات تقبل `ar` و`en`. تبديل اللغة يحتفظ بالصفحة والبحث والاستعلام.

| الرابط                                                      | ما يقدمه                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `/ar`                                                       | مقدمة ومجموعة مختارة وأدوات الزيارة                              |
| `/ar/artifacts?q=ذهب&era=new-kingdom`                       | بحث عربي/إنجليزي مع تطبيع الهمزات والتشكيل وفلاتر محفوظة في URL  |
| `/ar/artifacts/golden-mask`                                 | قصة وحقائق وروابط خريطة وصوت وQR حقيقي قابل للتنزيل              |
| `/ar/tour-planner`                                          | وقت واهتمامات وإتاحة، ثم ترتيب محطات ضمن الميزانية               |
| `/ar/museum-map?stops=ramses-ii,seated-scribe&accessible=1` | مسار توضيحي وقائمة بديلة متاحة بالكيبورد                         |
| `/ar/museum-map?artifact=golden-mask`                       | تحديد القطعة ودورها من رابط التفاصيل                             |
| `/ar/scan`                                                  | رفع صورة أو استخدام كاميرا الهاتف، مثال نتيجة، وفتح رابط/معرف QR |
| `/ar/audio-guide?artifact=ramses-ii`                        | فحص VIP من السيرفر، مشغل عند السماح، وعينة متصفح مجانية منفصلة   |
| `/ar/quests`                                                | ثلاثة أسئلة ونتيجة وإعادة المحاولة                               |
| `/ar/feedback`                                              | تقييم ورسالة وتصنيف وبريد اختياري وموافقة                        |
| `/ar/services`                                              | الخدمات والإتاحة وإرشادات السلامة                                |

## الربط مع Backend

انسخ [نموذج البيئة](./.env.example) إلى `.env.local`. الوضع الافتراضي `demo` يعمل دون Backend.

```env
NEXT_PUBLIC_DATA_MODE=api
BACKEND_API_URL=https://your-backend.example/api/
NEXT_PUBLIC_SITE_URL=https://your-app.example
```

أعد تشغيل التطوير، أو أعد البناء والنشر عند تغيير `NEXT_PUBLIC_*`. لا تضف أي مفاتيح سرية في متغيرات بهذا الاسم. `BACKEND_API_URL` خادمي؛ المتصفح يتواصل مع `/api` على نفس نطاق الواجهة.

راجع [عقد API](./docs/api-contract.md) للأشكال المطلوبة. لا يتحول التطبيق تلقائيًا إلى بيانات تجريبية عند فشل Backend الحقيقي. سيظهر خطأ قابل للمحاولة حتى لا تخفي البيانات التجريبية عطل الاتصال.

## أين أعدل؟

ملفات التطبيق التي تُعدّل هي [src/app/](./src/app/) و[features/](./src/features/). مجلد `.next/` ناتج بناء يُعاد توليده تلقائيًا. قد يعرض محرر HTML رسائل `';' expected` بين وسوم السكريبت في HTML المضغوط رغم صحة السكريبتات المنفصلة. إعدادات مساحة العمل تعامل HTML المولَّد داخل هذا المجلد كنص فقط وتخفي مجلد البناء من المستكشف والبحث؛ فحص السورس يظل مفعّلًا. لا تصلح ملفات البناء يدويًا لأن البناء التالي يستبدلها.

| المطلوب                         | مكان التعديل                                                             |
| ------------------------------- | ------------------------------------------------------------------------ |
| الألوان والخطوط وأحجام المسافات | [globals.css](./src/app/globals.css)                                     |
| مقدمة الرئيسية وأقسامها         | [Home](./src/components/shared/home.tsx)                                 |
| النصوص العامة                   | [messages/](./src/messages/)                                             |
| نصوص ميزة معينة                 | مجلد `messages` داخل نفس الميزة                                          |
| القطع أو الصور التجريبية        | [data.ts](./src/features/artifacts/data.ts) و[images/](./public/images/) |
| البحث والبطاقات والتفاصيل       | [artifacts/](./src/features/artifacts/)                                  |
| قواعد ترتيب الجولة              | [planner.ts](./src/features/tours/planner.ts)                            |
| مخطط الأدوار وعلامات الخدمات    | [museum-map.tsx](./src/features/navigation/museum-map.tsx)               |
| عناوين API والتحقق والتمرير     | [lib/api/](./src/lib/api/)                                               |
| الشكل المشترك للبيانات          | [types/](./src/types/) مع تحديث Zod في الوقت نفسه                        |
| قوائم التنقل                    | [layout/](./src/components/layout/)                                      |

لإضافة صفحة: أنشئ route رفيعًا داخل `[locale]`، وضع منطق الميزة في `features`، وأضف ترجمتَي العربية والإنجليزية، ثم اربط الصفحة بالتنقل. للغة جديدة: أضفها في `types` و`lib/i18n/config` وملفات الرسائل وتجميعها واختبارات parity.

## قرارات مهمة

- Server Components للغلاف والرئيسية ومسارات الصفحات، وClient Components للتفاعل فقط.
- TanStack Query لحالة بيانات السيرفر، وحالة النموذج محلية. البحث والفلاتر في URL؛ تفضيلات الجولة وتقدم التحدي على الجهاز.
- الثماني قطع صغيرة، لذلك البحث المحلي بعد جلبها مناسب للديمو؛ عند استبدالها بكتالوج كبير انقل البحث والفلاتر والترقيم للخادم.
- حساب الجولة يشمل الوصول والمشاهدة والانتقال والعودة. ليس حل مسار مثاليًا رياضيًا أو نظام تحديد موقع حقيقيًا.
- ملف QR يفتح عنوان النطاق الحالي. QR على `localhost` لن يفتح التطبيق من هاتف آخر؛ استخدم رابط نشر قابلًا للوصول.
- رفع الصور JPEG/PNG/WebP حتى 8MB، مع فحص التوقيع على السيرفر وحد فعلي لقراءة جسم الطلب.
- لا حفظ وهمي للتقييمات ولا نسبة ثقة AI وهمية ولا زر محلي يفتح VIP.
- لا يوجد حساب مستخدم أو دفع داخل MVP؛ جلسة VIP الحقيقية يجب أن ينشئها Backend موثوق. عليه فرض الصلاحيات قبل إرجاع تسجيل أو رابط موقع.

## التصميم وFigma والنشر

الاتجاه البصري المبدئي قابل للتعديل بعد وصول التنسيق من صاحب المشروع. [Design](./docs/design.md) يحتوي رحلة الزائر والمواصفات، و[Figma handoff](./docs/figma-handoff.md) يوضح الشاشات المطلوب رسمها وربطها في Figma. **لم يُنشأ ملف Figma أصلي.**

[حالة المهام](./docs/task-board.md) تفصل المنجز عن المعتمد على موارد الفريق. [دليل النشر](./docs/deployment.md) يوضح نشر Next.js على منصة تدعم Node وإعداد العرض. لا يوجد ادعاء بأن الموقع نُشر للعامة أو أن خدمات AI والمتحف الرسمية تم ربطها.

## المظهر والتقييم التفاعلي

- زر واحد للشمس والقمر بجوار اللغة، يبدّل بين الوضعين ويحفظ الاختيار تحت `gem-color-theme`. عند عدم وجود تفضيل محفوظ يتبع إعداد الجهاز، ويزامن تغيير الاختيار بين التبويبات.
- [theme.ts](./src/lib/theme.ts) يحتوي التحقق من القيمة وكود تهيئة ثابتًا يعمل في الرأس قبل عرض المحتوى. [ThemeProvider](./src/components/shared/theme-provider.tsx) يدير الحالة والمستمعين، و[ThemeToggle](./src/components/ui/theme-toggle.tsx) هو الزر المترجم. التهيئة لا تحتوي أي بيانات مستخدم داخل HTML.
- [theme.css](./src/app/theme.css) هو مكان تعديل ألوان الرمل والطين والفيروزي واللازورد، وطبقات الوضع الداكن لكل الشاشات. الصور لا تُعكس ألوانها. الزر يظل متاحًا على الهاتف بجوار اللغة والقائمة.
- [صفحة التقييم](./src/features/feedback/index.tsx) تعرض اختيار تقييم بخمس بطاقات، وموضوعًا ببطاقات radio، واقتراحات تضيف بداية للرسالة دون مسح النص أو تكراره أو تجاوز 2000 حرف. مؤشر الاكتمال يعتمد على التقييم والرسالة الصالحة والموافقة؛ البريد اختياري.
- الحركة قصيرة وتعبر عن الاختيار أو الإرسال، وتحترم `prefers-reduced-motion`. تأكيد Demo يظل يذكر أن البيانات لم تُحفظ، وعقد API لم يتغير.
- [اختبارات المظهر](./tests/theme.test.ts) تغطي التهيئة قبل hydration والتفضيلات غير الصالحة وتعطّل التخزين. اختبارات المتصفح تغطي التبديل والحفظ واللغة والموبايل واقتراحات الكتابة وإرسال الموضوع الصحيح.

## تحديث الصور والوضوح والأداء

- خط Cairo للعربية وManrope للإنجليزية، ونصوص أساسية 16–17px ووصف 16–18px. الخطوط مستضافة محليًا، والتراخيص في [public/fonts/](./public/fonts/).
- صور حقيقية للقناع ورمسيس والقطع المرجعية وخلفية أبو سمبل، مع [مصادر الصور وتراخيصها](./public/images/CREDITS.md) وصفحة `/ar/credits`.
- [ResponsivePhotograph](./src/components/shared/responsive-photograph.tsx) يستخدم WebP مضغوطًا مسبقًا وأحجام 480/768/1200. صورة المقدمة eager/high وباقي الصور lazy، والخلفية الزخرفية بأولوية منخفضة.
- [SiteLink](./src/components/ui/site-link.tsx) يعطل التحميل التلقائي لوجهات الروابط؛ تُحمّل عند الانتقال، لتجنب CSS preloads لصفحات لم تُفتح.
- [دليل الصور والأداء](./docs/photography-and-performance.md) يشرح التبديل والضغط والقياس. هذه تحسينات لنسخة الإنتاج المحلية، وتختلف نتائج LCP بحسب الجهاز والشبكة والكاش.

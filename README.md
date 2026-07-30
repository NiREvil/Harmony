# Harmony

**ساخت لینک ساب با قابلیت افزودن خودکار آی‌پی تمیز کلادفلر و پارامترهای ثابت و متغیر برای کانفیگ‌های VLESS در جهت بهبود وضعیت دسترسی به اینترنت آزاد**

> [!WARNING]
>
> **متن ارائه شده به عنوان دستورالعمل پیکربندی `CloudFlare Workers—Pages` ارائه می‌شود.  
> فرض بر این است که مخاطب از دانش فنی لازم برخوردار است.**
> 
> <br/>	

<br/>

# دستورالعمل پیکربندی

از هر کد وورکر که تمایل دارید برای ساخت یک کانفیگ `Vless` استفاده کنید. برای ما دو عنصر کلیدی در این پروسه فقط `UUID` و `hostname` کانفیگ هستند. <br/>

> اگر کانفیگ ندارید و تاکنون وورکر نساخته‌اید، توضیحات پیرامون ساخت کانفیگ را بخوانید. در غیر این صورت، این قسمت را نادیده گرفته و آموزش را ادامه دهید.

<br/>

<div dir="rtl">

<details>
‏<summary>توضیحات پیرامون ساخت کانفیگ</summary>

## 1. ایجاد کانفیگ Vless

### [ZiZifn (Rust-wsam)][ZiF]

من برای مثال از کد وورکر zizifn نسخه بازنویسی‌شده با rust برای ساخت کانفیگ VLESS استفاده کردم، اطلاعات مورد نیاز برای نحوه کلون‌کرده و دپلوی پروژه در همان مخزن به طور کامل توضیح داده شده.

<br/>

### [BPB]

هم‌چنین برای ساخت یک کانفیگ Vless میشه از کد فوق‌العاده‌ی BPB استفاده کرد، دستورالعمل فارسی و انگلیسی رو از مخزن خودشون مطالعه کنید.

<br/>

### [CMLIU]

یک فورک دیگه از zizfn معروف از دوست چینیمون برای ساخت کانفیگ Vless-ws-tls، کدهای این دوستمون معروفن به سگ‌جونی و نمیر بودن. بد نیست امتحان کنید، فقط تنها مشکل چینی بودن توضیحات داخل مخزن هست که گوگل ترنسلیت دستتون رو می‌بوسه.

با هرکدوم از روش‌های فوق که کانفیگ vless ساختید (یا از قبل کانفیگ داشتید)، از پاخل کانفیگ مقدار UUID و Hostname رو کپی کنید و بیاید با کن ادامه بدیم.

</details> 

</div>

<br><br/>

## 2. شخصی‌سازی اسکریپت
### دانلود اسکریپت

ابتدا اسکریپت هارمونی را کپی یا دانلود کنید. [^2]  
[worker.js](./worker.js)

این اسکریپت را می‌توان توسط [^3] `Notepad++` در ویندوز یا ابزارهای مدیریت فایل مانند [^4] `MT Manager` در اندروید و یا در داخل ویرایش‌گر گیت‌هاب و ... ویرایش کرد. در صورت دسترسی نداشتن به هیچ‌کدام، ابتدا وورکر جدید کلودفلر ایجاد کرده و این کد را داخل آن جایگذاری و سپس اقدام به ویرایش آن کنید.

### ویرایش UUID

در ابتدای کد، `UUID` پیش‌فرض در لاین `32` را با UUID خود (از داخل کانفیگی که تازه ساختید یا از قبل داشتید) جایگزین کنید.

### ویرایش HostName

در این مرحله از ویرایش کد، باید ادرس هاست کانفیگ خود را با `hostname` پیش‌فرض کد در سه بخش مختلف جایگزین کنید.

**دسته‌ی اول کانفیگ‌های TLS**  
- Host: line [55]
- SNI: line [56]

**دسته دوم کانفیگ‌های TCP**   
- Host: line [69]
- SNI: line [x]

**دسته سوم کانفیگ‌های اضطراری**  
- Host: line [83]
- SNI: line [84]

**نکته:** در کانفیگ‌هایی که با وورکر یا پیج به میزبانی کلادفلر ساخته می‌شوند پارامتر SNI همان Hostname می‌باشد.

<br/>

### ذخیره کد

در نهایت کد ویرایش شده را ذخیره کنید.

## 3. ساخت Worker

1. وارد داشبورد حساب Cloudflare شوید.
2. در نوار ابزار بالای سایت روی آیکون "Add" (در موبایل آیکون "+") کلیک کرده سپس "Workers" را انتخاب کنید.
3. روی گزینه Get Start در مقابل "Start with Hello World!" کلیک کرده و سپس یک نام دلخواه برای ورکر خود انتخاب کنید. سپس Deploy را بزنید.
4. پس از اتمام ساخت وورکر روی Edit code کلیک کنید.
5. قبل از هرکاری؛ کد پیش‌فرض `hello world` داخل وورکر رو کامل حذف کنید، سپس برای انجام عمل جایگذاری کد در pc می‌تونید از کلید‌های ترکیبی`ctrl+v` روی کی‌بورد استفاده کنید، و در موبایل برای جلوگیری از بهم ریختگی کد باید حتما فایل وورکر رو دانلود کرده سپس در محیط ویرایش‌گر کلودفلر آپلود کنید. کافیه اول روی آیکون Explorer سمت چپ کلیک کنید تا منو باز بشه سپس توی یک فضای خالی چند لحظه دستتون رو نگه‌دارید تا گزینه‌ها بالا بیان تا بتونید آپلود رو انتخاب کنید.

- **نکته:** این یادتون نره که همیشه همیشه فایلی که می‌خوایم باهاش وورکر بسازیم باید اسمش `worker.js` هست بدون چیز اضافه‌ای، ولی وقتی می‌خوایم pages بسازیم باید اسم فایل حتما `_worker.js` باشه.

> [!NOTE]
>
> <br/>
> 
> <details>
> <summary> مشاهده اسکرین‌شات‌ها </summary> <br/>
> 
> <p align="center">
>  <img src="https://github.com/user-attachments/assets/b921df78-6471-4ce5-8f2a-d3b2058542de" alt="upload-1" width="768px" />
> </p>
> 
> <p align="center">
>  <img src="https://github.com/user-attachments/assets/ad97fd13-c24c-427d-a42a-45a2395188a5" alt="upload-2" width="768px" />
> </p>
> 
> </details>
>
> <br/>

6. **اعمال تغییرات** بعد از جایگذاری کد در داخل وورکر؛ به منظور اعمال تغییرات از گوشه سمت راست روی گزینه آبی رنگ `Deploy` کلیک کنید.

<br><br/>

## 5. دریافت لینک اشتراک

پس از deploy شدن worker، در همان محیط ویرایشگر با کلیک بر روی گزینه `Visit` یک تب جدید باز شده و کانفیگ‌های خود را در فرمت base64 مشاهده خواهید کرد.

از بخش آدرس بار مرورگر لینک آدرس را کپی کرده و از آن به عنوان لینک ساب در کلاینت دلخواه خود استفاده کنید. در تمام کلاینت‌های با هسته سینگ‌باکس و Xray می‌توان آنرا وارد کرد.

این URL به عنوان لینک اشتراک شما عمل خواهد کرد.

<br/>

## 6. به‌روزرسانی لینک اشتراک

بر روی دکمه `به‌روزرسانی اشتراک` - `Update Subscriptions` داخل کلاینت کلیک کنید.

با هربار انجام این عمل، 30 عدد کانفیگ جدید با IP های تمیز به کلاینت شما اضافه خواهد شد.

> [!CAUTION]
>
> برای شخصی‌سازی بیشتر، لطفاً توضیحات زیر را بخوانید.
>
> <br/>

<br/>

# توضیحات غیر ضروری

> قبل‌تر گفتم واسه‌ی اینکه بتونیم شخصا از این اسکریپت استفاده کنیم، باید UUID و Hostname خودمون‌رو در لاین‌های ذکر شده در ابتدای کد جای‌گذاری کنیم. حالا می‌خوام یکم بیشتر شخصی‌سازی کنیم بر حسب نیاز.

<br/>

## 1. مخازن IP تمیز

ما سه تا مخزن آی‌پی داریم که از هر کدوم ده تا آی‌پی fetch می‌کنه و برامون داخل کانفیگ‌ها قرار می‌ده، جمعاً سی تا کانفیگ در خروجی داریم.

<br/>

### مخزن اول

که داخل کد در لاین [976] با اسم `dinamic1` نوشته شده درواقع آی‌پی‌تمیزهای کلادفلری هستن که اسکنر آی‌پی داخل [گیت‌هاب][5] خودمون هر سه چهارساعت یک‌بار اسکن و لیست می‌کنه، هارمونی‌هم میاد از همونجا یه مشت IPv4/IPv6 برمی‌داره داخل کانفیگ‌ها قرار میده هروقت که شما توی کلاینت روی گزینه آپدیت کلیک می‌کنید.

<br/>

### مخزن دوم

مخزن دوم زیر مخزن اول یعنی در لاین [977] نوشته شده با اسم `dinamic2` که این‌هم باز دوباره واسه خودمونه، یه [Api ساده][6] برای فچ کردن آی‌پی کلادفلر از چند‌جای مختلف هستش.

<br/>

### مخزن سوم

در واقع آی‌پی‌هایی هستن که داخل کد hardcode شدن، با اسم `staticIPs` و نقش fallback رو دارن واسه مواقعی که اینترنتمون اونقدرا خوب نیست که بتونه از مخزن اول و دوم آی‌پی بگیره، از لاین [102] شروع میشن تا لاین [718] آی‌پی ورژن 6 هستن.

از ابتدای لاین [720] یه سری دامنه‌های پشت کلادفلر رو قرار دادم اونایی که عموما واسه همه خوب کار می‌کردن و پشت سر اوناهم یه چندتا آی‌پی ورژن 4 عادی نوشتم تااااا لاین [971].  
تمام آی‌پی‌ و دامنه‌های این مخزن و دوتای قبلی رو می‌تونید به دلخواه خودتون عوض کنید ولی پیشنهاد نمی‌کنم که مخزن یک و دو رو تغییر بدید، چون قطعا بهتر از اینا پیدا نمی‌کنید هیچ‌کجا.

<br/>

## 2. Remark

کانفیگ‌ها ده تا ده تا نام‌گذاری میشن، از لاین [54] می‌تونید نام کانفیگ‌هایی که با آی‌پی‌های dinamic1 ساخته شدن رو تعیین کنید، پیش‌فرض `Harmonyᵀᴸˢ` هستن، و از لاین [68] کانفیگ‌های ساخته شده با آی‌پی‌های dinamic2 با اسم `Harmonyᵀᶜᴾ` قرار دارن (اینارو دیگه مثل دسته قبلی tls نکردیم که بشه از پورت‌های بدون tls هم استفاد کرد)، و از لاین [82] دسته‌ی آخر یعنی `Harmonyᴱᴹˢ` ها شروع میشن که ایناهم tls هستن و با آی‌پی‌های استاتیک هاردکد ساخته شدن، به دلخواه می‌تونید Remark کنید همه‌رو.

<br/>

### 3. alpn type

از لاین‌های [61] و [75] و [89] میشه نوع `alpn` رو تغییر داد برای هر دسته. من پیش‌فرض همه رو `http/1.1` قرار دادم چون ما از کانفیگ‌های نوع `vless-ws-tls` داخل هارمونی اسنفاده می‌کنیم و از اون‌جایی که وب‌سوکت تنها همینو ساپورت می‌کنه، استفاده کردن از `h2` و `h3` عملا بی‌فایده‌است.

<br/>

## 4. Path & Max early data

از لاین [57] و [71] و [85] مقدار `path` قابل تغییره، هر اسمی، هر کلمه‌ای، جمله‌ای که خواستی بدون فاصله با حروف بزرگ و کوچیک می‌تونید قرار بدید، از یک الی 64 کاراکتر ممکنه. من پیشفرض تعیین کردم کاراکترهای رندوم ایجاد بشه.

لاین [37] از کد Max Early Data headers & Name توضیحش یکم سخته فقط اینو بگم که بذارید همین `2560` بمونه، می‌تونید به هر عددی نزدیک به ابن هم تغییرش بدید ولی بهتره که نکنید. قبلا [اینجا][max] یکم توضیح دادم دربارش.

<br/>

## 5. Fingerprints

لاین‌های [62] و [76] و [90] مربوط به fingerprints هستن، موقتا فقط chrome روی کانفیگ‌های وورکری کار می‌کنه واسه همینم به این یدونه محدودش کردم، در آینده‌ که این مشکل برطرف شده بود لیست کامل‌تری از فینگرپرینت‌های دلخواهتون بنویسید مثل:

```rust
fp: ["chrome", "randomized", "firefox", "safari", "edge", "example"],
```

<br/>

## 6. Ports

لاین‌های [60] و [74] و [88] از کد، پورت‌های پیش‌فرض کلادفلر رو مشخص می‌کنن، شما می‌تونید هرکدوم از پورت‌های دیگه رو تعیین کنید نسبت به نوع کانفیگ خودتون، اگه کانفیگتون ساخته شده با pages باشه فقط میشه از پورت‌های HTTPS یا همون TLS استفاده کنید ولی اگه کانفیگتون ساخته شده با workers باشه می‌تونید هم از پورت‌های TLS و هم TCP استفاده کنید.

> [!TIP]
>
> ```CSS
> TLS:.
> ports: ["443", "8443", "2053", "2083", "2087", "2096"],
> ```
>
> ```CSS
> TCP:
> ports: ["80", "8080", "8880", "2052", "2082", "2086", "2095"],
> ```

<br/>

## 7. uniqueIPs.size >= 10

سه تا مخزن آی‌پی داشتیم که از هرکدوم ده تا کانفیگ می‌ساخت و بهمون تحویل می‌داد در مجموع سی تا کانفیگ، کی تعیین کرد سی تارو؟ خودمون :)  
از لاین [35] تعداد کانفیگ‌های ساخته شده در هر دسته رو میشه تعیین کرد.

<br/>

## 8. Merging

و آخرین نکته، گفتم که سه تا دسته 10 تایی کانفیگ داریم تو خروجی این کد، می‌تونید واسه هر دسته یه کانفیگ متفاوت قرار بدید، مثلا واسه دسته اول Host و SNI از کانفیگی که با کد BPB ساختید واسه دسته دوم هاست و sni کانفیگی که با کد فرضا Edtunnel ساختید رو قرار بدید و واسه دسته سوم هر هاست‌نیم و sni کانفیگ دیگه ای رو، ولی به یک شرط، به شرطی که واسه همه‌ی این سه تا از یک UUID استفاده کرده باشید، UUID همشون باید مشترک باشه و همونم تو لاین [32] کد قرار داشته باشه.  
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=plastic&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/NiREvil/Harmony)

**کنجکاو باشید. 🩶🪐**

[^1]: [UUID Generator](https://www.uuidgenerator.net/)

[^2]: [Worker.js](./worker.js)

[^3]: [Get Notepad++](https://notepad-plus-plus.org/downloads/)

[^4]: [Get MT Manager](https://t.me/mtmanager/391)

[^5]: [REvil cleanIPs](https://github.com/NiREvil/vless/blob/main/Cloudflare-IPs.json)

[^6]: [github.com NiREvil](https://raw.githubusercontent.com/NiREvil/Harmony/refs/heads/main/cf-clean.json)

[ZiZifn]: https://github.com/zizifn/edgetunnel
[Harmony]: https://github.com/NiREvil/Harmony
[NiREvil]: https://github.com/NiREvil/
[ZiF]: https://github.com/NiREvil/zizifn
[BPB]: https://github.com/bia-pain-bache/BPB-Worker-Panel
[CMLIU]: https://github.com/cmliu/edgetunnel
[max]: https://t.me/NiREvil_GP/198128
[2]: https://www.uuidgenerator.net
[3]: https://github.com/NiREvil/vless/blob/main/sub/ProxyIP.md
[4]: https://scamalytics.com/ip/api/enquiry?monthly_api_calls=5000
[5]: https://github.com/NiREvil/vless/blob/main/Cloudflare-IPs.json
[6]: https://strawberry.victoriacross.ir
[32]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L32
[35]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L35
[37]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L37
[54]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L54
[55]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L55
[57]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L57
[60]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L60
[61]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L61
[62]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L62
[68]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L68
[69]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L69
[71]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L71
[74]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L74
[75]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L75
[76]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L76
[82]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L82
[83]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L83
[84]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L84
[85]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L85
[88]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L88
[89]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L89
[90]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L90
[102]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L102
[718]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L718
[720]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L720
[971]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L971
[976]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L976
[977]: https://github.com/NiREvil/Harmony/blob/8ae1f9fc7c67577291a42aeb67063e0d374a0901/worker.js#L977


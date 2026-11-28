import { pageContent } from "./page-content.js";

/**
 * Kiroku Internationalization (i18n) Engine
 * Supported Languages: English (en, default), Türkçe (tr), 日本語 (ja)
 * Features:
 *  - High-precision locale and region auto-detection (localStorage, URL param, navigator.languages, TimeZone)
 *  - Graceful fallback to English (en)
 *  - Reactive DOM translation engine (data-i18n, data-i18n-placeholder, data-i18n-aria-label, data-i18n-title)
 *  - Interactive accessible language selector UI with keyboard navigation & glassmorphic styling
 *  - UTF-8 encoding support for Japanese characters and Turkish diacritics
 */

export const SUPPORTED_LANGS = ["en", "tr", "ja"];
export const DEFAULT_LANG = "en";
export const STORAGE_KEY = "kiroku_lang";

export const translations = {
  en: {
    meta: {
      // NOT: Canlıya çıkınca yorum satırları kaldırılacak, kopyalanmasın diye yorum satırına alındı.
      // title: "Kiroku (記録) — Social Anime & Manga Tracker, Taste Match & Reels",
      // description: "Track your anime and manga journey, discover your anime soulmates with Taste Match™, explore vertical Anime Reels, and sync with MyAnimeList in one tap. Coming soon to iOS and Android with zero ad tracking."
      title: "Kiroku (記録) — Social Anime & Manga Tracker",
      description: "Track your anime and manga journey, build shared lists with friends, discover trending stories, and sync with MyAnimeList in one tap. Coming soon to iOS and Android with zero ad tracking."
    },
    nav: {
      brandAria: "Kiroku home",
      joinWaitlist: "Join Waitlist",
      backToKiroku: "Back to Kiroku",
      selectLanguage: "Select language"
    },
    hero: {
      eyebrow: "For anime and manga fans",
      title: "Your anime world, in order",
      lede: "Organize anime and manga, track your progress, discover stories, and share favorites with fellow fans."
    },
    waitlist: {
      platformAria: "Preferred platform",
      platformBoth: "Both",
      emailPlaceholder: "you@example.com",
      emailAriaLabel: "Email address",
      notifyMe: "Notify Me",
      joinWaitlist: "Join Waitlist",
      comingSoon: "Coming Soon",
      statusSuccess: "You're on the waitlist! We'll notify you when Kiroku launches.",
      statusInvalidEmail: "Please enter a valid email address.",
      statusSending: "Sending...",
      statusNetworkError: "Could not reach the signup service automatically. Your email app has been prepared, or send directly to",
      mailSubject: "New Kiroku Waitlist Signup ({platform})"
    },
    story: {
      sectionTitle: "A home for your fandom",
      sectionSubtitle: "Keep your collection, progress, and favorite stories close.",
      railAria: "Feature steps",
      beat1Title: "Your fan life, together",
      // NOT: Canlıya çıkınca yorum satırları kaldırılacak, kopyalanmasın diye yorum satırına alındı.
      // beat1Desc: "See quick links, taste matches, and recent activity gathered in one place.",
      beat1Desc: "See quick links, tracking progress, and recent activity gathered in one place.",
      beat2Title: "Find your next story",
      beat2Desc: "Browse trending anime and manga, then explore titles to add to your collection.",
      beat3Title: "Keep your progress",
      beat3Desc: "Follow where you are in a series and keep your anime and manga moving forward.",
      beat4Title: "Make lists together",
      beat4Desc: "Create shared lists and invite friends to add their picks.",
      beat5Title: "Show your favorites",
      beat5Desc: "Highlight favorite characters on your profile and share what you love with friends."
    },
    showcase: {
      title: "Kiroku in view",
      subtitle: "Discover stories, share lists, and see what friends are watching."
    },
    cta: {
      title: "Be first when Kiroku launches",
      lede: "Join the waitlist for early access on iOS and Android. One email at launch, zero spam."
    },
    modal: {
      dialogAria: "Join the Kiroku waitlist",
      closeAria: "Close waitlist dialog",
      title: "Get notified at launch",
      lede: "Kiroku is coming soon to iOS and Android. Leave your email and we’ll ping you the moment it drops."
    },
    footer: {
      copyright: "© 2026 Kiroku",
      privacy: "Privacy",
      terms: "Terms",
      support: "Support"
    },
    supportPage: {
      title: "Help & Support — Kiroku (記録)",
      description: "Kiroku Support & Help Center. MyAnimeList sync guides, Taste Match™, abuse reporting, sensitive content filter, and account deletion.",
      h1: "Support",
      meta: "Kiroku · Last updated November 15, 2026",
      centerTitle: "Support & Help Center",
      intro: "Need help with Kiroku (記録)? Whether you have a question about your account, MyAnimeList sync, Taste Match™, or want to report abuse or request account deletion, we're here to help.",
      contactTitle: "Contact Support",
      supportEmail: "Support Email:",
      officialSite: "Official Website:",
      instagram: "Instagram:",
      responseNote: "We aim to respond to all support inquiries within 24–48 hours, and all safety/moderation reports are reviewed within 24 hours.",
      topicsTitle: "Common Topics & Guides"
    },
    privacyPage: {
      title: "Privacy Policy — Kiroku (記録)",
      h1: "Privacy",
      meta: "Kiroku · Last updated November 28, 2026",
      description: "Kiroku Privacy Policy. Details on what information we collect, how we use it, zero third-party ad tracking, and self-serve account deletion."
    },
    termsPage: {
      title: "Terms of Service & EULA — Kiroku (記録)",
      h1: "Terms",
      meta: "Kiroku · Last updated November 28, 2026",
      description: "Kiroku End User License Agreement (EULA) and Terms of Service. Zero tolerance policy, UGC guidelines, and safety controls."
    }
  },
  tr: {
    meta: {
      // NOT: Canlıya çıkınca yorum satırları kaldırılacak, kopyalanmasın diye yorum satırına alındı.
      // title: "Kiroku (記録) — Sosyal Anime ve Manga Takibi, Taste Match ve Reels",
      // description: "Anime ve manga yolculuğunuzu takip edin, Taste Match™ ile anime ruh ikizinizi keşfedin, dikey Anime Reels akışını deneyimleyin ve tek dokunuşla MyAnimeList ile senkronize olun. Sıfır reklam takibiyle çok yakında iOS ve Android'de."
      title: "Kiroku (記録) — Sosyal Anime ve Manga Takibi",
      description: "Anime ve manga yolculuğunuzu takip edin, arkadaşlarınızla ortak listeler oluşturun, trend hikayeleri keşfedin ve tek dokunuşla MyAnimeList ile senkronize olun. Sıfır reklam takibiyle çok yakında iOS ve Android'de."
    },
    nav: {
      brandAria: "Kiroku ana sayfa",
      joinWaitlist: "Bekleme Listesine Katıl",
      backToKiroku: "Kiroku'ya Geri Dön",
      selectLanguage: "Dil seçin"
    },
    hero: {
      eyebrow: "Anime ve manga tutkunları için",
      title: "Anime dünyan, düzen içinde",
      lede: "Anime ve mangalarınızı düzenleyin, ilerlemenizi takip edin, yeni hikayeler keşfedin ve favorilerinizi diğer hayranlarla paylaşın."
    },
    waitlist: {
      platformAria: "Tercih edilen platform",
      platformBoth: "Her İkisi",
      emailPlaceholder: "eposta@ornek.com",
      emailAriaLabel: "E-posta adresi",
      notifyMe: "Haber Ver",
      joinWaitlist: "Bekleme Listesine Katıl",
      comingSoon: "Çok Yakında",
      statusSuccess: "Bekleme listesindesiniz! Kiroku çıktığında size haber vereceğiz.",
      statusInvalidEmail: "Lütfen geçerli bir e-posta adresi girin.",
      statusSending: "Gönderiliyor...",
      statusNetworkError: "Kayıt servisine otomatik bağlanılamadı. E-posta uygulamanız hazırlandı veya doğrudan şu adrese gönderin:",
      mailSubject: "Yeni Kiroku Bekleme Listesi Kaydı ({platform})"
    },
    story: {
      sectionTitle: "Tutkunuz için bir yuva",
      sectionSubtitle: "Koleksiyonunuzu, ilerlemenizi ve en sevdiğiniz hikayeleri elinizin altında tutun.",
      railAria: "Özellik adımları",
      beat1Title: "Tüm fan dünyanız bir arada",
      // NOT: Canlıya çıkınca yorum satırları kaldırılacak, kopyalanmasın diye yorum satırına alındı.
      // beat1Desc: "Hızlı bağlantıları, zevk eşleşmelerini ve son etkinlikleri tek bir yerde görün.",
      beat1Desc: "Hızlı bağlantıları, takip ilerlemenizi ve son etkinlikleri tek bir yerde görün.",
      beat2Title: "Sıradaki hikayenizi bulun",
      beat2Desc: "Trend olan anime ve mangalara göz atın, koleksiyonunuza ekleyeceğiniz yeni seriler keşfedin.",
      beat3Title: "İlerlemenizi kaydedin",
      beat3Desc: "Hangi seride nerede kaldığınızı takip edin, anime ve manga maceranızı güncel tutun.",
      beat4Title: "Birlikte listeler oluşturun",
      beat4Desc: "Ortak listeler oluşturun ve arkadaşlarınızı kendi favorilerini eklemeye davet edin.",
      beat5Title: "Favorilerinizi sergileyin",
      beat5Desc: "Profilinizde favori karakterlerinizi öne çıkarın ve sevdiklerinizi arkadaşlarınızla paylaşın."
    },
    showcase: {
      title: "Kiroku'ya genel bakış",
      subtitle: "Hikayeler keşfedin, listeleri paylaşın ve arkadaşlarınızın neler izlediğini görün."
    },
    cta: {
      title: "Kiroku çıktığında ilk siz haberdar olun",
      lede: "iOS ve Android'de erken erişim için bekleme listesine katılın. Lansmanda tek bir e-posta, sıfır spam."
    },
    modal: {
      dialogAria: "Kiroku bekleme listesine katıl",
      closeAria: "Bekleme listesi penceresini kapat",
      title: "Çıkışta ilk siz öğrenin",
      lede: "Kiroku çok yakında iOS ve Android'de. E-postanızı bırakın, yayınlandığı an size haber verelim."
    },
    footer: {
      copyright: "© 2026 Kiroku",
      privacy: "Gizlilik",
      terms: "Kullanım Koşulları",
      support: "Destek"
    },
    supportPage: {
      title: "Yardım ve Destek — Kiroku (記録)",
      description: "Kiroku destek ve yardım merkezi. MyAnimeList eşitleme rehberleri, Taste Match™, kötüye kullanım bildirimi, hassas içerik filtresi ve hesap silme bilgileri.",
      h1: "Destek",
      meta: "Kiroku · Son güncelleme: 15 Kasım 2026",
      centerTitle: "Destek ve Yardım Merkezi",
      intro: "Kiroku (記録) ile ilgili yardıma mı ihtiyacınız var? Hesabınız, MyAnimeList eşitlemesi, Taste Match™ veya kötüye kullanım bildirimi ve hesap silme konularında size yardımcı olmak için buradayız.",
      contactTitle: "Destek ile İletişime Geçin",
      supportEmail: "Destek E-postası:",
      officialSite: "Resmi Web Sitesi:",
      instagram: "Instagram:",
      responseNote: "Tüm destek taleplerine 24–48 saat içinde yanıt vermeyi amaçlıyoruz; güvenlik ve denetim bildirimleri ise 24 saat içinde incelenir.",
      topicsTitle: "Sık Sorulan Konular ve Rehberler"
    },
    privacyPage: {
      title: "Gizlilik Politikası — Kiroku (記録)",
      h1: "Gizlilik",
      meta: "Kiroku · Son güncelleme: 28 Kasım 2026",
      description: "Kiroku Gizlilik Politikası. Toplanan bilgiler, kullanım amaçları, üçüncü taraf reklam takibinin olmaması ve hesabı kendiniz silebilmeniz hakkında bilgi."
    },
    termsPage: {
      title: "Kullanım Koşulları ve EULA — Kiroku (記録)",
      h1: "Kullanım Koşulları",
      meta: "Kiroku · Son güncelleme: 28 Kasım 2026",
      description: "Kiroku Hizmet Koşulları ve Son Kullanıcı Lisans Sözleşmesi (EULA). Sıfır tolerans politikası, kullanıcı içerikleri kuralları ve güvenlik denetimleri."
    }
  },
  ja: {
    meta: {
      // NOT: Canlıya çıkınca yorum satırları kaldırılacak, kopyalanmasın diye yorum satırına alındı.
      // title: "Kiroku (記録) — アニメ・マンガ記録＆ソーシャル発見・Taste Match・Reels",
      // description: "アニメ・マンガの記録、Taste Match™による好みの合う仲間との出会い、縦型Anime Reels、MyAnimeListワンタップ連携。広告トラッキングゼロでiOS＆Android近日登場。"
      title: "Kiroku (記録) — アニメ・マンガ記録＆ソーシャル発見",
      description: "アニメ・マンガの記録、友達との共有リスト作成、話題の作品の発見、MyAnimeListワンタップ連携。広告トラッキングゼロでiOS＆Android近日登場。"
    },
    nav: {
      brandAria: "Kiroku ホーム",
      joinWaitlist: "ウェイティングリストに参加",
      backToKiroku: "Kirokuに戻る",
      selectLanguage: "言語を選択"
    },
    hero: {
      eyebrow: "アニメ・マンガファンのために",
      title: "あなたのアニメの世界を、美しく整理。",
      lede: "アニメやマンガを整理し、視聴・読書の進捗を記録。新たな物語を発見し、お気に入りを仲間と共有しましょう。"
    },
    waitlist: {
      platformAria: "希望するプラットフォーム",
      platformBoth: "両方",
      emailPlaceholder: "you@example.com",
      emailAriaLabel: "メールアドレス",
      notifyMe: "通知を受け取る",
      joinWaitlist: "ウェイティングリストに参加",
      comingSoon: "近日登場",
      statusSuccess: "ウェイティングリストに登録されました！Kirokuのリリース時にお知らせします。",
      statusInvalidEmail: "有効なメールアドレスを入力してください。",
      statusSending: "送信中...",
      statusNetworkError: "登録サービスに自動接続できませんでした。メールアプリを開きました。または直接こちらへ送信してください:",
      mailSubject: "Kiroku ウェイティングリスト登録 ({platform})"
    },
    story: {
      sectionTitle: "すべてのファンダムのための場所",
      sectionSubtitle: "コレクション、進捗、お気に入りの物語をいつでも手元に。",
      railAria: "機能のステップ",
      beat1Title: "ファンの日常を、ひとつに",
      // NOT: Canlıya çıkınca yorum satırları kaldırılacak, kopyalanmasın diye yorum satırına alındı.
      // beat1Desc: "クイックリンク、テイストマッチ、最新のアクティビティをひとまとめに表示。",
      beat1Desc: "クイックリンク、視聴・読書の進捗、最新のアクティビティをひとまとめに表示。",
      beat2Title: "次の物語と出会う",
      beat2Desc: "トレンドのアニメやマンガをチェックし、コレクションに加えたい作品を発見。",
      beat3Title: "進捗をスマートに管理",
      beat3Desc: "シリーズの視聴・読書の現在地を把握し、スムーズに進捗を記録。",
      beat4Title: "みんなでリストを作成",
      beat4Desc: "共有リストを作って友達を招待し、おすすめ作品を持ち寄りましょう。",
      beat5Title: "推し・お気に入りをアピール",
      beat5Desc: "プロフィールにお気に入りのキャラクターを飾り、大好きな作品を友達と共有。"
    },
    showcase: {
      title: "Kirokuのハイライト",
      subtitle: "作品と出会い、リストを共有し、友達の視聴状況をチェック。"
    },
    cta: {
      title: "Kirokuのリリースをいち早く体験",
      lede: "iOSおよびAndroidでの先行アクセスのため、ウェイティングリストにご参加ください。リリース時に1通だけお届け、スパムゼロ。"
    },
    modal: {
      dialogAria: "Kirokuのウェイティングリストに参加",
      closeAria: "ウェイティングリストダイアログを閉じる",
      title: "リリース時に通知を受け取る",
      lede: "KirokuはまもなくiOSおよびAndroid向けに公開されます。メールを登録して、リリース通知をお受け取りください。"
    },
    footer: {
      copyright: "© 2026 Kiroku",
      privacy: "プライバシー",
      terms: "利用規約",
      support: "サポート"
    },
    supportPage: {
      title: "ヘルプ＆サポート — Kiroku (記録)",
      description: "Kirokuサポート＆ヘルプセンター。MyAnimeList同期ガイド、Taste Match™、通報、センシティブコンテンツフィルター、アカウント削除について。",
      h1: "サポート",
      meta: "Kiroku · 最終更新日: 2026年11月15日",
      centerTitle: "サポート＆ヘルプセンター",
      intro: "Kiroku (記録) についてサポートが必要ですか？アカウント、MyAnimeList同期、Taste Match™、通報やアカウント削除のご依頼など、いつでもお問い合わせください。",
      contactTitle: "サポートへの連絡",
      supportEmail: "サポートメール:",
      officialSite: "公式サイト:",
      instagram: "Instagram:",
      responseNote: "すべてのサポートお問い合わせには24〜48時間以内に返信し、安全・モデレーションに関する通報は24時間以内に確認いたします。",
      topicsTitle: "よくあるトピックとガイド"
    },
    privacyPage: {
      title: "プライバシーポリシー — Kiroku (記録)",
      h1: "プライバシー",
      meta: "Kiroku · 最終更新日: 2026年11月28日",
      description: "Kirokuのプライバシーポリシー。収集する情報、その利用方法、第三者広告トラッキングを行わないこと、アカウントのセルフ削除について説明します。"
    },
    termsPage: {
      title: "利用規約＆EULA — Kiroku (記録)",
      h1: "利用規約",
      meta: "Kiroku · 最終更新日: 2026年11月28日",
      description: "Kiroku利用規約およびエンドユーザー使用許諾契約（EULA）。ゼロトレランス方針、ユーザー投稿のルール、安全対策について説明します。"
    }
  }
};

let currentLang = DEFAULT_LANG;
let isInitialized = false;

/**
 * Detect the initial language following priority order:
 * 1. Saved localStorage preference
 * 2. URL search parameter (?lang=...)
 * 3. Browser/OS language preferences (navigator.languages / navigator.language)
 * 4. Region heuristic via Timezone
 * 5. Default fallback (en)
 */
export function detectInitialLanguage() {
  // 1. Saved preference in localStorage
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch {
    // ignore localStorage restrictions
  }

  // 2. URL parameter override
  try {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang")?.toLowerCase();
    if (langParam && SUPPORTED_LANGS.includes(langParam)) {
      return langParam;
    }
  } catch {
    // ignore
  }

  // 3. Browser locale detection
  const locales = [];
  if (Array.isArray(navigator.languages)) {
    locales.push(...navigator.languages);
  }
  if (navigator.language) {
    locales.push(navigator.language);
  }

  for (const raw of locales) {
    if (!raw || typeof raw !== "string") continue;
    const code = raw.toLowerCase().split(/[-_]/)[0];
    if (SUPPORTED_LANGS.includes(code)) {
      return code;
    }
  }

  // 4. Timezone heuristic for region-based automatic detection
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (tz.includes("Istanbul") || tz.includes("Turkey")) {
        return "tr";
      }
      if (tz.includes("Tokyo") || tz.includes("Japan")) {
        return "ja";
      }
    }
  } catch {
    // ignore
  }

  // 5. Default fallback
  return DEFAULT_LANG;
}

/**
 * Get nested translation value by key (e.g. "hero.title")
 */
export function t(keyPath, params = {}) {
  const dict = translations[currentLang] || translations[DEFAULT_LANG];
  const fallbackDict = translations[DEFAULT_LANG];

  const resolve = (obj, path) => {
    return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  };

  let value = resolve(dict, keyPath);
  if (value === undefined) {
    value = resolve(fallbackDict, keyPath);
  }
  if (value === undefined) {
    return keyPath;
  }

  if (typeof value === "string" && params && Object.keys(params).length > 0) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return value;
}

export function getLanguage() {
  return currentLang;
}

/**
 * Update DOM elements with translations
 */
export function applyTranslations() {
  document.documentElement.lang = currentLang;

  const site = document.querySelector(".alf-site");
  if (site) site.setAttribute("lang", currentLang);

  // Update Page Title if meta.title or page-specific title exists
  const pathname = typeof window !== "undefined" && window.location ? window.location.pathname || "" : "";
  const isSupport = pathname.includes("support");
  const isPrivacy = pathname.includes("privacy");
  const isTerms = pathname.includes("terms");
  const isLanding = !isSupport && !isPrivacy && !isTerms;
  const pageKey = isSupport ? "support" : isPrivacy ? "privacy" : isTerms ? "terms" : null;
  const contentRoot = document.querySelector("[data-page-content]");
  if (contentRoot && !contentRoot.dataset.defaultHtml) {
    contentRoot.dataset.defaultHtml = contentRoot.innerHTML;
  }

  if (isSupport && translations[currentLang]?.supportPage?.title) {
    document.title = t("supportPage.title");
  } else if (isPrivacy && translations[currentLang]?.privacyPage?.title) {
    document.title = t("privacyPage.title");
  } else if (isTerms && translations[currentLang]?.termsPage?.title) {
    document.title = t("termsPage.title");
  } else if (isLanding) {
    document.title = t("meta.title");
  }

  if (pageKey) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t(`${pageKey}Page.description`));
    const h1 = document.querySelector("main .alf-doc-inner > h1");
    if (h1) h1.textContent = t(`${pageKey}Page.h1`);
    const pageMeta = document.querySelector("main .alf-doc-meta");
    if (pageMeta) pageMeta.textContent = t(`${pageKey}Page.meta`);
  }

  // Meta description & Open Graph (scoped to landing page to protect specialized subpage meta)
  if (isLanding) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta.description"));

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", document.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t("meta.description"));

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", document.title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", t("meta.description"));
  }

  // Text content elements: [data-i18n]
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const translated = t(key);
    if (el.children.length === 0) {
      el.textContent = translated;
    } else {
      // If there are child elements (e.g. icons), find the direct text node or span
      const targetSpan = el.querySelector("span:not([aria-hidden])") || el;
      targetSpan.textContent = translated;
    }
  });

  // Placeholder attributes: [data-i18n-placeholder]
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.setAttribute("placeholder", t(key));
  });

  // ARIA labels: [data-i18n-aria-label]
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (key) el.setAttribute("aria-label", t(key));
  });

  // Title attributes: [data-i18n-title]
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) el.setAttribute("title", t(key));
  });

  // Legal and support documents are translated as complete HTML fragments so lists,
  // emphasis, links, and every section stay in sync across languages.
  const localizedContent = pageKey && pageContent[currentLang]?.[pageKey];
  if (contentRoot) {
    // Restore the source markup when switching back to English.
    contentRoot.innerHTML = localizedContent || contentRoot.dataset.defaultHtml;
  }
  document.querySelectorAll("[data-page-cta]").forEach((el) => {
    el.hidden = Boolean(localizedContent);
  });

  // Update feature story rail steps titles dynamically if present
  const railDots = document.querySelectorAll(".alf-story-rail li");
  if (railDots.length >= 5) {
    railDots[0].setAttribute("title", t("story.beat1Title"));
    railDots[1].setAttribute("title", t("story.beat2Title"));
    railDots[2].setAttribute("title", t("story.beat3Title"));
    railDots[3].setAttribute("title", t("story.beat4Title"));
    railDots[4].setAttribute("title", t("story.beat5Title"));
  }

  // Update language selector triggers
  updateSelectorUI();

  // Notify any other components
  window.dispatchEvent(
    new CustomEvent("kiroku:langchange", {
      detail: { lang: currentLang, t },
    })
  );
}

/**
 * Set the current language and persist preference
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = DEFAULT_LANG;
  }
  currentLang = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  applyTranslations();
}

/**
 * Update the state and UI of all language selector elements on page
 */
function updateSelectorUI() {
  document.querySelectorAll(".alf-lang-picker").forEach((picker) => {
    const listbox = picker.querySelector('[role="listbox"]');
    if (listbox) listbox.setAttribute("aria-label", t("nav.selectLanguage"));
    const currentBadge = picker.querySelector(".alf-lang-current") || document.getElementById("alf-lang-current");
    if (currentBadge) {
      currentBadge.textContent = currentLang.toUpperCase();
    }

    const trigger = picker.querySelector(".alf-lang-btn");
    if (trigger) {
      trigger.setAttribute("aria-label", `${t("nav.selectLanguage")}: ${currentLang.toUpperCase()}`);
    }

    const options = picker.querySelectorAll(".alf-lang-option");
    options.forEach((opt) => {
      const optLang = opt.getAttribute("data-lang");
      const isSelected = optLang === currentLang;
      opt.classList.toggle("is-active", isSelected);
      opt.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  });
}

/**
 * Bind click and keyboard event handlers for the language selector dropdown
 */
function bindSelectorEvents() {
  document.querySelectorAll(".alf-lang-picker").forEach((picker) => {
    const btn = picker.querySelector(".alf-lang-btn");
    const dropdown = picker.querySelector(".alf-lang-dropdown");
    if (!btn || !dropdown) return;

    const options = Array.from(dropdown.querySelectorAll(".alf-lang-option"));

    const openDropdown = () => {
      dropdown.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      picker.classList.add("is-open");
    };

    const closeDropdown = () => {
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      picker.classList.remove("is-open");
    };

    const focusOption = (idx) => {
      if (options[idx]) options[idx].focus();
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
        const activeIdx = options.findIndex((opt) => opt.classList.contains("is-active"));
        focusOption(activeIdx >= 0 ? activeIdx : 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openDropdown();
        focusOption(options.length - 1);
      }
    });

    options.forEach((opt, idx) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const selected = opt.getAttribute("data-lang");
        if (selected) {
          setLanguage(selected);
          closeDropdown();
          btn.focus();
        }
      });

      opt.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          focusOption((idx + 1) % options.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          focusOption((idx - 1 + options.length) % options.length);
        } else if (e.key === "Home") {
          e.preventDefault();
          focusOption(0);
        } else if (e.key === "End") {
          e.preventDefault();
          focusOption(options.length - 1);
        } else if (e.key === "Tab") {
          closeDropdown();
        }
      });
    });

    // Close on escape key
    picker.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDropdown();
        btn.focus();
      }
    });
  });

  // Click outside to close any open dropdowns
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".alf-lang-picker.is-open").forEach((picker) => {
      if (!picker.contains(e.target)) {
        const btn = picker.querySelector(".alf-lang-btn");
        const dropdown = picker.querySelector(".alf-lang-dropdown");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (dropdown) dropdown.hidden = true;
        picker.classList.remove("is-open");
      }
    });
  });
}

/**
 * Initialize the i18n system
 */
export function initI18n() {
  if (isInitialized) return;
  isInitialized = true;

  currentLang = detectInitialLanguage();
  applyTranslations();
  bindSelectorEvents();
}

// Auto-boot if loaded in browser
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initI18n());
  } else {
    initI18n();
  }
}

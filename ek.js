/* Bogazici — tema duzeltmeleri (Ideasoft temasinin basmadigi/yanlis bastigi seyler)
   NEDEN JS: Ideasoft destek vermiyor ve tema dosyalari duzenlenemiyor. Elde
   kalan tek kanal panelin "Ozel Script Kodlari" alani. Alan 10.000 karakterle
   sinirli ve 9.746'da oldugu icin kod burada durup CDN'den cagriliyor.

   NEDEN AYRI DOSYA: "Site Izleme & Remarketing Kodu" alani dolu; buraya yalniz
   tek satirlik <script src> etiketi sigiyor.

   DIKKAT: panelde bu dosya SABIT COMMIT SHA'sina pinlenmis. Dosyayi guncellemek
   yetmez, paneldeki etiketteki SHA da degistirilmeli (10 karakterli kisa SHA
   kullan, alan byte butcesi dar).

   Icindekiler:
     1) /arama noindex             — arama sonucu sayfalari indeksleniyordu
     1b) ?tp=1 canonical           — temiz URL'nin birebir kopyasiydi
     2) urun aciklamasinin DOM'da iki kez basilmasi
     3) footer'daki olu baglantilar (9 adet "/" adresine gidiyordu)
     4) bos "Tahmini Kargo Suresi" etiketi
     4b) gercek disi urun/kategori sayisi iddiasi
     4c) "orijinal urun" vaadi muadil katalogla celisiyordu
     5) Cerez Politikasi footer baglantisi
     6) WhatsApp olcumu + baglamli hazir mesaj
     7) "En Populer Olanlar" basligi (liste kategoriye gore degismiyor)
     8) urun sayfasinda KDV dahil tutar hic gorunmuyordu
     (canonical'a DOKUNULMUYOR - tema dogru basiyor, bkz. aramaNoindex notu)
*/
(function () {
  if (window.__bgzEk) return;
  window.__bgzEk = 1;


  /* ── 1) Arama sonucu sayfalari indekslenmesin ────────────────────────────
     Tema /arama icin robots'u "index, follow" basiyor; arama sonucu ince bir
     sayfa ve organik giris sayfasi olmamali. Var olan etiketi noindex'e
     ceviriyoruz (yoksa ekliyoruz).

     robots.txt'e Disallow EKLENMEDI: crawl engellenirse Google noindex'i
     goremez ve zaten indekste olan adresler dusmez.

     CANONICAL'A DOKUNULMUYOR: tema canonical'i her sayfa turunde ve DOGRU
     politikayla basiyor (28 Eyl olculdu: ?marka= -> ana kategori, ?tp=N ->
     kendisi, urun/sayfa -> kendisi). Etiketleri TEK TIRNAKLA bastigi icin ilk
     olcumde gozden kacmisti; enjeksiyon gereksiz ve temanin degeriyle
     catisma riski tasiyor. */
  function aramaNoindex() {
    try {
      var yol = location.pathname.replace(/\/+$/, "") || "/";
      if (!/^\/arama(\/|$)/.test(yol)) return;
      var m = document.querySelector('meta[name="robots"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "robots");
        document.head.appendChild(m);
      }
      if (!/noindex/i.test(m.getAttribute("content") || "")) {
        m.setAttribute("content", "noindex,follow");
      }
    } catch (e) {}
  }

  /* ── 1b) Tek canonical kusuru: ?tp=1 ─────────────────────────────────────
     Temanin sayfalama canonical'i dogru (?tp=2 -> kendisi) ama ?tp=1 de
     kendine canonical veriyor; oysa icerigi temiz URL ile BIREBIR AYNI
     (28 Eyl: /kategori/bellek-ram ve ?tp=1 ayni 40 urun, MD5 esit; ?tp=2
     farkli). ?tp=2'nin rel=prev'i ?tp=1'e isaret ettiginden Google onu
     kesfediyor -> 204 kategoride kopya cift.

     YALNIZ tp=1'e dokunulur. tp=2+ kendi canonical'inda kalir — butun
     sayfalari 1. sayfaya toplamak sayfalamayi indeksten dusururdu.
     Yeni etiket OLUSTURULMAZ, var olanin href'i duzeltilir; boylece DOM'da
     canonical sayisi hicbir kosulda artmaz. */
  function tp1Canonical() {
    try {
      if (new URLSearchParams(location.search).get("tp") !== "1") return;
      var c = document.querySelector('link[rel="canonical"]');
      if (!c) return;
      c.setAttribute("href", location.origin + location.pathname);
    } catch (e) {}
  }

  /* ── 2) Urun aciklamasi DOM'da iki kez ───────────────────────────────────
     Tema aciklamayi hem sekme panelinde hem icerik sarmalayicisinda basiyor
     (27 Eyl: iki blogun ilk 400 karakterinin MD5'i birebir ayni). Biri CSS
     ile gizli oldugu icin GORUNMEYENI kaldiriyoruz — hangisinin gizli oldugu
     ekran genisligine gore degistiginden karar CALISMA ANINDA veriliyor.
     Ikisi de goruntuleniyorsa (beklenmez) hicbirine dokunulmuyor. */
  function ciftAciklamaTemizle() {
    try {
      var bloklar = document.querySelectorAll("div.product-detail");
      if (bloklar.length < 2) return;
      var gorunur = [], gizli = [];
      for (var i = 0; i < bloklar.length; i++) {
        var b = bloklar[i];
        if (!(b.textContent || "").trim()) continue;
        (b.getClientRects().length ? gorunur : gizli).push(b);
      }
      if (!gorunur.length || !gizli.length) return;
      for (var j = 0; j < gizli.length; j++) gizli[j].remove();
    } catch (e) {}
  }

  /* ── 3) Footer'daki olu baglantilar ──────────────────────────────────────
     9 baglanti href="/" ile ana sayfaya gidiyordu; "Kategoriler" sutunundaki
     bes kategori (Aksesuar, Kameralar, Konsol, Kulakliklar, Giyilebilir
     Teknoloji) magazada HIC yok. Yerine gercek ust kategoriler konuyor.
     Panelden duzeltilirse bu blok kendiliginden islemsiz kalir (yalniz
     href="/" olanlara dokunur). */
  var FOOTER_ESLEME = {
    "hakkımızda":            ["/sayfa/hakkimizda", null],
    "mağazalar":             ["/sayfa/kutahya-magaza-teknik-servis", null],
    "yardım merkezi":        ["/sayfa/sikca-sorulan-sorular", null],
    "sipariş":               ["/siparis-sorgula", "Sipariş Sorgula"],
    "aksesuar":              ["/kategori/cevre-birimleri-aksesuarlar", "Çevre Birimi ve Aksesuar"],
    "kameralar":             ["/kategori/guvenlik-ve-izleme", "Güvenlik ve İzleme"],
    "konsol":                ["/kategori/bilgisayar-bilesenler", "Bilgisayar"],
    "kulaklıklar":           ["/kategori/kulakliklar", null],
    "giyilebilir teknoloji": ["/kategori/network-altyapi", "Ağ ve Network"]
  };

  function footerOluBaglantilar() {
    try {
      var f = document.querySelector("footer");
      if (!f) return;
      var olu = f.querySelectorAll('.footer-menu a[href="/"]');
      for (var i = 0; i < olu.length; i++) {
        var a = olu[i];
        var etiket = (a.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        var e = FOOTER_ESLEME[etiket];
        if (!e) { var li = a.closest("li"); if (li) li.remove(); continue; }
        a.setAttribute("href", e[0]);
        if (e[1]) {
          /* Tema etiketi <span> icine koyuyor; varsa onu yaz, yoksa dugumu. */
          var sp = a.querySelector("span");
          if (sp) sp.textContent = e[1]; else a.textContent = e[1];
        }
      }
    } catch (e) {}
  }

  /* ── 4) Bos "Tahmini Kargo Suresi" etiketi ───────────────────────────────
     Etiket basiliyor ama deger hic gelmiyor; yaninda zaten "Stokta var, hemen
     kargoda" mesaji var. Degeri olmayan etiket gizleniyor, dolu olan kalir. */
  function bosKargoEtiketi() {
    try {
      var hepsi = document.querySelectorAll("div, span, li, p");
      for (var i = 0; i < hepsi.length; i++) {
        var el = hepsi[i];
        if (el.children.length > 2) continue;
        var t = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (/^Tahmini Kargo Süresi\s*:?\s*$/.test(t)) el.style.display = "none";
      }
    } catch (e) {}
  }

  /* ── 5) Cerez Politikasi footer baglantisi ───────────────────────────────
     Panel > Menu Yonetimi'ne eklenen ogeler UST menuye gidiyor, footer'a
     degil; yasal metinler ise footer'da durur (Mesafeli Satis, Gizlilik,
     Iptal Iade, Kisisel Veriler orada). Cerez bandi da bu sayfaya baglaniyor,
     footer'dan erisilebilir olmasi KVKK acisindan dogru. */
  /* ── 4b) Gercek disi sayi iddiasi ────────────────────────────────────────
     Ana sayfa SEO metni "1.000'in üzerinde ürün, 30+ kategori" diyor; gercek
     24.962 aktif urun ve 204 kategori (28 Eyl olculdu). Kurumsal B2B sayfasi
     ise "24.000+ ürün, 200+ kategori" diyordu -> site kendi kendisiyle
     celisiyordu. Sayi her senkronda degistigi icin dayanikli ifade secildi.

     Tema editorundeki alana API'den erisilemiyor. Panelden duzeltilirse bu
     blok kendiliginden islemsiz kalir (yalniz eski metni arar).
     Metin DUGUMLERI degistirilir, innerHTML'e dokunulmaz — isaretleme ve
     olay dinleyicileri bozulmasin. */
  /* ── 4c) "Orijinal urun" vaadi muadil katalogla celisiyor ────────────────
     Footer aciklamasi ve ana sayfa Hakkimizda metni "orijinal urun" ve
     "Sadece yetkili distributorlerden tedarik" diyor. Katalogda adinda MUADIL
     ya da UYUMLU gecen 827 ilan var (29 Eyl olculdu) ve Muadil Toner ayri bir
     kategori; muadil markalar (PRINTPEN, OfisPc) HP'nin yetkili distributoru
     degil. Iddia oldugu gibi yanlis.

     Ayni iddia SEO ureteclerimizde de vardi (biosis.py kapanis blogu +
     main.py kategori/marka sablonu) — orasi kaynakta duzeltildi. Footer/
     Hakkimizda metni panel ayari; API'de karsiligi YOK (settings, shop,
     store, contents ucları 404, themes 403 — 29 Eyl denendi), o yuzden JS. */
  var METIN_DUZELTME = [
    [/1\.000'in üzerinde ürün,\s*30\+\s*kategori/g,
     "24.000'den fazla ürün, 200'ü aşkın kategori"],
    [/misyonumuz; orijinal ürün, doğru danışmanlık/g,
     "misyonumuz; doğru ürün, doğru danışmanlık"],
    [/Orijinal ve garantili ürünler — Sadece yetkili distribütörlerden tedarik/g,
     "Faturalı ve garantili ürünler — Orijinal ve muadil seçenekler bir arada"],
  ];

  function metinDuzelt() {
    try {
      var g = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var n, d;
      while ((n = g.nextNode())) {
        for (var i = 0; i < METIN_DUZELTME.length; i++) {
          d = METIN_DUZELTME[i];
          if (d[0].test(n.nodeValue)) {
            d[0].lastIndex = 0;
            n.nodeValue = n.nodeValue.replace(d[0], d[1]);
          }
          d[0].lastIndex = 0;
        }
      }
    } catch (e) {}
  }

  /* ── 6) WhatsApp: olcum + baglamli mesaj ─────────────────────────────────
     Site genelinde WhatsApp baglantisi var ama hepsi bos `wa.me/<no>` —
     hazir mesaj yok ve tiklamalar hic olculmuyor. Ikisi de B2B tarafinda
     lead kaybi: satis ekibi musterinin hangi urun/hangi niyetle yazdigini
     bilmeden basliyor.

     PDP'den gelen tiklama ile Kutahya servis sayfasindan gelen tiklama ayni
     sey degil; GA4'e ayri baglamla gonderiliyor. */
  function waBaglam(yol) {
    if (/^\/urun\//.test(yol)) return "urun";
    if (/^\/kategori\//.test(yol)) return "kategori";
    if (/kutahya-magaza-teknik-servis/.test(yol)) return "servis";
    if (/^\/sayfa\/(kurumsal|kamu)/.test(yol)) return "kurumsal";
    if (yol === "/") return "anasayfa";
    return "diger";
  }

  function waMesaj(baglam, ad, url) {
    if (baglam === "urun" && ad) {
      return "Merhaba, şu ürün hakkında bilgi almak istiyorum:\n" + ad +
             "\n" + url;
    }
    if (baglam === "kurumsal") return "Merhaba, kurumsal teklif almak istiyorum.";
    if (baglam === "servis") return "Merhaba, teknik servis randevusu almak istiyorum.";
    if (baglam === "kategori" && ad) {
      return "Merhaba, " + ad + " kategorisinde ürün danışmanlığı istiyorum.";
    }
    return "";
  }

  function whatsapp() {
    try {
      var yol = location.pathname.replace(/\/+$/, "") || "/";
      var baglam = waBaglam(yol);
      var b1 = document.querySelector("h1");
      var ad = b1 ? (b1.textContent || "").replace(/\s+/g, " ").trim() : "";
      var mesaj = waMesaj(baglam, ad, location.origin + yol);

      var bag = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      for (var i = 0; i < bag.length; i++) {
        (function (a) {
          if (a.getAttribute("data-bgz-wa")) return;
          a.setAttribute("data-bgz-wa", "1");

          /* Hazir mesaj yalnizca bagli bir metin varsa ve baglantida zaten
             text parametresi yoksa eklenir. */
          var href = a.getAttribute("href") || "";
          if (mesaj && href.indexOf("text=") === -1) {
            a.setAttribute("href", href + (href.indexOf("?") === -1 ? "?" : "&") +
                           "text=" + encodeURIComponent(mesaj));
          }

          a.addEventListener("click", function () {
            try {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: "whatsapp_click",
                page_type: baglam,
                page_url: location.href,
                lead_context: baglam,
                product_name: baglam === "urun" ? ad : undefined
              });
            } catch (e) {}
          });
        })(bag[i]);
      }
    } catch (e) {}
  }

  function cerezBaglantisi() {
    try {
      var HEDEF = "/sayfa/cerez-politikasi";
      var f = document.querySelector("footer") || document;
      if (f.querySelector('a[href="' + HEDEF + '"]')) return;
      /* Listeyi sinif adina guvenmeden, icindeki bilinen baglantidan yakala. */
      var capa = f.querySelector('a[href="/sayfa/kisisel-veriler-politikasi"]')
              || f.querySelector('a[href="/sayfa/gizlilik-ve-guvenlik"]')
              || f.querySelector('a[href="/sayfa/mesafeli-satis-sozlesmesi"]');
      if (!capa) return;
      var li = capa.closest ? capa.closest("li") : null;
      if (!li || !li.parentNode) return;
      var yeni = document.createElement("li");
      var a = document.createElement("a");
      a.setAttribute("href", HEDEF);
      a.textContent = "Çerez Politikası";
      yeni.appendChild(a);
      li.parentNode.insertBefore(yeni, li.nextSibling);
    } catch (e) {}
  }

  /* ── 7) "En Populer Olanlar" blok basligi ─────────────────────────────────
     Tema bu blogu kategori sayfasinin yan kolonunda basiyor ama liste
     kategoriye gore DEGISMIYOR: /kategori/bellek-ram ile
     /kategori/muadil-tonerler birebir ayni 5 urunu gosteriyor ve hicbiri RAM
     degil (29 Eyl olculdu). Musteri bunlari o kategorinin populer urunleri
     saniyor. Listeyi kategoriye gore kurmak API'den mumkun degil (hicbir
     urunde popularSortOrder yok), dolayisiyla dogru olan basligi gercege
     uydurmak. Baslikta Turkce harf de yoktu ("Populer"). */
  function populerBlokBasligi() {
    try {
      var b = document.querySelectorAll(
        '[data-type="popular-product-list"] .block-item-title span');
      for (var i = 0; i < b.length; i++) {
        if (/^\s*En Pop[uü]ler Olanlar\s*$/.test(b[i].textContent)) {
          b[i].textContent = "Site Genelinde Popüler Ürünler";
        }
      }
    } catch (e) {}
  }

  /* ── 8) KDV dahil tutar urun sayfasinda hic gorunmuyor ───────────────────
     Urun sayfasi "₺7.566 + KDV" yaziyor; KDV dahil tutar yalnizca GORUNMEZ bir
     <meta itemprop="price"> icinde duruyor (9079.01). Oysa Merchant beslemesi,
     sayfanin kendi JSON-LD'si ve Akakce/Cimri listelemeleri hep KDV DAHIL
     tutari gosteriyor: Google Alisveris'te ₺9.079,01 gorup gelen musteri
     sayfada ₺7.566 goruyor ve odemede 9.079 oduyor. Fiyat etiketi mevzuati da
     tuketiciye vergi dahil satis fiyatinin gosterilmesini bekliyor.

     Net fiyat KALDIRILMIYOR — B2B musterisi onu istiyor; KDV dahil tutar
     ALTINA ekleniyor. Tutar sayfadaki meta'dan OKUNUYOR, hesaplanmiyor: yanlis
     KDV orani varsayma riski yok. Yalniz urun detay sayfasinda; kategori
     kartlarina dokunulmuyor. Gorunen fiyat TL degilse (USD listelenen urunler)
     eklenmiyor. */
  function kdvDahilSatir() {
    try {
      var kap = document.querySelector(".product-price-wrapper .product-price");
      if (!kap || kap.querySelector("[data-bgz-kdv]")) return;
      var yeni = kap.querySelector(".product-price-new");
      if (!yeni || !/\+\s*KDV/i.test(yeni.textContent)) return;
      if (yeni.textContent.indexOf("₺") === -1) return;
      var m = document.querySelector('meta[itemprop="price"]');
      var brut = m && parseFloat(m.getAttribute("content"));
      if (!isFinite(brut) || brut <= 0) return;
      var s = document.createElement("div");
      s.setAttribute("data-bgz-kdv", "1");
      s.style.cssText = "font-size:.85em;opacity:.8;margin-top:2px";
      s.textContent = "KDV dahil ₺" + brut.toLocaleString("tr-TR",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      kap.appendChild(s);
    } catch (e) {}
  }

  function calistir() {
    aramaNoindex();
    tp1Canonical();
    ciftAciklamaTemizle();
    footerOluBaglantilar();
    bosKargoEtiketi();
    metinDuzelt();
    populerBlokBasligi();
    kdvDahilSatir();
    whatsapp();
    cerezBaglantisi();
  }

  /* robots etiketi <head>'e mumkun olan en erken anda girsin; DOM'a dokunan
     isler belge hazir olunca. */
  aramaNoindex();
  tp1Canonical();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", calistir);
  } else {
    calistir();
  }
})();

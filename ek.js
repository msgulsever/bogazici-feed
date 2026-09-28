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
     1) canonical etiketi          — tema HIC basmiyor (27 Eyl olculdu)
     2) /arama noindex             — arama sonucu sayfalari indeksleniyordu
     3) urun aciklamasinin DOM'da iki kez basilmasi
     4) footer'daki olu baglantilar (9 adet "/" adresine gidiyordu)
     5) bos "Tahmini Kargo Suresi" etiketi
     6) Cerez Politikasi footer baglantisi
*/
(function () {
  if (window.__bgzEk) return;
  window.__bgzEk = 1;

  var KOK = "https://www.bogazicibilgisayar.com.tr";

  /* ── 1 + 2) canonical ve robots ──────────────────────────────────────────
     Tema hicbir sayfada <link rel="canonical"> basmiyor; bu yuzden
     /kategori/X?marka=Y sayfasi ana kategoriyle AYNI basligi tasiyip Google'a
     ayri sayfa gibi gorunuyor.

     Politika (yanlis canonical sayfa dusurur, o yuzden temkinli):
       /arama…                     -> canonical YOK, noindex,follow
       kategori + filtre parametresi -> ana kategoriye (parametresiz)
       kategori + yalniz ?tp=N     -> KENDISINE (sayfalamada Google'in onerisi)
       diger her sayfa             -> parametresiz kendisine
     Izleme parametreleri (utm_, gclid, fbclid…) her durumda atilir. */
  var FILTRE = ["marka", "brand", "fiyat", "price", "ozellik", "filter",
                "renk", "color", "stok", "sort", "siralama", "orderby"];

  function canonicalKur() {
    try {
      var yol = location.pathname.replace(/\/+$/, "") || "/";
      var par = new URLSearchParams(location.search);

      if (/^\/arama(\/|$)/.test(yol)) {
        /* Arama sonucu organik giris sayfasi olmamali. robots.txt'e Disallow
           EKLENMEDI: engellenirse Google noindex'i goremez ve zaten indekste
           olan adresler dusmez. */
        if (!document.querySelector('meta[name="robots"]')) {
          var mr = document.createElement("meta");
          mr.setAttribute("name", "robots");
          mr.setAttribute("content", "noindex,follow");
          document.head.appendChild(mr);
        }
        return;
      }

      var filtreVar = FILTRE.some(function (k) { return par.has(k); });
      var hedef = KOK + yol;
      if (!filtreVar && par.get("tp")) hedef += "?tp=" + par.get("tp");

      var mevcut = document.querySelector('link[rel="canonical"]');
      if (mevcut) {                       /* tema ileride basmaya baslarsa */
        if (!mevcut.getAttribute("href")) mevcut.setAttribute("href", hedef);
        return;
      }
      var l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      l.setAttribute("href", hedef);
      document.head.appendChild(l);
    } catch (e) {}
  }

  /* ── 3) Urun aciklamasi DOM'da iki kez ───────────────────────────────────
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

  /* ── 4) Footer'daki olu baglantilar ──────────────────────────────────────
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

  /* ── 5) Bos "Tahmini Kargo Suresi" etiketi ───────────────────────────────
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

  /* ── 6) Cerez Politikasi footer baglantisi ───────────────────────────────
     Panel > Menu Yonetimi'ne eklenen ogeler UST menuye gidiyor, footer'a
     degil; yasal metinler ise footer'da durur (Mesafeli Satis, Gizlilik,
     Iptal Iade, Kisisel Veriler orada). Cerez bandi da bu sayfaya baglaniyor,
     footer'dan erisilebilir olmasi KVKK acisindan dogru. */
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

  function calistir() {
    canonicalKur();
    ciftAciklamaTemizle();
    footerOluBaglantilar();
    bosKargoEtiketi();
    cerezBaglantisi();
  }

  /* canonical <head>'e mumkun olan en erken anda girsin; DOM'a dokunan isler
     belge hazir olunca. */
  canonicalKur();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", calistir);
  } else {
    calistir();
  }
})();

/* Bogazici — footer ek baglantilari
   NEDEN AYRI DOSYA: "Site Izleme & Remarketing Kodu" alaninin 10.000 karakter
   siniri var ve 9.646'daydi. Yeni kod oraya sigmiyor; GitHub deposundan
   cagiriliyor (CSS dosyasiyla ayni yontem).

   NE YAPIYOR: Cerez Politikasi baglantisini footer'daki yasal baglanti
   listesine ekler. Panel > Menu Yonetimi'ne eklenen ogeler UST menuye
   gidiyor, footer'a degil; yasal metinler ise geleneksel olarak footer'da
   durur (Mesafeli Satis, Gizlilik, Iptal Iade, Kisisel Veriler orada).
   Ust menudeki kopya kalsin, zarari yok.

   Cerez bandi da bu sayfaya baglaniyor; footer'dan da erisilebilir olmasi
   KVKK acisindan dogru. */
(function () {
  if (window.__bgzFooterEk) return;
  window.__bgzFooterEk = 1;

  var HEDEF = "/sayfa/cerez-politikasi";
  var ETIKET = "Çerez Politikası";

  function ekle() {
    try {
      var f = document.querySelector("footer") || document;
      /* Zaten varsa dokunma (tema ileride eklerse cift gorunmesin). */
      if (f.querySelector('a[href="' + HEDEF + '"]')) return;

      /* Yasal baglantilarin bulundugu listeyi, icindeki bilinen bir
         baglantidan yakaliyoruz — sinif adina guvenmiyoruz, tema degisirse
         kirilmasin. */
      var capa = f.querySelector('a[href="/sayfa/kisisel-veriler-politikasi"]')
              || f.querySelector('a[href="/sayfa/gizlilik-ve-guvenlik"]')
              || f.querySelector('a[href="/sayfa/mesafeli-satis-sozlesmesi"]');
      if (!capa) return;
      var li = capa.closest ? capa.closest("li") : null;
      if (!li || !li.parentNode) return;

      var yeni = document.createElement("li");
      var a = document.createElement("a");
      a.setAttribute("href", HEDEF);
      a.textContent = ETIKET;
      yeni.appendChild(a);
      li.parentNode.insertBefore(yeni, li.nextSibling);
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ekle);
  } else {
    ekle();
  }
})();

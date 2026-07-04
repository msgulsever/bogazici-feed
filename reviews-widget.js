/* bogazici reviews widget - otomatik uretildi */
(function(){
"use strict";
var D={"enabled": false, "rating": 0.0, "count": 0, "google_url": "", "title": "Google Değerlendirmesi", "reviews": []};
if(!D||!D.enabled)return;
var R=D.reviews||[];
if(!R.length&&!(D.rating>0))return;
var cs=document.currentScript;
var host=document.getElementById('bogazici-reviews');
if(!host){if(!cs||!cs.parentNode)return;host=document.createElement('div');cs.parentNode.insertBefore(host,cs);}
host.classList.add('bgzr-host');
var css=""
+".bgzr-host{display:block;width:100%;margin:18px 0;font-family:inherit;text-align:left}"
+".bgzr-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}"
+".bgzr-glogo{width:26px;height:26px;flex:0 0 auto;display:inline-flex}"
+".bgzr-title{font-size:15px;font-weight:600;color:#fff}"
+".bgzr-rating{font-size:20px;font-weight:700;color:#fbbc04}"
+".bgzr-stars{position:relative;display:inline-block;font-size:16px;line-height:1;letter-spacing:2px}"
+".bgzr-stars-base{color:#4a4a5a}"
+".bgzr-stars-fill{color:#fbbc04;position:absolute;top:0;left:0;white-space:nowrap;overflow:hidden}"
+".bgzr-count{font-size:12.5px;color:#9a9ab0}"
+".bgzr-cta{font-size:12.5px;color:#8ab4f8;text-decoration:none;margin-left:auto;white-space:nowrap}"
+".bgzr-cta:hover{text-decoration:underline}"
+".bgzr-row{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}"
+".bgzr-card{flex:0 0 260px;scroll-snap-align:start;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:14px}"
+".bgzr-chead{display:flex;align-items:center;gap:9px;margin-bottom:6px}"
+".bgzr-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff;flex:0 0 auto}"
+".bgzr-nm{font-size:13px;font-weight:600;color:#fff;line-height:1.2}"
+".bgzr-dt{font-size:11px;color:#8a8aa0;margin-top:2px}"
+".bgzr-cstars{font-size:12px;margin:2px 0 8px}"
+".bgzr-tx{font-size:12.5px;color:#c9c9d9;line-height:1.55;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}"
+"@media(max-width:640px){.bgzr-card{flex-basis:82%}}";
var st=document.createElement('style');st.textContent=css;host.appendChild(st);
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function stars(v){var w=el('span','bgzr-stars');var b=el('span','bgzr-stars-base','★★★★★');var f=el('span','bgzr-stars-fill','★★★★★');f.style.width=(Math.max(0,Math.min(5,v))/5*100)+'%';w.appendChild(b);w.appendChild(f);return w;}
var AV=['#e8453c','#4285f4','#34a853','#fbbc04','#a142f4','#24c1e0','#f4511e','#0b8043'];
var head=el('div','bgzr-head');
var g=el('span','bgzr-glogo');
g.innerHTML='<svg viewBox="0 0 48 48" width="26" height="26"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';
head.appendChild(g);
head.appendChild(el('span','bgzr-title',D.title||'Google Değerlendirmesi'));
if(D.rating>0){head.appendChild(el('span','bgzr-rating',D.rating.toFixed(1).replace('.',',')));head.appendChild(stars(D.rating));}
if(D.count>0)head.appendChild(el('span','bgzr-count','('+D.count+' değerlendirme)'));
if(D.google_url){var a=el('a','bgzr-cta',"Google'da bizi değerlendirin ➜");a.href=D.google_url;a.target='_blank';a.rel='noopener';head.appendChild(a);}
host.appendChild(head);
if(R.length){var row=el('div','bgzr-row');
for(var i=0;i<R.length;i++){(function(r,i){
var c=el('div','bgzr-card');var ch=el('div','bgzr-chead');
var av=el('span','bgzr-av',(r.name||'?').trim().charAt(0).toUpperCase());av.style.background=AV[i%AV.length];
var meta=el('span');meta.appendChild(el('div','bgzr-nm',r.name||''));if(r.date)meta.appendChild(el('div','bgzr-dt',r.date));
ch.appendChild(av);ch.appendChild(meta);c.appendChild(ch);
var cst=el('div','bgzr-cstars');cst.appendChild(stars(r.stars||5));c.appendChild(cst);
c.appendChild(el('div','bgzr-tx',r.text||''));row.appendChild(c);
})(R[i],i);}
host.appendChild(row);}
})();

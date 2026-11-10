/* JE ERP offline cache. Bump V when you upload a new version. */
var V='je-erp-v9';
var SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
var LIBS=[
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(V).then(function(c){
  return Promise.all(SHELL.concat(LIBS).map(function(u){return c.add(u).catch(function(){})}))
 }).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(k){
  return Promise.all(k.filter(function(n){return n!==V}).map(function(n){return caches.delete(n)}))
 }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);
 /* live data: never cache */
 if(/firestore\.googleapis\.com|identitytoolkit|securetoken|googleapis\.com\/v1|open-meteo|aladhan/.test(u.href)&&!/fonts\.(googleapis|gstatic)/.test(u.host))return;
 if(u.origin===location.origin){
  /* app files: network first (gets updates), cache when offline */
  e.respondWith(fetch(r).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}
   return res;
  }).catch(function(){
   return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('index.html')})
  }));
  return;
 }
 /* CDN libs and fonts: cache first */
 e.respondWith(caches.match(r).then(function(m){
  return m||fetch(r).then(function(res){
   if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}
   return res;
  })
 }));
});

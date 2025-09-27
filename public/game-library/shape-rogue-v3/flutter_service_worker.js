'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "1f321d27bc9e98378e7030630862be70",
"assets/AssetManifest.bin.json": "9d245f7f317b4151793a405ee0c1a73b",
"assets/AssetManifest.json": "9cc90f5f104d2167b013064ec0e87dd0",
"assets/assets/audio/bgm/digital_clash.mp3": "67dfa501085f087180fd664fc9344b16",
"assets/assets/audio/bgm/digital_clash_2.mp3": "91f975f5872b8ef7cbf25209cc8fd936",
"assets/assets/audio/bgm/digital_clash_2_original.mp3": "8b2eb4b6c13de8206fbf0008123e958b",
"assets/assets/audio/bgm/digital_clash_original.mp3": "51413b85bf01ce4250f69a8afe5998a5",
"assets/assets/audio/bgm/geometric_pulse.mp3": "3197ca70bd3b527552da6954f581655b",
"assets/assets/audio/chaser_shield_break.mp3": "0a13c4d5a1b96cdf60951c2c014eda2a",
"assets/assets/audio/clear.m4a": "01a079cc2f7a3f588ad8688e44be0799",
"assets/assets/audio/clear.mp3": "f40ebba5180ea24638147245fc62d277",
"assets/assets/audio/dash.mp3": "7bd6110bccd6652b0a7d4f455ddec714",
"assets/assets/audio/dash_trim.mp3": "9cbc798f7127c6780b19773347165e12",
"assets/assets/audio/fail.mp3": "6ccea966be0bf61ae50218b6eee6a00c",
"assets/assets/audio/heptagon_resonance.mp3": "4e9c643cb299c9f1be5df8cdd7d100ef",
"assets/assets/audio/hex_field.mp3": "b5b7b5de0f3e883a6fd0fe096eb76d48",
"assets/assets/audio/purchase.mp3": "47e3f05d428af4e1db614c7b7a393470",
"assets/assets/audio/retry_token_collect.mp3": "9020ac9abcd5a39927e061b9d843141e",
"assets/assets/audio/sfx_bomber_explode.mp3": "0232901a53323aeda0e8bdd053ec2e05",
"assets/assets/audio/sfx_drone_deploy.mp3": "29c32683fec72a01c6178b113e848f00",
"assets/assets/audio/sfx_mine_deploy.mp3": "e7374a9a60c74e4a14b97e029d140d8b",
"assets/assets/audio/sfx_mine_explode.mp3": "0e7877d1538c145b3c731c92de1e350a",
"assets/assets/audio/sfx_sniper_snipe.mp3": "3fe948edccb6ddd8d825348b8529233a",
"assets/assets/audio/sfx_splitter_split.mp3": "ab38ea31bc7d63705f52532ad974b553",
"assets/assets/audio/sfx_wave_start_chime.mp3": "f5d3ebb93a2a365d8f47d0258b91f920",
"assets/assets/audio/shield_bash.mp3": "f8eba728924bda30f5387fa4cb85ba78",
"assets/assets/audio/shield_bash_trim.mp3": "ddf91d23cb2cb0157cf5a2279c0e389f",
"assets/assets/audio/spike_shot.mp3": "b3eef1e0842d29607136c9ea3cbf8191",
"assets/assets/audio/spike_shot_trim.mp3": "db6475324f90113858e55de24b028b25",
"assets/assets/audio/star_flare.mp3": "5464543b9aad4e6c3a000cfafd36dfeb",
"assets/assets/audio/star_flare_trim.mp3": "05639cef79d38f9424c662b8de8bcd87",
"assets/assets/audio/victory.mp3": "82997a274733ad4a15a383ad772105cc",
"assets/assets/config/display.yaml": "4603a2fb9735c3db50fe6412624f75a2",
"assets/assets/config/enemies.yaml": "a8d55cf6a6aa1ae900b1c008adb317f6",
"assets/assets/config/game_modes.yaml": "12c8e318a4bb06913e7e4c553b14a54a",
"assets/assets/config/heroes.yaml": "bdba09b8c6f4286f7b5a60682b596daf",
"assets/assets/config/items.yaml": "50b7c53c34554ed9fc9fdbd26c31480b",
"assets/assets/config/item_drops.yaml": "fa41fc3ea08cea0c3558c8b60f9c3581",
"assets/assets/config/waves.yaml": "a4485a4c7fd8b99cc0a3370c720365dc",
"assets/assets/images/ability_mastery.png": "701c6b10ee68c3b6d02d25b41d30153c",
"assets/assets/images/ability_mastery_transparent.png": "30fe58666c8eea2af244ed206bad1410",
"assets/assets/images/attack_speed_up.png": "3c29bb5afacf44e83da302af82e410a8",
"assets/assets/images/attack_speed_up_transparent.png": "b69c81cbb153ebc88601e43bffeacc4a",
"assets/assets/images/auto_injector.png": "edaedec977331381077e36baea97435c",
"assets/assets/images/auto_injector_transparent.png": "ea1a3967f20c8269ecd1e7089eba314c",
"assets/assets/images/background1.png": "8cec5eed74e03e7fbdb6d4c0a575e104",
"assets/assets/images/bouncing_bullet.png": "6cde45f9d3af5548f7c61b490445a285",
"assets/assets/images/bouncing_bullet_transparent.png": "0138433197a18dad9700417993112bc1",
"assets/assets/images/coin_magnet.png": "3d709e3367d2cbed54116489130bbe3a",
"assets/assets/images/coin_magnet_transparent.png": "2028c01a34026777622b9d040e81d40e",
"assets/assets/images/critical_striker.png": "0d375d078279b0e9e0b000caa07c49fc",
"assets/assets/images/critical_striker_transparent.png": "23dcd807e4956ed120e5cb4d4325da97",
"assets/assets/images/drone_wingman.png": "6b924cc1c256fe91f0025ad123aad081",
"assets/assets/images/drone_wingman_transparent.png": "161e14ca79d6ee816fccfd78b9952c8a",
"assets/assets/images/enlarged_caliber.png": "cacc5f8890c3c65f1769e176e1c27ec2",
"assets/assets/images/enlarged_caliber_transparent.png": "394dd43d23701c4d8ca253f5db02e83b",
"assets/assets/images/extended_reach.png": "9488094f54b48b98ee23a76922cd7c0a",
"assets/assets/images/extended_reach_transparent.png": "5837c81c4d031a7c2f9934062bcf0265",
"assets/assets/images/health_potion.png": "e2a5c96eea7b348b9f60294f19654c3b",
"assets/assets/images/health_potion_transparent.png": "3bbabfad103287c951acdbdfe0b460ea",
"assets/assets/images/logo-512.png": "d88c1a77bbcfdf67479f9769596abd74",
"assets/assets/images/logo.png": "40e8b1baec8473511a0a4282c7387be6",
"assets/assets/images/max_health_up.png": "bb96846950cb5578f640559932cd6af2",
"assets/assets/images/max_health_up_transparent.png": "99332bf6de96a7e056348c25cd07e212",
"assets/assets/images/speed_boost.png": "46209446d7f35a36c2fc8e415ca84085",
"assets/assets/images/speed_boost_transparent.png": "2aa652d46968436fa296e6697c4dcf0c",
"assets/assets/images/spread_master.png": "ea2931ad97b24d55f308e4553a50a6e5",
"assets/assets/images/spread_master_transparent.png": "6fa574d4e781c914de315a0100e3594a",
"assets/assets/images/vampiric_coating.png": "59eaa346bbdae5f1ec74a49a58b44078",
"assets/assets/images/vampiric_coating_transparent.png": "368094b2ba3510187c0c2c0344956a01",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "fe09a1781cc41a1e86f5fc1282f22e28",
"assets/NOTICES": "faf06034c783f7d620c0a17fcf47f9e7",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"favicon.png": "cba3eca4fda4c3e82c4e474a534cafba",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"flutter_bootstrap.js": "b81f37f4153dc5d6870b41cc52b4f21c",
"icons/Icon-192.png": "6be1115785c41ef8f3e06140e4ad1405",
"icons/Icon-512.png": "540b28a601c3517735466af3a9822827",
"icons/Icon-maskable-192.png": "654b89b19cf429cbc4937959eb07f161",
"icons/Icon-maskable-512.png": "327c72127caf7131e167b9171c86c453",
"index.html": "fd825be22d45d649bc481bf16005fb5e",
"/": "fd825be22d45d649bc481bf16005fb5e",
"main.dart.js": "730b5b1c4b265eef3ee742fda9a1aea8",
"manifest.json": "6e0f07c424c456db95945e97f006d9b0",
"version.json": "ee455e2727d27ff4960d48e974941d86"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

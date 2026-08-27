# Stockfish 18 Provenance

Crazy Chess desktop builds use unmodified Stockfish executables as separate processes that communicate with the Flutter application through the Universal Chess Interface. The executables are not stored in ordinary Git history; the platform preparation scripts download the pinned official release and verify both archive and executable checksums. Browser and mobile boundaries are documented separately below.

## Pinned Release

- Project: Stockfish
- Version: 18
- Upstream tag: `sf_18`
- Upstream commit: `cb3d4ee`
- Platform asset: `stockfish-macos-m1-apple-silicon.tar`
- Release page: <https://github.com/official-stockfish/Stockfish/releases/tag/sf_18>
- Source archive: <https://github.com/official-stockfish/Stockfish/archive/refs/tags/sf_18.tar.gz>
- Downloaded archive SHA-256: `4d77c4aa3ad9bd1ea8111f2ac5a4620fe7ebf998d6893bf828d49ccd579c8cb0`
- Installed executable SHA-256: `bc0cac905ecdf2147fe22055c733bcd999b1e3f7c399fbaf7fb9055786563590`
- Installed architecture: Apple Silicon `arm64`

The fetch script copies the binary without modification from the official release archive. The exact GPL v3 license supplied by Stockfish is included as `COPYING.txt`.

## Windows Portable Build

- Platform asset: `stockfish-windows-x86-64.zip`
- Archive SHA-256: `40cc975817e7eee270b03f354810d20956df565420d320f6dd37d454dc81a139`
- Installed executable SHA-256: `9bde420202717ce083412027fbfb8c5c935b537591d712be8a8a8bae92f6e8d6`
- Installed architecture: Windows `x86-64` universal
- Installed name: `stockfish.exe`, beside `CrazyChess.exe`

`utils/prepare_stockfish_windows.py` extracts the exact executable from the verified official archive without modification.

## Runtime Boundary

The executable remains a separate program. Crazy Chess starts it as a child process, sends text UCI commands to standard input, and reads text UCI output from standard output. The Stockfish binary is not linked into the Flutter application.

## Browser Distribution

Crazy Chess also distributes the Stockfish.js 18 Lite single-thread build for
browser AI Duel. It runs locally in a dedicated Web Worker and loads its
WebAssembly module beside the worker script.

- Package: `stockfish@18.0.0`
- Stockfish.js release/tag: `v18.0.0`
- Stockfish.js commit: `31a9875`
- Upstream Stockfish tag/commit: `sf_18` / `cb3d4ee`
- Worker: `web/stockfish/stockfish-18-lite-single.js`
- Worker SHA-256: `2278005057f381491f1c9bb3e44c9f5920b3a00bef9759e33cc6582769a1f1fe`
- WASM: `web/stockfish/stockfish-18-lite-single.wasm`
- WASM SHA-256: `a8fbc05ec6920b56d7485826dcb02c5ffd2826bcbf751cf973046f237a9096f1`
- Source: <https://github.com/nmrugg/stockfish.js/tree/v18.0.0>
- Package: <https://www.npmjs.com/package/stockfish/v/18.0.0>

The browser build is not linked into the Flutter-generated JavaScript. The app
starts the standalone worker at AI preflight and exchanges text UCI messages
through `postMessage`. The GPL v3 license and exact source/checksum pointer are
copied beside the browser artifacts as `COPYING.txt` and `SOURCE.txt`.

## iOS And Android Mobile Distribution

Mobile AI Duel uses a vendored, reviewable fork of the `stockfish` Flutter
package `1.8.1` and compiles Stockfish 18 into the application as an in-process
FFI engine. This is a different distribution boundary from the desktop
child-process and browser-worker builds.

- Upstream wrapper: <https://github.com/ArjanAswal/Stockfish/tree/1.8.1>
- Published archive: <https://pub.dev/api/archives/stockfish-1.8.1.tar.gz>
- Archive SHA-256: `b27956fa6c21f8637db62411c564d1ba1d0b0e9e27ee928f42a85367da891fa0`
- Vendored path: `third_party/stockfish/mobile_flutter`
- Local wrapper version: `1.8.1+crazychess.1`
- App identifier / Android application ID: `ai.arcaneforge.crazy_chess`
- Android Play ABIs: `arm64-v8a` and `armeabi-v7a` (`x86_64` is excluded from production bundles)

The wrapper is modified to eliminate build-time downloads, require prepared
NNUE inputs, use the current Android toolchain namespace, and expose reliable
asynchronous initialization/disposal. The Stockfish engine source remains at
the pinned official `sf_18` revision. Exact modifications are visible in the
vendored source and summarized in `manifest.json`.

The ignored NNUE binaries are prepared with
`scripts/fetch_stockfish_mobile_nnue.sh`, which verifies these exact hashes:

- `nn-c288c895ea92.nnue`: `c288c895ea924429ea9092e3f36b2b3c1f00f2a3a4c759ff7e57e79e3b43e4a7`
- `nn-37f18f62d772.nnue`: `37f18f62d772f3107e1d6aaca3898c130c3c86f2ab63e6555fbbca20635a899d`

The in-app Open Source Licenses page includes the GPL notice, Stockfish
provenance, NNUE hashes, and this corresponding-source pointer. The exact
source snapshot for the Android 0.9.0+1 build is prepared at
`android-0.9.0-1` at:

- <https://games.arcaneforge.ai/open-source/crazy-chess/android-0.9.0-1/>

The versioned page provides the immutable corresponding-source archive, its
SHA-256 checksum, the full GPLv3 text, and the build metadata for the
distributed Android 0.9.0+1 build. The development repository may remain
private; no account or password is required to download the source archive.

## Rebuilding Android 0.9.0+1

The release was built with Flutter 3.38.5 / Dart 3.10.4, JDK 17, Android
Gradle Plugin 8.11.1, Gradle 8.14, Android compile/target SDK 36, minimum SDK
24, and NDK 28.2.13676358. From the repository root:

1. Install Flutter and Android SDK 36 with NDK 28.2.13676358.
2. Copy `android/key.properties.example` to the ignored
   `android/key.properties` and configure your own keystore for a signed
   release. Do not commit the keystore or properties file.
3. Run `./scripts/fetch_stockfish_mobile_nnue.sh` to download and verify the
   two pinned NNUE networks.
4. Run `make build-play-android`.
5. Optionally run `make verify-play-android` with `bundletool` available to
   inspect the signed bundle, manifest, ABIs, notices, secrets, and arm64
   device download estimate.

The resulting bundle is
`build/app/outputs/bundle/release/app-release.aab` and contains only
`arm64-v8a` and `armeabi-v7a` Stockfish libraries.

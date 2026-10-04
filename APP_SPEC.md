# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `1.0.0`
- **One-sentence purpose:** 複数の写真を読み込み、写真に合ったレイアウトで1枚のコラージュ画像にまとめる。
- **Primary users:** 家族・旅行・イベント・商品・作業写真など、数枚の写真を手早く1枚にまとめたい一般ユーザー。

## 2. Product boundary

このアプリはデザインソフトではない。中心価値は次の短いフローである。

```text
写真を追加
↓
写真に合ったレイアウト候補を選ぶ
↓
必要なら少し調整
↓
1枚の画像として保存
```

v1系では、自由配置・ステッカー・フィルター・AI生成・クラウド保存などへ無制限に拡張しない。

## 3. Differentiator

固定テンプレートを大量に探させるのではなく、読み込んだ写真の枚数・縦横比・主役写真・出力比率から、トリミング量の少ないレイアウト候補を生成する。

AIモデルや外部APIは使用しない。

## 4. Supported input

- JPEG / JPG
- PNG
- WebP
- 2〜20枚を正式対応
- 1枚のみの場合は追加を案内し、最終書き出しは無効
- 20枚を超えた分は黙って無視せず件数を案内
- ファイル選択、複数選択、Drag & Drop
- スマートフォンのOS標準画像選択

HEIC / HEIFはv1.0.0では正式対応しない。

## 5. Data and privacy

- ユーザー写真はブラウザ内のみで処理する。
- ランタイム外部通信を行わない。
- CSPは `connect-src 'none'` を基本とする。
- CDN、外部フォント、Analytics、Telemetry、AI APIを使用しない。
- ユーザー写真をlocalStorage / IndexedDB / Cache Storageへ自動保存しない。
- 写真はページ再読み込みで失われる。
- 書き出し画像はCanvasから新規エンコードし、元画像のEXIF / GPS等を意図的に引き継がない。

## 6. State model

最低限以下を明確に分ける。

- `empty`
- `loading`
- `ready-one-photo`
- `ready`
- `partial-error`
- `exporting`
- `complete`
- `error`

入力変更中の非同期処理はgeneration tokenで古い結果を破棄する。

## 7. Photo model

各写真について最低限以下を保持する。

- id
- File reference
- original filename
- width / height
- aspect ratio
- order
- thumbnail Blob URL
- crop x / y
- zoom
- fit mode
- hero state
- load / error state

写真の元ファイルはメモリ上で参照し、プレビュー用には縮小画像を利用する。

## 8. v1.0.0 functional target

### Photo management

- 追加 / 削除
- 並べ替え
- サムネイル
- 写真サイズ表示
- 削除Undo

### Automatic layout

- 2〜20枚
- キャンバス比率と各写真aspect ratioを利用
- Crop loss
- Extreme cell penalty
- Balance penalty
- Hero compatibility
- Similar layout deduplication
- 最大6候補
- 「別の配置を見る」
- 同条件で基本的に同じ結果となる決定的処理

### Photo adjustment

- crop位置
- zoom
- Fill / Fit
- 「この写真を大きく」
- 「通常サイズに戻す」

### Canvas

- 1:1
- 4:5
- 9:16
- 16:9
- 3:2
- 4:3（初期値）
- カスタム比率
- 写真間隔
- 外周余白
- 単色背景
- 角丸
- PNG透明背景

### Export

- JPEG
- PNG
- WebP
- JPEG / WebP quality
- 長辺1080 / 2160 / 4096px
- カスタム解像度
- 最大辺8192px / 最大32MPを基本安全上限
- 保存前の出力ファイル名編集
- 無効文字sanitize
- 拡張子自動付与

### Undo / Redo

- 最大50操作を目安
- Ctrl/Cmd + Z
- Ctrl/Cmd + Shift + Z

## 9. Desktop UX target

基本は写真一覧 / プレビュー / 設定の3領域。狭い幅では2カラム以下へ縮退し、3カラムを無理に維持しない。

## 10. Smartphone UX target

v0.6.0でテンプレート標準 `mobile-bottom-bar` を利用し、以下の4ページに分ける。

- 写真
- レイアウト
- 仕上げ
- 保存

PC版を単純縦積みしたUIにしない。safe-area、固定UI重なり、360px幅、長いファイル名を確認する。

## 11. Accessibility

- Visible focus
- Accessible names
- `aria-live`
- Enter / Space
- Escapeでモーダル終了
- キーボード操作
- 色だけで状態を区別しない
- `prefers-reduced-motion`

## 12. Browser targets

- Chrome stable
- Edge stable
- Firefox stable
- Safari stable
- iOS Safari stable
- Android Chrome stable
- `file://` 直開き必須

## 13. Non-goals for v1.0.0

- 完全自由配置
- 自由角度回転
- スクラップブック型重なり編集
- テキスト
- ステッカー
- フィルター / 写真補正
- 背景除去
- AI画像生成 / AIデザインAPI
- クラウド保存
- ログイン
- SNS直接投稿
- 共同編集
- 100枚以上のContact Sheet用途

## 14. Development roadmap

### v0.1.0 — Foundation / Photo Input

- 最新 `htmlapps-template` 準拠
- JA / EN
- JPEG / PNG / WebP
- 複数選択
- Drag & Drop
- 2〜20枚制限
- サムネイル
- サイズ表示
- 写真追加 / 削除
- Empty / Loading / Ready / Partial failure
- Canvasプレビュー基盤
- no runtime network
- `file://`

**Exit:** 20枚まで読み込め、破損画像を分離し、360pxで追加・削除できる。

### v0.2.0 — Automatic Layout Engine

- aspect ratio解析
- candidate generation
- crop loss / balance scoring
- diversity filtering
- 最大6候補
- 「別の配置を見る」

### v0.3.0 — Photo Editing / Hero / Reorder

- 並べ替え
- crop
- zoom
- Fill / Fit
- 主役写真
- 削除Undo

### v0.4.0 — Canvas & Finish

- 比率プリセット / custom
- gap
- outer margin
- background
- rounded corners
- PNG transparency

### v0.5.0 — High-resolution Export

- JPEG / PNG / WebP
- quality
- resolution presets
- editable filename
- export progress / failure recovery

### v0.6.0 — Smartphone UX

- `components/mobile-bottom-bar.html`利用
- 4ページ切替
- safe area
- narrow viewport / landscape

### v0.7.0 — Undo / Accessibility / Interaction Polish

- 50-step undo / redo
- keyboard shortcuts
- accessible controls
- reset confirmation

### v0.8.0 — Performance / Memory / Robustness

- preview decode最適化
- object URL / bitmap解放
- 20×12MP desktop
- 10×12MP mobile
- orientation / extreme aspect regression

### v0.8.1 — UX polish

- privacy badgeを「完全ローカル処理」へ変更
- default canvas ratioを4:3へ変更
- 「別の配置を見る」で次候補を自動選択しpreviewも更新
- alternate layout page数をボタンへ表示
- desktop Drag & Dropを維持
- touch / pen向けdrag handleを追加
- drag reorderもUndo / Redo対象として維持
- current htmlapps-template header UIへ同期
- photo cardはgrid rowへstretchせずcontent heightで表示
- photo action rowは横並びを維持し、不要な縦余白を作らない
- desktopでは専用drag gripを表示せずcard Drag & Dropを利用
- coarse pointerではthumbnail上のcompact gripを表示

### v0.9.0 — Release Candidate

- 機能凍結
- PC / smartphone / JA / EN回帰
- README / screenshots / favicon
- standalone / self-extract / CSP / network確認
- 失敗画像のfilename分離表示
- app-specific RC regressionをCIへ固定

### v1.0.0 — Final Release

- 2 / 3 / 4 / 5 / 8 / 12 / 20枚回帰
- 横のみ / 縦のみ / 混在 / square / panorama / extreme portrait
- JPEG / PNG / transparent PNG / WebP / custom resolution
- CI green
- `file://` / offline smoke

## 15. v0.8.0 implementation contract

v0.8.0では高解像度写真を扱うときのpeak memoryを抑え、orientation・extreme aspect・履歴復元を含めた画像resource lifetimeを明示的に管理する。

### Decode strategy

画像decodeでは利用可能な場合 `createImageBitmap(file, { imageOrientation: 'from-image' })` を優先する。

- EXIF orientationを反映したbitmapを利用する。
- width / height / aspect ratioはorientation適用後のdrawable dimensionsから取得する。
- 使用後は `ImageBitmap.close()` を呼ぶ。
- `createImageBitmap` が利用できない、または通常のdecode互換性理由で失敗した場合のみ `HTMLImageElement` へfallbackする。
- memory pressureとして判定した失敗では同じ元画像を別decoderで再decodeせず、その失敗を呼び出し側へ返す。

### Input / thumbnail memory

写真は1枚ずつdecodeする。

1. 元画像をdecode
2. 最大辺360pxのthumbnail Canvasへ描画
3. 元decodeを即解放
4. thumbnailをJPEG Blobへencode
5. thumbnail Canvasを1×1へ縮小

元画像decodeをthumbnail encode完了まで保持しない。

写真間ではanimation frameを挟み、長い連続処理中にUI threadへ制御を返す。

### Preview cache

previewにはthumbnailだけを利用し、元写真を編集操作ごとにdecodeしない。

- 現在の写真に存在しないpreview decoded imageはcacheから外す。
- Undo / Redoで復元する可能性がある写真のthumbnail Object URLは履歴から参照される限り保持する。
- Undo / Redo stackからも参照されなくなったthumbnail URLはrevokeする。
- pagehideでpreview cacheと全session thumbnail URLを解放する。

### Export memory

高解像度exportは従来どおり元Fileを1枚ずつdecodeする。

各写真はCanvasへ描画直後にdecode resourceをdisposeし、次の写真をdecodeする前にanimation frameを挟む。

encode完了後はdownload Blob URLを作る前にexport Canvasを1×1へ縮小できる状態へし、成功 / failureのどちらでもfinallyでbuffer releaseを行う。

### Hidden Canvas release

写真が2枚未満、または有効layoutがない場合はmain preview Canvasを1×1へ縮小する。

Finish / Save用mobile preview Canvasも非表示時は1×1へ縮小する。

### Local file type robustness

File.typeが空、または `application/octet-stream` の場合でも、filename extensionが `.jpg` / `.jpeg` / `.png` / `.webp` なら入力を許可する。

明確な非画像MIMEが付いている場合はextensionだけで上書きしない。

### Memory-pressure recovery

画像入力がresource pressureで全件失敗した場合は、破損画像と同じgeneric errorだけで終わらせず、枚数または画像サイズを下げる案内を表示する。

exportがresource pressureで失敗した場合は出力解像度を下げる案内を表示する。

### Extreme aspect robustness

photo aspect ratioはlayout scoring内部で安全範囲へclampし、0.01相当のextreme portraitや100相当のpanoramaでもNaN / Infinity / negative cellを生成しない。

canvas custom ratioの正式範囲1:10〜10:1を維持する。

### Rendering quality

thumbnail / high-resolution exportのCanvas 2Dではimage smoothingを有効にし、利用可能な場合はhigh qualityを指定する。

PNG thumbnailはJPEG thumbnailへflattenするため、thumbnail Canvasは白背景で初期化する。これはpreview用thumbnailのみで、最終PNG transparencyには影響しない。

## 16. v0.8.0 acceptance criteria

- `createImageBitmap` 利用時に `imageOrientation: 'from-image'` を指定する。
- ImageBitmap使用後に `close()` を呼ぶ。
- createImageBitmap非対応時にHTMLImageElement fallbackがある。
- memory pressure時は同じ画像をfallback decoderで再decodeしない。
- thumbnail作成は1写真ずつ行う。
- thumbnail描画後、encode待ち前に元decodeを解放する。
- thumbnail Canvasを処理後1×1へ縮小する。
- 写真間でUIへyieldする。
- exportは元写真を1枚ずつdecodeする。
- export各写真描画後にdecode resourceを解放する。
- export encode後にCanvas bufferを早期解放する。
- hidden main / mobile preview Canvasを1×1へ縮小する。
- preview cacheから非current decoded imageを除去する。
- Undo / Redoに必要なthumbnail URLは保持する。
- historyから参照されなくなったthumbnail URLをrevokeする。
- pagehideでpreview cacheとthumbnail URLを解放する。
- MIMEなしJPEG / PNG / WebPをextension fallbackで受け入れる。
- 明確な非画像MIMEはextensionだけで受け入れない。
- input memory failureに回復案を表示する。
- export memory failureに解像度を下げる案内を表示する。
- 0.01〜100相当のphoto aspectを含むlayout回帰でfinite score / finite cellsを維持する。
- canvas 1:10 / 10:1でlayout / export dimension計算が成立する。
- 最大辺8192px / 最大32MP制限を維持する。
- duplicate photosを別idとして扱える。
- Unicode / long filenameをUIとexport filename処理で破綻させない。
- Runtime CSPの `connect-src 'none'` を維持する。
- `__APP_ICON_DATA_URI__` はfaviconとheader iconの2箇所のみ。
- `APP:BEGIN` / `APP:END`, `APP:HELP:BEGIN` / `APP:HELP:END` を維持する。
- `StandaloneAssets`, `window.AppToast`, `AppMobileBottomBar`, `outputFilename` 契約を維持する。

### Device stress targets for RC

v0.8.0の構造上の目標は以下とするが、実機browserでの最終stress confirmationはv0.9.0 RCで実施する。

- desktop: 20 × 12MP JPEG
- smartphone: 10 × 12MP JPEG

failureした端末では無反応・page破損にせず、部分失敗または解像度低下のrecoveryを提示する。

## 17. v0.9.0 release candidate contract

v0.9.0では新しい編集機能を増やさず、v1.0.0へ向けた機能凍結・エラー状態・文書・CI回帰を仕上げる。

### Feature freeze

v0.9.0以降、v1.0.0まで以下を原則固定する。

- 2〜20枚
- JPEG / PNG / WebP input
- automatic layout + More layouts
- reorder / crop / zoom / Fill / Fit / hero
- 4:3 default canvas
- finish controls
- JPEG / PNG / WebP export
- 50-step Undo / Redo
- smartphone 4-page workflow

新しいデザイン機能やinput formatはv1.0.0前には追加しない。

### Partial failure

一部の画像だけdecodeできなかった場合、正常画像を破棄しない。

失敗画像は「読み込めなかった写真」としてfilename付きで写真一覧の下へ分離表示する。

次の追加操作では最新batchの失敗一覧へ置き換え、Resetでは失敗一覧もclearする。

### RC regression script

`scripts/check-photo-collage-rc.cjs` をStandalone CIで実行する。

最低限以下を自動検証する。

- JavaScript syntax
- duplicate element ID
- JA / EN translation key parity
- canonical icon placeholder count
- CSP `connect-src 'none'`
- external runtime src / hrefなし
- default / reset canvas 4:3
- failed-file UI存在
- 2〜20枚 standard layout
- extreme portrait / panorama layout
- More layouts candidate pages
- input MIME fallback
- 8192px / 32MP output limit
- forward / backward reorder
- 50-step history / Undo / Redo / Reset→Undo
- mobile 4 pages / 4 bottom items
- stale pre-RC UI versionなし

### Finished-app documentation

READMEは完成アプリ向けの以下の順序へ整理する。

1. purpose
2. representative screenshot
3. features
4. how to use
5. privacy
6. supported browsers / devices
7. limitations
8. single-HTML / offline
9. development / verification
10. license / notices

`SECURITY.md` と `THIRD_PARTY_NOTICES.md` からstarter固有表現を除く。

### RC manual verification targets

自動CIだけではbrowser / device実動作を代替しない。

v1.0.0へ進む前に少なくとも以下を実ブラウザーで確認する。

- fresh load
- 2 / 3 / 4 / 5 / 8 / 12 / 20 photos
- all landscape / all portrait / mixed / square / panorama / extreme portrait
- invalid / corrupt mixed batch
- Undo / Redo / Reset
- desktop Drag & Drop
- touch reorder
- crop / zoom / Fill / Fit / hero
- JA / EN
- 360px smartphone
- desktop
- help dialog last item
- JPEG / PNG / transparent PNG / WebP / custom output
- output filename
- readable standalone via `file://`
- self-extract via `file://`
- offline reload
- no runtime network after initial HTML load
- no console error
- desktop target 20 × 12MP JPEG
- smartphone target 10 × 12MP JPEG

実機・実ブラウザーで未確認の項目をCI成功だけで「確認済み」と扱わない。

## 18. v0.9.0 acceptance criteria

- UI / app.config / APP_SPEC / READMEのversionが0.9.0で一致する。
- 機能凍結状態である。
- 部分失敗時に正常画像を保持する。
- 失敗画像filenameを分離表示する。
- Resetで失敗一覧をclearする。
- JA / ENで失敗一覧title / reasonを表示する。
- `scripts/check-photo-collage-rc.cjs` がrepositoryに存在する。
- Standalone CIがRC regressionを実行する。
- READMEがfinished-app shapeになっている。
- v1.0.0最終パスでactual screenshot（JA / EN / desktop / smartphone）を正式アセットへ更新する。
- READMEにPrivacy / Limitations / Single HTML / Offlineを記載する。
- SECURITY.mdがPhoto Collageのtrust boundaryを説明する。
- THIRD_PARTY_NOTICES.mdが現状third-party libraryなしを説明する。
- faviconとheader app iconは同一canonical SVG。
- readable / self-extract build contractを維持する。
- Runtime CSP `connect-src 'none'` を維持する。


## 19. v1.0.0 final release contract

v1.0.0では機能追加を行わず、v0.9.0 Release Candidateを正式版として固定する。

### Final release scope

正式版に含める機能:

- JPEG / PNG / WebP入力
- 2〜20枚
- 写真の縦横比を使った自動レイアウト候補
- 「別の配置を見る」による追加候補
- PC Drag & Drop / touch drag handle / arrow button並べ替え
- crop / zoom / Fill / Fit / 主役写真
- 4:3 default canvas
- 1:1 / 4:5 / 9:16 / 16:9 / 3:2 / 4:3 / custom ratio
- gap / outer margin / background / PNG transparency / rounded corners
- JPEG / PNG / WebP export
- 1080 / 2160 / 4096 / custom resolution
- 50-step Undo / Redo
- smartphone 4-page workflow
- JA / EN
- fully local processing
- readable single HTML / self-extract single HTML

### Final documentation

README / README.jaは `html-pdf-organizer` の完成アプリREADME構成を参考にし、少なくとも以下を含める。

1. badges
2. language switch
3. purpose
4. live demo
5. representative screenshot
6. features
7. quick start
8. usage
9. keyboard shortcuts
10. GitHub Pages publication
11. development / build layout
12. privacy / runtime network protection
13. limitations
14. dependencies
15. contributing
16. license

説明はPhoto Collageの実装事実に限定する。

### Final screenshots

正式アセット:

- `assets/screenshot.png` — 日本語 desktop
- `assets/screenshot-en.png` — English desktop
- `assets/screenshot-mobile.png` — 日本語 smartphone
- `assets/screenshot-mobile-en.png` — English smartphone

スクリーンショットはv1.0.0生成物または同一コードstateのPreviewから取得する。

### Final verification

自動release regressionに加え、生成済みstandalone HTMLで少なくとも以下を確認する。

- 2 / 3 / 4 / 5 / 8 / 12 / 20 photo layout generation
- landscape / portrait / mixed / square / panorama / extreme portrait
- corrupt mixed batch
- More layouts
- reorder / Undo / Redo / Reset
- crop / zoom / Fill / Fit / hero
- JA / EN
- desktop / smartphone
- JPEG / PNG / transparent PNG / WebP / custom resolution
- output filename
- readable standalone
- self-extract expansion
- no external runtime src / href
- CSP `connect-src 'none'`
- favicon / header icon canonical SVG

CI成功だけで実機stressや制限付き環境の `file://` browser smokeを確認済みとは扱わない。

## 20. v1.0.0 acceptance criteria

- app.config / UI / APP_SPEC / README / README.ja / CHANGELOGの正式版記述が1.0.0で整合する。
- release regressionがCIで実行される。
- deploy workflowでもrelease regressionを実行する。
- README / README.jaがfinished-app READMEとして完成する。
- READMEにlive demo / screenshot / quick start / usage / keyboard / privacy / limitations / build / licenseを含む。
- JA / EN desktop / smartphone screenshotの4アセットが揃う。
- canonical faviconとheader iconが同一SVG。
- readable `dist/index.html` を生成できる。
- self-extract `dist/index.self-extract.html` を生成できる。
- repository root `photo-collage.html` を生成できる。
- Runtime CSP `connect-src 'none'`。
- runtime external CDN / font / analytics / telemetry / API requestなし。
- no unresolved build placeholder。
- CI green。

## 21. Safe photo import lifecycle

- Each import owns its staged photos, decode generation, failures, and progress. A newer nonempty selection supersedes only the pending batch, not the committed collage.
- A native localized Cancel import button is available during loading. Cancellation immediately returns to the existing collage (or empty/error state), leaves edits and Undo/Redo unchanged, and restores focus from Cancel to the visible photo picker. Browser decoders already running may finish later, but cannot publish results or start the next file.
- Completed staged thumbnail URLs are released immediately on cancellation/supersession and on every stale exit. Current photos and Undo/Redo-owned thumbnail URLs are never released by a cancelled batch.
- Commit successful photos together after the active batch settles; clear previous export details only if photos actually change. Partial failures retain valid photos. All-failed imports retain the previous collage, history, and export details.
- Display failed filenames as text outside the hidden ready area. With no valid photos, use the error phase so mobile users can see both the failure list and retry instructions. Export stays disabled until at least two photos are ready and while an import runs.
- Clear the picker value when a selection is captured so the same file can be retried. Reset, Undo/Redo, and pagehide invalidate pending imports. A persisted pagehide restores the cancelled UI and retains committed resources for back-forward cache restoration; a final pagehide releases all session resources. Do not accept imports during export.
- Run `scripts/check-photo-collage-import.cjs` through the stable release regression: deferred decode/error/encode races, cancellation/restart, atomic history, URL cleanup, all-failed and partial batches, hostile filenames, capacity, JA/EN and keyboard focus contracts.

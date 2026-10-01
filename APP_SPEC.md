# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `0.8.1`
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

### v0.9.0 — Release Candidate

- 機能凍結
- PC / smartphone / JA / EN回帰
- README / screenshots / favicon
- standalone / self-extract / CSP / network確認

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

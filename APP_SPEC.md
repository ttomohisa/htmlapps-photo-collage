# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `0.5.0`
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
- 4:3
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

## 15. v0.5.0 implementation contract

v0.5.0では、現在のプレビュー・写真編集・仕上げ設定を元画像へ適用し、実用解像度の1枚画像として端末へ保存できるようにする。

### Export formats

正式対応:

- JPEG
- PNG
- WebP

JPEGを初期値とする。

WebPはブラウザーのCanvas encode対応をfeature detectionし、未対応ブラウザーでは選択不可とする。

透明背景はPNGのみ正式対応する。JPEG / WebP選択時はtransparent backgroundを無効化し、現在の背景色でflattenする。

### Resolution

長辺プリセット:

- 1080px
- 2160px
- 4096px
- custom

初期値は2160px。

customは256〜8192pxの範囲で指定する。

安全上限:

- 最大辺 8192px
- 最大総画素数 32,000,000px

aspect ratioと整数丸めを反映した最終width × heightでも32MPを超えないこと。境界では計算上の理論値だけでなく、丸め後の実画素数を再検証して長辺を縮小する。

### High-resolution rendering

プレビューの縮小サムネイルを高解像度保存へ流用しない。

保存開始時に以下をsnapshotする。

- photo order
- File references
- crop x / y
- zoom
- Fill / Fit
- hero-derived selected layout cells
- canvas aspect ratio
- gap
- outer margin
- corner radius
- background / transparency
- format / quality
- output dimensions
- filename

保存処理中にUI設定が変更されても、実行中の1回のexport内容は変化しない。

元画像は1枚ずつObject URLからdecodeし、Canvasへ描画後にURLをrevokeする。20枚の元画像を同時decodeしたまま保持しない。

### Preview / export consistency

gap / outer margin / corner radiusはv0.4.0と同じshort-side 900基準のdesign unitを使用し、高解像度Canvasの短辺へscaleする。

crop x / yは0〜1正規化値を利用するため、previewとexportの解像度差に依存しない。

Fill / Fit / zoom / background / transparency / rounded cornersはpreviewと同じ描画関数を使用する。

選択写真を示す編集用outlineはexport画像へ描画しない。

### Quality

JPEG / WebP:

- 10〜100
- 初期値90
- Canvas encode時は0.10〜1.00へ変換

PNGではquality UIを無効化し、可逆PNG encodeとする。

### Filename

保存前にbase filenameを編集できる。

- 初期値: `photo-collage`
- Windows等で無効な文字を `-` へ置換
- control characters除去
- 末尾のdot / space除去
- JPEG / PNG / WebP拡張子が入力されていた場合はbase nameから除去
- Windows reserved nameは安全な名前へ変換
- 空文字等は `photo-collage` へfallback
- 選択形式に応じて `.jpg` / `.png` / `.webp` を自動付与

### Metadata

出力画像はCanvasから新規encodeする。

元画像のEXIF / GPS / camera metadataをコピーする処理は行わない。

### Export state

保存中は少なくとも以下を表示する。

- 現在処理中の写真番号 / 総枚数
- encode中状態

多重exportを防止する。

成功時はwidth × height / format / file sizeを表示する。

失敗時は無反応にせず、解像度を下げて再試行できる文言を表示する。

### Memory release

encode完了後は一時export Canvasを1×1へ縮小して描画bufferを解放可能な状態にする。

download用Blob URLは利用後にrevokeする。

## 16. v0.5.0 acceptance criteria

- JPEG / PNG / WebPを選択できる。
- WebP未対応ブラウザーではWebPを無効化する。
- JPEGを初期形式とする。
- PNGのみtransparent backgroundを利用できる。
- JPEG / WebPへ切り替えるとtransparent backgroundを無効化する。
- 長辺1080 / 2160 / 4096pxを選択できる。
- custom長辺を256〜8192pxで指定できる。
- 最終width / heightのどちらも8192pxを超えない。
- 最終総画素数が32,000,000pxを超えない。
- 1:1 / 4:5 / 9:16 / 16:9 / 3:2 / 4:3 / 1:10 / 10:1で安全上限計算が成立する。
- プレビュー用thumbnailではなく元Fileからexportする。
- 元画像を1枚ずつ逐次decodeする。
- 保存開始時の設定snapshotを利用する。
- crop / zoom / Fill / Fitを高解像度出力へ反映する。
- gap / outer margin / background / transparency / corner radiusを出力へ反映する。
- 編集中の選択outlineを出力へ含めない。
- JPEG / WebPのqualityを10〜100で指定できる。
- PNGではquality controlを無効化する。
- output filenameを保存前に編集できる。
- 無効ファイル名文字をsanitizeする。
- 入力された既知画像拡張子をbase filenameから除去する。
- 拡張子をformatから自動付与する。
- Canvas re-encodeにより元写真metadataをコピーしない。
- export中の多重実行を防止する。
- export progressを表示する。
- 成功時にdimensions / format / file sizeを表示する。
- failure時に解像度を下げる案内を表示する。
- download Blob URLをrevokeする。
- export Canvasを完了後に縮小してmemory release可能な状態にする。
- Runtime CSPの `connect-src 'none'` を維持する。
- `__APP_ICON_DATA_URI__` はfaviconとheader iconの2箇所のみ。
- `APP:BEGIN` / `APP:END`, `APP:HELP:BEGIN` / `APP:HELP:END` を維持する。
- テンプレートの `StandaloneAssets` API、`window.AppToast`、`outputFilename` 契約を維持する。

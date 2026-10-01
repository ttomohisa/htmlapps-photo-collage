# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `0.4.0`
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

## 15. v0.4.0 implementation contract

v0.4.0では、写真ごとの編集に加えて、完成画像全体の比率と仕上げを調整できるようにする。

### Canvas ratio

正式プリセット:

- 1:1
- 4:5
- 9:16
- 16:9
- 3:2
- 4:3
- custom

customは幅 / 高さを1〜10の整数で指定する。内部では `canvasAspect = width / height` として保持する。

比率変更時は単純にCanvasを伸縮するだけではなく、レイアウト候補のcrop loss評価にも実際のcanvas aspect ratioを反映し、候補を再生成する。

### Finish parameters

仕上げ値は将来の高解像度書き出しでも再利用できるよう、プレビュー解像度へ直接固定した値ではなく、短辺900を基準としたdesign unitとして保持する。

- gap: 0〜40
- outer margin: 0〜60
- corner radius: 0〜60
- background: 6桁hex color
- transparent background: boolean

プレビュー時はcanvas短辺に応じてdesign unitをscaleする。

### Background / transparency

通常は背景色でCanvas全体を塗る。

transparent background有効時はCanvasをclearしたまま写真のみ描画する。プレビューの透明部分はcheckerboardで識別できる。

透明背景はv0.5.0のPNG書き出しで利用する。JPEGではv0.5.0実装時に無効化する。

### Rounded corners

角丸は各写真セルのclipへ適用する。

ブラウザ固有の `CanvasRenderingContext2D.roundRect()` へ依存せず、pathを自前構築して対象ブラウザで一貫して動作させる。

### Fit behavior

Fit時に画像外側へ余白ができる場合、通常背景では現在のCanvas背景色が見える。transparent backgroundでは透明になる。

### Layout candidate scoring

実際のセルaspect ratioは、

`canvasAspect * normalizedCellWidth / normalizedCellHeight`

として計算し、crop loss / extreme cell penaltyへ利用する。

v0.4.0では最終画像exportはまだ提供しない。v0.5.0でこの同じ描画パラメータを高解像度Canvasへ適用する。

## 16. v0.4.0 acceptance criteria

- 1:1 / 4:5 / 9:16 / 16:9 / 3:2 / 4:3へ切り替えられる。
- custom比率を1〜10 : 1〜10で指定できる。
- 比率変更時にCanvas dimensionsが実際の比率へ変わる。
- 比率変更時にlayout scoreがcanvas aspect ratioを利用する。
- 比率変更時に候補を再生成する。
- 写真間隔を0〜40で変更できる。
- 外側余白を0〜60で変更できる。
- 写真角丸を0〜60で変更できる。
- 背景色をcolor pickerまたは6桁hexで変更できる。
- 不正なhex入力は現在値へ戻す。
- transparent backgroundを切り替えられる。
- transparent background時はCanvas alphaを保持する。
- 透明部分はcheckerboard previewで視認できる。
- Fit時の余白は現在のbackground / transparencyを反映する。
- 角丸は写真ごとのCanvas clipへ反映する。
- 選択写真のoutlineは角丸形状に沿う。
- 1:10 / 10:1相当のcustom極端比率でも描画ロジックが破綻しない。
- JA / EN双方でfinish UIが成立する。
- 360px幅ではratio / finish controlsが1列または3列へ縮退し、横スクロールしない。
- Runtime CSPの `connect-src 'none'` を維持する。
- `__APP_ICON_DATA_URI__` はfaviconとheader iconの2箇所のみ。
- `APP:BEGIN` / `APP:END`, `APP:HELP:BEGIN` / `APP:HELP:END` を維持する。
- テンプレートの `StandaloneAssets` API、`window.AppToast`、将来export向け `outputFilename` 契約を維持する。

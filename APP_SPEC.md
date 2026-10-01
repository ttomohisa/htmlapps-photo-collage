# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `0.3.0`
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

## 15. v0.3.0 implementation contract

v0.3.0では、自動レイアウトを「選ぶ」だけでなく、写真単位で見せ方を調整できる編集フローへ進める。

### Reorder

- 写真カードはPCでDrag & Dropにより並べ替えできる。
- タッチ環境やキーボード利用者のため、各写真に前 / 後へ移動する操作も用意する。
- 並べ替え後は写真順を保持したままレイアウト候補を再生成する。

### Photo selection

- 写真カードまたはCanvas内のセルを選択できる。
- 選択写真は写真一覧とCanvasの両方で視覚的に識別できる。
- 選択状態は色だけに依存せず、枠でも示す。

### Crop / Zoom

- Fill時はCanvas上で写真をドラッグし、正規化された `cropX / cropY` を更新する。
- crop位置はレイアウト変更後も維持する。
- Zoomは1.0〜3.0倍。
- Fitでは写真全体をセル内へ表示し、Zoom操作は無効化する。
- Preview操作には縮小サムネイルを使い、元画像を操作のたびに再decodeしない。

### Hero photo

- 主役写真は最大1枚。
- 「この写真を大きく」で指定し、「通常サイズに戻す」で解除する。
- 主役写真を含む単独セルはレイアウト生成時に面積を広げる方向へ重み付けする。
- 候補scoreでも主役写真の面積が小さい配置を減点する。

### Delete Undo

- 写真削除は確認ダイアログを出さず即時実行する。
- テンプレート標準 `AppToast` のUndoで復元できる。
- 復元時は元の位置へ戻し、その写真を選択する。

v0.3.0では余白・背景・角丸・キャンバス比率はまだ変更しない。これらはv0.4.0で追加する。最終画像exportはv0.5.0まで提供しない。

## 16. v0.3.0 acceptance criteria

- 写真カードを選択できる。
- Canvas内の写真をタップ / クリックして選択できる。
- PCでは写真カードのDrag & Dropで並べ替えできる。
- 前 / 後へ移動ボタンによりタッチ環境でも並べ替えできる。
- 並べ替え後に自動レイアウト候補を再生成する。
- Fill / Fitを写真ごとに切り替えられる。
- Fill時はCanvas上のPointer dragでcrop位置を変更できる。
- crop位置は0〜1の正規化座標として保持する。
- Zoomを1〜3倍で変更できる。
- Fit時はZoom操作を無効化する。
- 主役写真は最大1枚。
- 主役指定時に主役写真を大きくする候補を優先する。
- 主役指定の解除ができる。
- 写真削除直後にUndoできる。
- Undoすると元の並び位置へ戻る。
- Previewはサムネイルを利用して編集操作中の元画像再decodeを避ける。
- stale preview renderをgeneration tokenで破棄する。
- JA / EN双方で編集UIが成立する。
- 360px幅で調整UIが横にはみ出さない。
- Runtime CSPの `connect-src 'none'` を維持する。
- `__APP_ICON_DATA_URI__` はfaviconとheader iconの2箇所のみ。
- `APP:BEGIN` / `APP:END`, `APP:HELP:BEGIN` / `APP:HELP:END` を維持する。
- テンプレートの `StandaloneAssets` API、`window.AppToast`、将来export向け `outputFilename` 契約を維持する。

# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `0.6.0`
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

## 15. v0.6.0 implementation contract

v0.6.0ではスマートフォンをPC版の単純縦積みとして扱わず、テンプレート現行 `components/mobile-bottom-bar.html` のpage-tab patternを採用する。

### Smartphone pages

スマートフォンでは以下の4ページへ分ける。

- 写真
- 配置
- 仕上げ
- 保存

Desktopでは4ページを通常のdocument flowとしてすべて表示し、既存の編集フローを維持する。

### Mobile bottom bar

テンプレートの `AppMobileBottomBar.mount()` patternをcopy / adaptして利用する。

- 4項目固定
- safe-area bottomを考慮
- 54px以上のtap target
- active pageを `aria-current="page"` で示す
- page切替時はworkspace上端へscrollする
- `prefers-reduced-motion` 時はsmooth scrollを使わない

通常portrait smartphoneは `max-width: 600px` を対象とする。

横向きスマートフォンも対象にするため、`max-height: 520px and pointer: coarse` もmobile workflowへ含める。

### Availability

写真ページは常に利用可能。

配置 / 仕上げ / 保存は写真が2枚以上のときだけ有効にする。

写真削除等により2枚未満へ戻った場合、他ページを表示したまま操作不能にせず自動的に写真ページへ戻す。

### Page contents

写真:

- 写真追加
- 写真一覧
- 並べ替え
- 削除
- Undo導線

配置:

- main preview
- 写真選択
- crop / zoom
- Fill / Fit
- 主役写真
- 自動レイアウト候補

仕上げ:

- compact preview
- ratio
- gap
- outer margin
- background / transparency
- rounded corners

保存:

- compact preview
- JPEG / PNG / WebP
- resolution
- quality
- filename
- export progress / result

### Compact preview

仕上げ / 保存ページには確認用preview Canvasを表示する。

main previewの編集用選択outlineはcompact previewへ含めない。

そのためmain previewを各写真まで描画した時点でcompact previewへcopyし、その後main previewだけへ選択outlineを描く。

compact previewは別途写真をdecodeしない。

### Empty / loading

写真0枚のmobile写真ページでは、写真追加panelだけを主表示とし、同内容の空状態panelを重複表示しない。

Loading / partial failure / errorは既存statusを保持する。

### Fixed UI

bottom barの高さとsafe-area分をbody paddingへ確保する。

Toastはbottom barより上へ表示し、重ならない。

dialogは従来どおりviewport / safe-area内へ収める。

### Mobile preview size

main previewはmobile viewportで最大約40vhを目安とし、編集controlが画面下へ追い出されすぎないようにする。

仕上げ / 保存のcompact previewは最大約33vhとする。

## 16. v0.6.0 acceptance criteria

- 現行templateのmobile-bottom-bar patternを使用する。
- smartphoneで写真 / 配置 / 仕上げ / 保存の4ページへ切り替えられる。
- Desktopでは4ページがすべて通常flowで表示される。
- 写真2枚未満では配置 / 仕上げ / 保存がdisabled。
- 2枚以上になると3ページがenabled。
- 2枚未満へ戻った場合は写真ページへ戻る。
- portrait 600px以下でbottom barを表示する。
- coarse pointerの低height landscape smartphoneでもbottom barを表示する。
- safe-area inset bottomをbottom bar paddingへ反映する。
- body bottom paddingにbottom bar + safe-areaを確保する。
- Toastがbottom barと重ならない。
- active tabは色だけでなく `aria-current="page"` を持つ。
- tab tap targetは54px以上。
- page切替時にworkspace付近へscrollする。
- reduced motion時はsmooth scrollを無効化する。
- 写真0枚時にmobileで不要なempty cardを重複表示しない。
- 仕上げ / 保存にcompact previewを表示する。
- compact previewへ選択中outlineを含めない。
- compact previewのために写真を再decodeしない。
- main previewはmobileで最大40vh程度に収める。
- compact previewは最大33vh程度に収める。
- 360px幅でhorizontal scrollを発生させない。
- 長いfilenameがphoto cardからはみ出さない。
- Runtime CSPの `connect-src 'none'` を維持する。
- `__APP_ICON_DATA_URI__` はfaviconとheader iconの2箇所のみ。
- `APP:BEGIN` / `APP:END`, `APP:HELP:BEGIN` / `APP:HELP:END` を維持する。
- `StandaloneAssets`, `window.AppToast`, `outputFilename` 契約を維持する。

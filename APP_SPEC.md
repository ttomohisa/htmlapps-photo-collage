# Photo Collage / 写真コラージュ — APP_SPEC

## 1. Product identity

- **Name:** Photo Collage / 写真コラージュ
- **Slug:** `photo-collage`
- **Repository:** `ttomohisa/htmlapps-photo-collage`
- **Current development version:** `0.7.0`
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

## 15. v0.7.0 implementation contract

v0.7.0では、編集操作を安全に試せるようUndo / Redoを正式実装し、キーボード操作とReset確認を整える。

### History model

最大50操作を保持する。

履歴snapshotは写真バイナリを複製しない。各写真について既存の `File` referenceとthumbnail URLを保持し、以下の編集値を複製する。

- photo order
- crop x / y
- zoom
- Fill / Fit
- hero
- selected layout
- canvas ratio / custom ratio
- gap
- outer margin
- background / transparency
- corner radius
- export format / resolution / quality
- output filename

写真選択そのもの、言語切替、mobile page切替はUndo対象にしない。

### History behavior

操作前snapshotをUndo stackへ保存し、Undo実行時は現在snapshotをRedo stackへ移して直前状態を復元する。

新しい編集を行った場合はRedo stackを破棄する。

履歴復元時はderived stateであるlayout candidatesを再生成し、previewも再描画する。

### Continuous controls

pointer dragやrange inputを1px / 1tickごとに履歴化しない。

以下は操作開始前から操作終了までを1履歴とする。

- crop pointer drag
- zoom
- gap
- outer margin
- corner radius
- JPEG / WebP quality
- color picker
- filename edit

keyboardでrangeを1step変更した場合は1stepを1履歴としてよい。

### Photo operations

以下をUndo / Redo可能にする。

- photo add
- photo remove
- reorder buttons
- Drag & Drop reorder

削除直後のToast Undoはhistory engineと同じUndo処理を利用する。

Toast表示後に別の編集が行われた場合、古い削除Toastが後の別操作をUndoしないようhistory revisionを確認する。

### Reset

「最初から」は即実行しない。

確認dialogを表示し、以下を初期値へ戻す。

- photos
- photo edits
- selected layout
- canvas ratio / finish
- export settings
- output filename

Reset自体も1履歴として記録し、Reset後にUndoすれば直前の作業状態へ戻せる。

Reset dialogはEscapeで閉じられ、Cancel / close buttonを持つ。

### Keyboard shortcuts

document-level:

- Ctrl / Cmd + Z: Undo
- Ctrl / Cmd + Shift + Z: Redo
- Ctrl / Cmd + Y: Redo

input / textarea / select / contenteditableにfocusがある場合、アプリ側shortcutでブラウザー標準のtext editing Undoを奪わない。

### Canvas keyboard adjustment

main preview Canvasをkeyboard focus可能にする。

Fillの選択写真について:

- Arrow Left / Right / Up / Down: position adjustment
- Shift + Arrow: larger step

各keyboard adjustmentはUndo可能。

Canvasにはaccessible nameを与え、focus-visibleを維持する。

### Focus / accessibility

- Undo / Redo / Resetはbutton disabled stateを正しく反映する。
- Undo / Redo buttonに `aria-keyshortcuts` を付与する。
- Reset dialogは `aria-labelledby` / `aria-describedby` を持つ。
- Reset dialog終了後はhistory toolbarへfocusを戻す。
- 写真削除後は可能なら次の写真cardへfocusを移す。
- 既存 `aria-live` / visible focus / reduced motionを維持する。
- 色だけでactive / selectedを表現しない。

### Thumbnail lifetime

Undo / Redoで削除写真を復元できるよう、thumbnail Object URLを写真削除時に即revokeしない。

session内で生成したthumbnail URLをSetで追跡し、pagehide時にまとめてrevokeする。

## 16. v0.7.0 acceptance criteria

- Undo historyは最大50件。
- 51件目以降は最古履歴を破棄する。
- Redo historyも最大50件。
- 新規編集後にRedo historyを破棄する。
- 写真追加をUndo / Redoできる。
- 写真削除をUndo / Redoできる。
- 写真並べ替えをUndo / Redoできる。
- layout選択をUndo / Redoできる。
- crop dragを1drag = 1履歴でUndo / Redoできる。
- zoom sliderを1drag = 1履歴で扱う。
- gap / outer margin / corner radiusを各1drag = 1履歴で扱う。
- Fill / FitをUndo / Redoできる。
- hero指定をUndo / Redoできる。
- canvas ratio / custom ratioをUndo / Redoできる。
- background / transparencyをUndo / Redoできる。
- export format / resolution / qualityをUndo / Redoできる。
- filename editをUndo / Redoできる。
- Ctrl / Cmd + ZがUndoとして動作する。
- Ctrl / Cmd + Shift + ZがRedoとして動作する。
- Ctrl / Cmd + YがRedoとして動作する。
- text input focus中はglobal Undo shortcutを奪わない。
- Resetは確認dialogを表示する。
- Reset後にUndoすると直前状態へ戻る。
- main Canvasをkeyboard focusできる。
- Fill写真を矢印キーでposition調整できる。
- Shift + Arrowで大きくposition調整できる。
- keyboard position調整をUndoできる。
- Undo / Redo / Resetのdisabled stateが現在履歴と一致する。
- 写真削除後に可能なら残存photo cardへfocusを移す。
- Reset dialogにlabel / descriptionがある。
- thumbnail URLを削除時に即revokeしない。
- thumbnail URLをpagehideでrevokeする。
- Runtime CSPの `connect-src 'none'` を維持する。
- `__APP_ICON_DATA_URI__` はfaviconとheader iconの2箇所のみ。
- `APP:BEGIN` / `APP:END`, `APP:HELP:BEGIN` / `APP:HELP:END` を維持する。
- `StandaloneAssets`, `window.AppToast`, `AppMobileBottomBar`, `outputFilename` 契約を維持する。

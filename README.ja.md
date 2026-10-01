# Photo Collage / 写真コラージュ

2〜20枚の写真をブラウザー内で読み込み、写真に合った配置候補から選んで1枚のコラージュ画像として保存するBrowser Kitty向けツールです。

![Photo Collage / 写真コラージュ](assets/screenshot.png)

## Features

- JPEG / PNG / WebP入力
- 写真に合わせた自動レイアウト候補と追加候補ページ
- PCのDrag & Drop / タッチ向け写真並べ替え
- crop位置 / 1〜3倍zoom / Fill / Fit / 主役写真
- 初期値4:3、1:1 / 4:5 / 9:16 / 16:9 / 3:2 / custom比率
- 写真間隔 / 外周余白 / 背景色 / PNG透明背景 / 角丸
- 元写真からJPEG / PNG / WebPへ高解像度書き出し
- 長辺1080 / 2160 / 4096px / custom解像度
- 最大50操作のUndo / Redo
- スマホ4画面: 写真 / 配置 / 仕上げ / 保存
- 日本語 / English
- 読み込めなかった写真をfilename付きで分離し、正常画像は保持
- 実行時外部通信なし

## 使い方

1. JPEG / PNG / WebP写真を2〜20枚追加します。
2. 「おすすめの配置」から選びます。追加候補がある場合は「別の配置を見る」で切り替えます。
3. 必要なら写真を並べ替え、crop位置・zoom・Fill / Fit・主役写真を調整します。
4. キャンバス比率、写真間隔、外周余白、背景、透明背景、角丸を調整します。
5. JPEG / PNG / WebP、解像度、画質、ファイル名を選び、「画像を保存」を押します。

キャンバス比率の初期値は **4:3** です。

## Privacy / ローカル処理

選択した写真はブラウザー内で処理します。このアプリから写真を外部サーバーへアップロードしません。Analytics / Telemetry / 外部API / runtime CDN / remote fontも使用しません。

Runtime CSPは `connect-src 'none'` を維持します。

出力画像はCanvasから新しくエンコードします。元写真のEXIF、GPS、カメラ情報、元ファイル名を意図的に出力へコピーする処理はありません。ただし、一般的な「メタデータ完全除去ツール」として保証するものではありません。

写真と編集状態は現在のページセッション内だけで保持します。再読み込みやタブを閉じると現在の作業内容は失われます。

## 対応ブラウザー / 端末

Current stable Chrome / Edge / Firefox / Safari / iOS Safari / Android Chromeを対象とします。

PCとスマートフォンの両方を対象にし、スマホでは「写真 / 配置 / 仕上げ / 保存」の下部固定4画面で操作します。

## 制限

- 1コラージュ2〜20枚。
- HEIC / HEIFはv1.0.0正式対応外。
- テキスト、ステッカー、フィルター、背景除去、完全自由配置、自由角度回転、クラウド保存は対象外。
- custom比率は1:10〜10:1。
- 書き出しは最大辺8192px / 最大32MP。
- 非常に大きい元写真はブラウザーや端末の画像処理メモリ上限へ達する場合があります。写真は逐次処理し、resource不足を検出した場合は回復案内を表示します。
- WebP書き出しはブラウザーのCanvas WebP encode対応時のみ利用できます。

## Single HTML / Offline

buildでは以下を生成します。

- `dist/index.html` — 読みやすい自己完結HTML
- `dist/index.self-extract.html` — gzip自己展開型単一HTML
- `photo-collage.html` — repository rootの読みやすいcopy

配布版は `file://` 直開きを対象とします。アプリ実行時にネットワーク接続を必要としません。

## Development / Verification

`ttomohisa/htmlapps-template` に準拠します。

```powershell
node .\scripts\check-photo-collage-rc.cjs
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

RC regressionでは、layout生成、extreme aspect、file type fallback、export画素上限、並べ替え、Undo / Redo、日英translation key一致、CSP、template契約を確認します。v1.0.0前には実ブラウザー / 実端末のsmoke testも別途必要です。

## License / Third-party notices

MIT License。詳細は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。

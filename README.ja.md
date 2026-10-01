# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.6.0** です。スマートフォンではPC版をそのまま縦積みせず、下部固定バーから「写真 / 配置 / 仕上げ / 保存」の4画面へ切り替える構成にしました。

## Features

- JPEG / PNG / WebP入力・書き出し
- 2〜20枚の写真
- 写真に合わせた自動レイアウト候補
- 並べ替え / crop / zoom / Fill / Fit / 主役写真
- 比率 / 写真間隔 / 外周余白 / 背景 / 透明背景 / 角丸
- 元写真からの高解像度書き出し
- 1080 / 2160 / 4096px / カスタム解像度
- 出力ファイル名編集・sanitize
- スマホ4画面: 写真 / 配置 / 仕上げ / 保存
- テンプレート準拠の下部固定ナビゲーション
- safe-areaとToast重なりを考慮
- 仕上げ / 保存画面の確認用コンパクトプレビュー
- 縦向きと横向きスマートフォンを考慮
- 日本語 / English
- Runtime network accessなし

## スマートフォンでの使い方

下部バーから画面を切り替えます。

1. **写真** — 写真の追加、確認、並べ替え、削除。
2. **配置** — レイアウト選択と各写真の位置・拡大調整。
3. **仕上げ** — 比率、余白、背景、透明背景、角丸。
4. **保存** — 形式、解像度、画質、ファイル名を選んで保存。

写真が2枚になるまでは「配置 / 仕上げ / 保存」は無効です。

PCでは従来どおり全編集項目を通常のページ内flowで表示します。

## Privacy

写真はブラウザー内で処理し、このアプリから外部サーバーへ送信しません。出力画像はCanvasから新しくエンコードし、元写真のEXIF / GPSをコピーしません。

## Browser support

Current stable Chrome / Edge / Firefox / Safari、および主要なモバイルブラウザーを対象とします。配布用HTMLの `file://` 直開きも対象です。

## Development

このリポジトリは `ttomohisa/htmlapps-template` を基盤とします。スマートフォンナビゲーションは現行templateの `components/mobile-bottom-bar.html` patternをcopy / adaptしています。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License

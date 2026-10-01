# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.5.0** です。写真の追加・自動レイアウト・写真調整・仕上げに加えて、元写真から高解像度のJPEG / PNG / WebPを書き出せるようになりました。

## Features

- JPEG / PNG / WebP入力
- 2〜20枚の写真
- 複数選択 / Drag & Drop
- 写真に合わせた自動レイアウト候補
- 並べ替え / crop位置 / zoom / Fill / Fit / 主役写真
- 1:1 / 4:5 / 9:16 / 16:9 / 3:2 / 4:3 / カスタム比率
- 写真間隔 / 外周余白 / 背景 / 透明背景 / 角丸
- JPEG / PNG / WebP書き出し
- JPEG / WebP画質 10〜100
- 長辺1080 / 2160 / 4096px / カスタム
- 最大辺8192px / 最大32MP
- 出力ファイル名編集・sanitize
- 元写真を1枚ずつ読み込む高解像度レンダリング
- 書き出し進捗・完了情報
- 元写真のEXIF / GPS等を出力画像へコピーしない
- 日本語 / English
- Runtime network accessなし

## 使い方

1. 2枚以上の写真を追加します。
2. おすすめの配置を選びます。
3. 必要に応じて写真とキャンバスを調整します。
4. JPEG / PNG / WebPから保存形式を選びます。
5. 解像度と画質を選びます。
6. 必要ならファイル名を変更します。
7. 「画像を保存」を押します。

透明背景はPNGで利用できます。

## Privacy

読み込んだ写真はブラウザー内で処理し、このアプリから外部サーバーへ送信しません。

出力画像はCanvasから新しくエンコードします。元写真のEXIF、GPS、カメラ情報、元ファイル名を出力画像へコピーする処理は行いません。

写真はブラウザーへ自動保存しません。ページを再読み込みすると現在の作業内容は失われます。

## Browser support

Current stable Chrome / Edge / Firefox / Safari、および主要なモバイルブラウザーを対象とします。WebP書き出しはブラウザーが対応している場合のみ有効になります。配布用HTMLは `file://` からの直接起動も対象です。

## Export limits

- 最大辺: 8192px
- 最大総画素数: 32MP
- JPEG / WebP画質: 10〜100
- PNG透明背景: 対応

## Development

このリポジトリは `ttomohisa/htmlapps-template` を基盤とし、`AGENTS.md` と `APP_SPEC.md` を実装契約として使用します。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License

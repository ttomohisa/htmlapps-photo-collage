# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.4.0** です。写真に合ったレイアウトや写真ごとの調整に加えて、キャンバス比率・余白・背景・透明背景・角丸まで整えられます。

## Features

- JPEG / PNG / WebP
- 2〜20枚の写真
- 複数選択 / Drag & Drop入力
- 写真に合わせた自動レイアウト候補
- Drag & Dropまたは移動ボタンによる並べ替え
- Preview上のドラッグによるcrop位置調整
- 1〜3倍のZoom
- 枠いっぱい / 全体を表示
- 1枚の主役写真を大きくする配置
- 写真削除後のUndo
- 1:1 / 4:5 / 9:16 / 16:9 / 3:2 / 4:3 / カスタム比率
- 写真間隔 / 外周余白
- 背景色 / 透明背景プレビュー
- 写真ごとの角丸
- 日本語 / English
- PC / スマートフォン対応
- Runtime network accessなし

## 使い方

1. 2枚以上の写真を追加します。
2. おすすめの配置からレイアウトを選びます。
3. 必要に応じて各写真の位置・拡大・表示方法を調整します。
4. キャンバス比率を選びます。
5. 写真間隔、外側の余白、背景、透明背景、角丸を調整します。
6. 必要なら写真の並べ替えや「この写真を大きく」を使います。

v0.4.0では最終画像の保存機能はまだ提供しません。透明背景はv0.5.0のPNG書き出しで利用する予定です。

## Privacy

読み込んだ写真はブラウザー内で処理します。このアプリから写真を外部サーバーへ送信しません。

写真はブラウザーへ自動保存しません。ページを再読み込みすると現在の作業内容は失われます。

## Browser support

Current stable Chrome / Edge / Firefox / Safari、および主要なモバイルブラウザーを対象とします。配布用HTMLは `file://` からの直接起動も対象です。

## Limitations

v0.4.0では以下は未実装です。

- JPEG / PNG / WebP書き出し
- 出力画質
- 出力解像度プリセット
- 出力ファイル名編集UI

詳細は `APP_SPEC.md` を参照してください。

## Development

このリポジトリは `ttomohisa/htmlapps-template` を基盤とし、`AGENTS.md` と `APP_SPEC.md` を実装契約として使用します。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License

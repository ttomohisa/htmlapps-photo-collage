# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.2.0** です。写真の縦横比を使ってcrop量の少ない配置を評価し、おすすめレイアウト候補を自動生成します。

## Features

- JPEG / PNG / WebP
- 2〜20枚の写真
- 複数選択 / Drag & Drop
- 写真の追加・削除
- サムネイル、ファイル名、pixel dimensions表示
- 破損・非対応画像の部分失敗分離
- 2〜20枚の写真に合わせた自動レイアウト候補
- crop loss / 極端なセル / 面積バランスによる候補評価
- 一度に最大6候補＋「別の配置を見る」
- 日本語 / English
- PC / スマートフォン対応
- Runtime network accessなし

## 使い方

1. 「写真を選択」から複数の写真を追加します。
2. 追加した写真を一覧で確認します。
3. 2枚以上ある場合は、おすすめのレイアウト候補が表示されます。
4. 気に入った配置を選びます。候補が多い場合は「別の配置を見る」で切り替えます。
5. 不要な写真は各カードの削除ボタンから外せます。

v0.2.0では最終画像の保存機能はまだ提供しません。

## Privacy

読み込んだ写真はブラウザー内で処理します。このアプリから写真を外部サーバーへ送信しません。

写真はブラウザーへ自動保存しません。ページを再読み込みすると現在の作業内容は失われます。

## Browser support

Current stable Chrome / Edge / Firefox / Safari、および主要なモバイルブラウザーを対象とします。配布用HTMLは `file://` からの直接起動も対象です。

## Limitations

v0.2.0では以下は未実装です。

- 並べ替え
- crop / zoom
- 主役写真
- 余白 / 背景 / 角丸
- JPEG / PNG / WebP書き出し

詳細は `APP_SPEC.md` を参照してください。

## Development

このリポジトリは `ttomohisa/htmlapps-template` を基盤とし、`AGENTS.md` と `APP_SPEC.md` を実装契約として使用します。

編集対象は `src/index.template.html` です。生成済みの `dist/index.html` やrepository-root HTMLを直接編集しません。

Windowsではテンプレート標準の手順で以下を確認します。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License

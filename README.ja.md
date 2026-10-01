# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.3.0** です。写真に合ったレイアウト候補に加えて、各写真の順番や見せ方をブラウザー内で調整できます。

## Features

- JPEG / PNG / WebP
- 2〜20枚の写真
- 複数選択 / Drag & Drop入力
- 写真に合わせた自動レイアウト候補
- crop loss / 極端なセル / 面積バランス / 主役写真による候補評価
- 写真一覧またはCanvasから写真を選択
- Drag & Dropまたは移動ボタンによる並べ替え
- Preview上のドラッグによるcrop位置調整
- 1〜3倍のZoom
- 枠いっぱい / 全体を表示
- 1枚の主役写真を大きくする配置
- 写真削除後のUndo
- 日本語 / English
- PC / スマートフォン対応
- Runtime network accessなし

## 使い方

1. 2枚以上の写真を追加します。
2. おすすめの配置からレイアウトを選択します。
3. 写真一覧またはプレビューから調整したい写真を選びます。
4. プレビュー上でドラッグして位置を変え、必要に応じて拡大や「枠いっぱい / 全体を表示」を調整します。
5. 1枚を目立たせたい場合は「この写真を大きく」を使います。
6. 写真の順番はDrag & Dropまたは前 / 後への移動ボタンで変更できます。

v0.3.0では最終画像の保存機能はまだ提供しません。

## Privacy

読み込んだ写真はブラウザー内で処理します。このアプリから写真を外部サーバーへ送信しません。

写真はブラウザーへ自動保存しません。ページを再読み込みすると現在の作業内容は失われます。

## Browser support

Current stable Chrome / Edge / Firefox / Safari、および主要なモバイルブラウザーを対象とします。配布用HTMLは `file://` からの直接起動も対象です。

## Limitations

v0.3.0では以下は未実装です。

- キャンバス比率プリセット
- 写真間隔 / 外周余白
- 背景色
- 角丸
- JPEG / PNG / WebP書き出し

詳細は `APP_SPEC.md` を参照してください。

## Development

このリポジトリは `ttomohisa/htmlapps-template` を基盤とし、`AGENTS.md` と `APP_SPEC.md` を実装契約として使用します。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License

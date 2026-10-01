# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.7.0** です。既存のPC / スマートフォン編集フローに、50段階のUndo / Redo、キーボード操作、Reset確認、Accessibility改善を追加しました。

## Features

- JPEG / PNG / WebP入力・書き出し
- 2〜20枚の写真
- 写真に合わせた自動レイアウト候補
- 並べ替え / crop / zoom / Fill / Fit / 主役写真
- 比率 / 写真間隔 / 外周余白 / 背景 / 透明背景 / 角丸
- 元写真からの高解像度書き出し
- スマホ4画面: 写真 / 配置 / 仕上げ / 保存
- 最大50操作のUndo / Redo
- Ctrl / Cmd + Z、Ctrl / Cmd + Shift + Z、Ctrl / Cmd + Y
- cropやslider dragを1操作として履歴化
- Undo可能な確認付きReset
- Preview Canvasからのキーボード位置調整
- accessible name / disabled state / visible focus / dialog label
- 日本語 / English
- Runtime network accessなし

## Undo / Redo

履歴は最大50操作です。履歴ごとに写真バイナリをコピーせず、既存のFile referenceと編集値を保持します。

写真追加・削除・並べ替え、レイアウト選択、写真調整、キャンバス仕上げ、保存設定をUndo / Redoできます。写真選択、言語切替、スマートフォンのページ切替は履歴を消費しません。

cropやsliderを連続してドラッグした場合は、ドラッグ全体を1操作として記録します。

## Keyboard

- **Ctrl / Cmd + Z** — 元に戻す
- **Ctrl / Cmd + Shift + Z** — やり直す
- **Ctrl / Cmd + Y** — やり直す
- **Previewにfocusして矢印キー** — 選択中のFill写真を位置調整
- **Shift + 矢印キー** — 大きく位置調整

text input等を編集中は、アプリ側のUndo / Redo shortcutでブラウザー標準の文字編集Undoを奪いません。

## Reset

「最初から」は確認dialogを表示します。写真と現在の編集設定を初期化しますが、Reset自体も履歴に入るため、直後に「元に戻す」で復元できます。

## Privacy

写真はブラウザー内で処理し、このアプリから外部サーバーへ送信しません。出力画像はCanvasから新しくエンコードし、元写真のEXIF / GPSをコピーしません。

## Browser support

Current stable Chrome / Edge / Firefox / Safari、および主要なモバイルブラウザーを対象とします。配布用HTMLの `file://` 直開きも対象です。

## Development

このリポジトリは `ttomohisa/htmlapps-template` を基盤とします。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License

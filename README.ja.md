# Photo Collage / 写真コラージュ

複数の写真をブラウザー内で読み込み、1枚のコラージュにまとめるBrowser Kitty向けツールです。

現在の開発版は **v0.8.1** です。高解像度写真を扱うときの安定性を中心に、orientation対応decode、Bitmap / Object URLの明示解放、逐次処理、端末の画像処理メモリが不足した場合の回復案内を追加しました。

## Features

- JPEG / PNG / WebP入力・書き出し
- 2〜20枚の写真
- 写真に合わせた自動レイアウト候補
- 並べ替え / crop / zoom / Fill / Fit / 主役写真
- 比率 / 写真間隔 / 外周余白 / 背景 / 透明背景 / 角丸
- 元写真からの高解像度書き出し
- スマホ4画面: 写真 / 配置 / 仕上げ / 保存
- 最大50操作のUndo / Redo
- 利用可能な場合のorientation-aware `createImageBitmap`
- `ImageBitmap.close()` / Object URLの明示解放
- thumbnail作成と元写真exportの逐次処理
- 現在のコラージュから外れたpreview decoded imageのcache解放
- 最大辺8192px / 最大32MP
- 画像処理メモリ不足時のrecovery案内
- MIMEが空のJPEG / PNG / WebPを拡張子で補完
- 日本語 / English
- Runtime network accessなし

## Performance / Memory

元写真を20枚まとめてdecodeした状態で保持しません。

入力時は1枚ずつ元画像をdecodeし、preview用thumbnailへ描画したら元decodeを解放して次の写真へ進みます。高解像度書き出しも元写真を1枚ずつ読み込み、出力Canvasへ描いた直後に解放します。

対応ブラウザーでは `createImageBitmap(..., { imageOrientation: "from-image" })` を使い、利用後にBitmapをcloseします。互換性のためHTML image fallbackも残しています。

thumbnailのObject URLは現在の編集状態またはUndo / Redo履歴から参照されている間だけ保持します。現在のコラージュにないdecoded preview imageはcacheから外します。

## Robustness

- custom canvas ratio: 1:10〜10:1
- export最大辺: 8192px
- export最大総画素数: 32MP
- MIME typeが空でもJPEG / PNG / WebP拡張子なら入力可能
- 明確な非画像MIMEはfilename extensionだけでは受け入れない
- 端末resource不足時は無反応にせずrecovery案内を表示

20 × 12MP desktop / 10 × 12MP smartphoneの最終実機stress確認はv0.9.0 Release Candidateで実施します。

## v0.8.1 UX変更

- キャンバス比率の初期値を **4:3** に変更。
- 「別の配置を見る」を押すと次の候補ページへ移動し、そのページ先頭の配置をpreviewへ即反映。
- 「別の配置を見る」に現在の候補ページを表示。
- 追加した写真はPCのDrag & Dropに加え、touch対応drag handleでも並べ替え可能。
- privacy badgeを **「完全ローカル処理」** に変更。

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

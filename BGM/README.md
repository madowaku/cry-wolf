# CRY WOLF BGMの保存先

原音の保存先: `C:\Dev\Projects\cry-wolf\BGM`。`BGM/source` に置いたファイルにも対応します。

OpenTracksはプログラムによる音源の自動収集を禁止しているため、ユーザーが公式ページから手動で入手した3曲を使用しています。

| 使用場面 | 曲 / 作者 | 保存名 | 公式ページ |
| --- | --- | --- | --- |
| オープニング（タイトル・夕方） | the fairy tale / のる | `opening.mp3` | https://opentracks.com/bgm/detail/19133 |
| プレイ中（夜・調査・報告） | Storyteller / のる | `gameplay.mp3` | https://opentracks.com/bgm/detail/21959 |
| エンディング（結果・振り返り） | 月夜 / チョコミント | `ending.mp3` | https://opentracks.com/bgm/detail/6987 |

現在の原音は `the_fairy_tale.mp3`、`Storyteller.mp3`、`月夜.mp3`。ダウンロード時の曲名のままでも取り込みスクリプトが探します。上記の短い保存名へ変更しても構いません。同じ曲を両フォルダへ重複して置くと、安全のため取り込みを停止します。

3曲を保存したあと、リポジトリで:

```powershell
npm run music:pack
```

FFmpeg/FFprobeを使い、原音を変更せずAAC/M4Aに変換。変換物をゲーム専用データへまとめ、`public/storybook/assets/audio/music-pack.js` を更新します。途中のM4Aと原音は配布用ZIPに含めません。スクリプトはネットワークへ接続せず、ファイルの存在と形式を検査してから取り込みます。

利用条件: [OpenTracks音源利用ライセンス](https://opentracks.com/help/articles/license/)・[利用規約](https://opentracks.com/help/articles/terms/)。特に自動収集、直リンク、原音の二次配布、容易に音声ファイルを複製できる形での配布を避けます。今回のBGMとしての使用とフェード・形式変換は、音源ライセンスで定められた範囲を参照しています。

現時点の状態: **原音3曲を取り込み済み**。原音のハッシュ、変換後のハッシュ、長さと出典は `docs/storybook-music-receipt.json` に記録しています。再生確認と聴感の評価は別に扱います。

単純な難読化によるゲーム専用コンテナです。DRMではなく、抽出を完全に防げる仕組みではありません。

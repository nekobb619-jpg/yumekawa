# guide-testing.md — 納品前の機械的検証チェックリスト

「動きそうな見た目」で納品しない。特に `js/stages.js`・`js/quizzes/*.js`（教科ごと）・`js/patch.js`
（問題データ・自動パッチロジック）や `index.html`（保存・スコア・モーダルまわりのロジック）を
変更したときは、必ず以下の検証をしてから納品する。

## 1. Node.js による構文・データ構造チェック（必須・最低限）
- `js/stages.js`・`js/quizzes/*.js`・`js/patch.js` を編集したら、Node.jsで `window`/`document`/`alert` を
  モックして、`js/stages.js` → `js/quizzes/`配下の各ファイル（順不同） → `js/patch.js` の順に
  `vm`（または`require()`相当）で読み込み、ステージ数・問題数・選択肢が4つあるか・正解インデックスが
  範囲内か・`canvas_code` が構文エラーなく `new Function('ctx','canvas', code)` で読み込めるか、を
  機械的に検証する（`js/patch.js`を最後に読み込まないと、`window.CONTENT_STAGES`/教科ごとの
  `window.CONTENT_QUIZZES_*` を空のまま合流させてしまうので注意）。
- `index.html` のインライン`<script>`を編集したら、`new Function(scriptContent)` でパースだけでも
  試して構文エラーがないことを確認する（実行はせずパースのみでも壊れた括弧・カンマ漏れは検出できる）。
- 新しいデータ配列（`TREASURE_LIST`など）を追加したときは、id重複がないか、想定件数と一致するか、
  必須フィールドが全件そろっているかをNodeスクリプトで機械チェックする。

## 1.5 実ブラウザでの機能テスト時の注意（Claude Code `mcp__Claude_Browser`等）
- `window.CHILD_ID`（既定値「りお」）が自動ログインされた状態のまま`window.saveData`を
  直接書き換えるテストをしないこと。ネットワークが遮断されている「はず」という思い込みで
  本番識別子のまま検証すると、万一クラウド同期が生きていた場合に実在の子どものセーブデータを
  汚染する（2026-08-04、`.knowledge/postmortems.md`参照）。テスト前に`read_network_requests`で
  `script.google.com`宛の通信が発生していないか確認するか、テスト専用IDに差し替えてから行う。
- **テスト専用アカウント「テストくん」が用意済み**（2026-08-09作成、GAS側`player_db`に空データで
  登録済み）。実アプリでの動作確認が必要なときは、りお/りさのIDのまま触らず、アプリの
  「ログアウト」（おうちの人パスワード）→ ログイン画面で「テストくん」と入力、で切り替えてから行う。
  `ALLOWED_PLAYERS`（コード.gs）はLOGIN処理では実は参照されておらず、どんな名前でも新規プレイヤー
  行が作られる仕組みなので、GAS側の変更なしにテストIDを使い回せる。ブラウザ経由でなく直接GASを
  叩くテスト（Node の fetch 等）の場合は、`GET_BATTLE_STATS`のような読み取り専用アクションか、
  `{action:"LOGIN", playerId:"テストくん"}`を使い、りお/りさのplayerIdを絶対に指定しないこと。

## 2. Playwrightヘッドレスでの実ブラウザ検証（できれば必須）
- 本リポジトリのChromiumは `/opt/pw-browsers/chromium` にプリインストール済み
  （`playwright install`は不要・実行しないこと）。`chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`
  で起動する。
- `file://` + `index.html` のパスで直接開ける（サーバー起動不要）。
- **`page.on('dialog', d => d.accept())` を必ず最初に登録する。** このアプリはネイティブの
  `alert()`/`confirm()` を多用しており（クリア演出・エラー通知・セーブ警告など）、登録なしでは
  ダイアログでブラウザ操作がブロックされて後続の全操作が固まる。
- ネットワークは常に遮断されている（`script.google.com`宛のfetchは`HTTP_CODE:000`で失敗する ＝
  このサンドボックス環境の既知の制約で、アプリのバグではない）。ローカルストレージ・オフライン
  フォールバック経路（`loadGameLocal`など）のテストには好都合なので、あえてそのまま使ってよい。
- 選択肢はランダムにシャッフルされて表示される。Playwrightで自動クリックする場合は
  **表示順（1番目・2番目...）ではなく「正解の文字列」で要素を探す**こと。
- フォント/CDN読み込み失敗やpermissions-policy警告（autoplay/encrypted-media/accelerometer等）は
  オフライン環境特有の無害なノイズなので無視してよい。`net::ERR_TUNNEL_CONNECTION_FAILED`も同様。
- `page.on('pageerror', ...)` と `page.on('console', msg => msg.type()==='error' && ...)` を
  仕込んで、想定外のJSエラーが出ていないかを確認する。

## 3. 確認すべき観点の例
- 新ステージ：メニューに正しく表示されるか、クリア操作が最後まで通るか、コンソールエラーが出ないか。
- 保存・スコアまわりのロジック変更：`exitToMainMenu()`を連続で複数回呼んでもクラッシュしないか、
  既存の重大バグ（`.knowledge/postmortems.md`参照）の再発パターンで壊れていないか
  （例：まちがい→チャットを1回もクリックせず離脱、しても保存が先に完了しているか）。
- 抽選・確率ロジック（お宝図鑑のドロップ率など）：数千〜数万回のループでNode/Playwright上で
  試行し、狙った確率・重み付けにおおむね一致するかを統計的に確認する（1回のPlaywright操作では
  低確率イベントを踏めないため）。
- 新しいモーダル・UI：開閉のDOM状態（`style.display`）が期待通り切り替わるか、既存モーダルとの
  z-index/重なりで表示が壊れないか。

## 4. 納品フロー
1. Node検証 → 2. Playwright検証（実装内容に応じて上記の観点から） →
3. `問題管理台帳.html` など関連ドキュメントの更新 →
4. `AGENTS.md`（または該当する `.knowledge/*.md`）への変更点の反映 → 5. 納品・コミット。
検証スクリプト自体は使い捨てでよく、リポジトリにコミットする必要はない（作業後は削除してよい）。

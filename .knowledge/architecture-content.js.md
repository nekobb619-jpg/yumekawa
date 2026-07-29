# architecture-content.js.md — content.js / index.html の実装詳細

このファイルは「新しいステージ・問題タイプ・機能をどう実装するか」の詳細リファレンス。
毎回読む必要はなく、`js/stages.js`・`js/quizzes/*.js`・`js/patch.js`（旧`content.js`）や関連ロジックを
さわるタスクのときだけ読み込めばよい。
過去に実際に起きた事故・バグの経緯は `.knowledge/postmortems.md` を参照（ここには「現在どう動くか」だけを書く）。

---

## 1. content.js「1ファイル方式」→ 複数ファイル分割（2026-07-29）
- 元は `content.js` 1ファイルに全ステージ一覧（`STAGES`配列）と全問題データ（`QUIZZES`オブジェクト）、
  合流ロジックをすべてまとめていたが、AIの編集コスト・トークン消費を抑えるため、まず
  ステージ・問題データ・ロジックの3ファイルに分割し、同日中に問題データをさらに教科ごとへ
  再分割した（`content.js`自体は削除ずみ）。
  - `js/stages.js`：`STAGES`配列（ステージ定義・メタデータのみ、全教科ぶん）。
    `window.CONTENT_STAGES`として公開。
  - `js/quizzes/`：`QUIZZES`オブジェクト（問題データ本体）を教科ごとに分割。1教科だけ編集・参照
    したいときに他教科ぶんのデータを読み込まずに済む（トークン削減が目的）。ファイル名は
    日本語教科名だとOS間トラブルの懸念があるため英語表記にしている。
    - `math.js`（算数）／`science.js`（理科）／`japanese.js`（国語）／`social.js`（社会）／
      `kanji.js`（漢検）／`inquiry.js`（探究）／`english.js`（英語）
    - 各ファイルは `window.CONTENT_QUIZZES_MATH`／`_SCIENCE`／`_JAPANESE`／`_SOCIAL`／`_KANJI`／
      `_INQUIRY`／`_ENGLISH` としてそれぞれ公開する（教科名のローマ字表記の大文字）。
  - `js/patch.js`：即時実行関数。`window.CONTENT_STAGES` と教科ごとの `window.CONTENT_QUIZZES_*`
    を全部合流させて1つの `QUIZZES` オブジェクトにまとめてから、
    `stableQid`・`migrateWeakQuestionIds`・`injectContentStages`等のロジック・自動パッチ処理を行う。
    合流対象の教科ファイル一覧は `patch.js` 冒頭の `quizParts` 配列で管理している。
  - `index.html` では **`js/stages.js` → `js/quizzes/*.js`（教科、順不同） → `js/patch.js` の順**で
    読み込むこと（`patch.js`が先に読み込まれたstages/quizzesのグローバル公開値を前提にしているため、
    `js/patch.js`を最後にする順序だけは崩すと壊れる）。
- `index.html` の末尾で読み込まれ、`window.injectContentStages()`（`js/patch.js`）が
  `window.globalStageMaster` / `window.availableSubjects` にステージを合流させる（`renderSubjectsNav` /
  `renderStageMaps` / `launchQuest` / `launchWeakAttackLab` をモンキーパッチして統合）。
- **新しいステージを増やすときは、スプレッドシートに行を足す必要はなく、`js/stages.js` の
  `STAGES` に1エントリ、該当教科の `js/quizzes/xxx.js` の `QUIZZES` に対応する問題配列を
  1つ足すだけでよい**（`js/patch.js`側は触らなくてよい）。
- **新しい教科を1つ増やす場合のみ**、`js/quizzes/` に新しいファイルを1つ追加し、
  `window.CONTENT_QUIZZES_XXX` として公開したうえで、`index.html` に `<script>` タグを1行、
  `js/patch.js` の `quizParts` 配列に1行足す必要がある（既存教科への問題追加とは違い、
  この3箇所の変更が必要）。
- ステージIDの命名規則：`"教科/カテゴリ/id名"`（例：`"社会/ごみ/gomi01"`）。`subject` と `category` は
  実際のGASスプレッドシートのタブ名・見出しと同じ日本語文字列にすること（表記ゆれがあると別タブに分かれてしまう）。
- 各ステージのフィールド：`subject`, `category`, `id`, `name`, `reward`, `showCount`
  （1回の挑戦で出す問題数。全問題数より少なくすると毎回ランダムに変わる）, `video_url`, `lab_url`
  （`https://`始まりなら別タブで開く＝カメラ/センサー等を使うラボ向け、`./`始まりならインライン埋め込み）。
- 期間限定公開したいときは `release_from` / `release_until`（`"YYYY-MM-DD"`）をステージに足すだけでよい
  （GAS側は一切さわらない。`isStageActive()` が日付を見て自動で出し入れする）。

## 2. 問題データの書式
`QUIZZES["教科/カテゴリ/id"]` は配列で、各要素（1問）は主に次のいずれかの形：
- 選択式：`{ q, a:[選択肢4つ], c:正解のインデックス(0〜3), hint, job_title, job_desc, speech_text? }`
- 記述式：`{ q, type:"text_input", correct_answers:[正解の表記ゆれを複数], hint, rescue_hint, job_title, job_desc }`
- キャンバス図解つき：上記に `canvas_code`（`ctx`と`canvas`を使う1行のJS文字列。図形やフローチャートを描く）を追加
- 会話シナリオつき（「ねらいを見ぬこう」「ニコに教えてあげよう」等）：`scenario:[{name, icon, msg}, ...]` を追加
- 分岐図解（テンプレート穴うめ式）：`{ q, type:"branch_diagram", diagram:{...}, hint, job_title, job_desc }`。
  `a`/`c` は使わない（正解情報は `diagram.blanks[].correct` 側にある）。詳細は下記「分岐図解トレーニングツール」参照。

**各ユニットには基本的に「【問題のねらいを見ぬこう】」という会話形式の1問を必ず含める**（このアプリの目玉機能）。

## 3. ラボ（体験・実験）の「Lab & Maker」3画面パターン
新しい単元でインタラクティブなラボを作るときは、①実験（触って発見）→②ひらめき（気づきの確認）→
③問題メーカー（通常問題／ワナ問題タブ）の3画面構成にする。
**過去に作ったラボと似たインタラクション手法（同じ操作方法）を使い回さない** こと。
（面積＝タイル敷き詰め、四角形＝頂点ドラッグ、三角形＝頂点ドラッグ＋分類、仲間さがし＝ドラッグ&ドロップ分類、
角度＝線の回転、など単元ごとに手を動かす体験そのものを変えている。）

## 4. 問題管理台帳の同期
`問題管理台帳.html` の `LEDGER` 配列は `js/stages.js`/`js/quizzes/*.js` の `STAGES`/`QUIZZES` の内容と
**常に一致させる**（id、問題数、選択式/記述式の内訳、特徴タグ）。ステージを1つ追加・変更したら、
台帳側も同じタイミングで更新すること（AGENTS.md本体のクリティカル・ルール参照）。

## 5. 分岐図解トレーニングツール（`type:"branch_diagram"`、探究/分岐図解/…）
子どもでも「考えを図にする」練習ができる汎用ツール。テンプレートの穴うめ式（自由描画ではない）。
`index.html` 側に描画エンジンがあり（`window.renderBranchDiagramQuestion` / `window.redrawBranchDiagram` /
`window.handleBranchBlankTap`）、`js/quizzes/*.js` 側はデータ（`diagram` オブジェクト）を渡すだけでよい。

- テンプレートは2種類：
  - `template:"if_then"`（もし〜なら フローチャート）：ノードidは固定で `start`/`cond`/`yes`/`no` の4つ。
    `yes`・`no`のどちらか（または両方）を `kind:"blank"` にして `blankId` を指定すると、そこが穴うめになる。
  - `template:"mindmap"`（中心テーマから広がる図）：ノードidは `center` が必須、それ以外は
    `slot:"top"|"left"|"right"|"bottom"` のいずれかを指定（最大4方向）。こちらも `kind:"blank"` で穴に。
- `diagram.blanks` は `[{ id, promptLabel, options:[選択肢4つ推奨], correct:インデックス }, ...]`。
  ノード側の `blankId` と `blanks[].id` が対応する。
- ラベルの改行は `\n`（キャンバス内で複数行表示される）。長すぎる文言は箱からはみ出るので、
  1行10〜13文字程度・最大3行くらいを目安にする。
- 正解タップで箱が緑色に変わり、全部の穴が埋まると「ぜんぶできた！こたえあわせ」ボタンが有効になる
  （このボタンを押した時点で通常の正誤判定と同じ報酬ロジックに合流する）。ミスタップは
  既存の苦手リスト・チャット復習機能ともちゃんと連動する（`triggerWrongAnswer`をそのまま再利用しているため）。
- 教科「探究」で使用。`window.subjectDictionary`（index.html）にラベル登録ずみ。

## 6. まちがえた問題のチャット復習（`window.startReviewChat` など）
1つの問題セットの最後、まちがえた問題が1問でもあれば、いつもの「クリア！」表示の前に
ニコが吹き出しで一問ずつ「もう一回いっしょに見てみよう」→解説（`job_desc`/`hint`を再利用）→
「わかった！つぎへ」で次のまちがいへ、という復習チャットが自動で挟まる（サーバーAPI不要、
あらかじめ用意した文章のみで動く「なりきりチャット」）。
`window.sessionMissedQuestions` に1問ごとの情報を貯めておき（`launchQuest`のたびにリセット）、
`showQuestionStep`が最後の問題を終えたタイミングで `startReviewChat` に分岐する。
既存の「苦手撃破ラボ」（あとで復習）とは独立した仕組みで、両方が共存する。
新しい問題タイプ（`branch_diagram`など）を追加するときも、`triggerWrongAnswer`をちゃんと呼んでいれば
自動でこの復習チャット・苦手リストの対象になる。
**保存・ログ送信は必ず復習チャットより先に完了させる**（AGENTS.md本体のクリティカル・ルール参照。
過去にこれを破って実害が出た事故は `.knowledge/postmortems.md` 参照）。

## 7. セーブデータの読み込み確認フラグ（`window.saveDataConfirmedSource`）
`window.saveData`はスクリプト読み込み時に必ず空の初期値で作られ、その後`performLogin()`の
LOGIN通信が成功して初めて本物のクラウドの記録で上書きされる。LOGIN通信が失敗した場合は
`window.loadGameLocal()`（その端末のlocalStorageのキャッシュ）にフォールバックする。
`window.saveDataConfirmedSource`（`null` / `"server"` / `"local"`）というフラグで
「本物のデータを一度でも確認できたか」を管理し、`performLogin()`のLOGIN成功時に`"server"`、
`loadGameLocal()`でlocalStorageの前回セーブを読み込めたときに`"local"`をセットする。
`window.saveGame()`は、このフラグが`null`（＝本物のデータを一度も確認できていない）のときは
**クラウドへの`SAVE`通信だけをスキップ**する（この端末のlocalStorageへの保存や画面表示の更新は
今まで通り行うので、その場のプレイ自体は問題なく続けられる）。スキップした場合はセッション中
1回だけ、通信が不安定でクラウドに保存できていない旨のアラートを表示する
（`window._unsavedDataWarningShown`でスパム防止）。この仕組みが生まれた経緯・実際の事故は
`.knowledge/postmortems.md` 参照。

## 8. お宝図鑑（コレクション/ガチャ）システム（2026-07-24 追加）
既存のごほうび経済（pts/Q/robux/欠片/inventory）とは別レイヤーの、非消費型のコレクション
（ガチャ的なワクワク＋図鑑コンプ欲）。消費アイテム（inventory）とは違い、一度手に入れたお宝は
使ってもなくならず、図鑑にずっと残る。

- **データ構造**：`window.saveData.treasureBook`（オブジェクト、キーはお宝id、
  値は`{count, firstGotDate}`）。`window.saveData`の初期値宣言に含まれており、
  `performLogin()`のSUCCESS分岐・`loadGameLocal()`双方に
  `if(!window.saveData.treasureBook) window.saveData.treasureBook = {};`という
  初期化ガードがある（既存の古いセーブデータにフィールドが無くても壊れないように）。
- **お宝一覧**：`window.TREASURE_LIST`（28種、`js/quizzes/*.js`ではなく`index.html`内に直書き）。
  ★1（ふつう・13種）／★2（レア・9種）／★3（超レア・4種）／★4（伝説級・2種、2026-07-24新設）の4段階。
  それぞれ`{id, name, icon, rarity, desc}`。詳細な設計方針・命名規則・今後の拡張チェックリストは
  `.knowledge/treasure-collection.md`を参照。
- **抽選ロジック**：`window.rollTreasureDrop()`。
  ステージクリア（`exitToMainMenu()`内、`window.quitQuest()`の直後）のたびに15%の確率で
  1個抽選（レアリティの重みは2026-07-24改定で★1:65% / ★2:25% / ★3:8% / ★4:2%）。
  苦手撃破ラボ（`weakAttackModeActive`）はこのフックに到達する前に`exitToMainMenu()`が
  早期returnするため対象外（既存のアイテムドロップと同じ扱い）。
  重複（すでに図鑑にある物を引いた）場合は新規追加せず、代わりに欠片🧩を+2する
  「はずれ無し」設計（`inventory`クラフトの素材にもなるため、ダブっても無駄にならない）。
  当たった場合は`window.saveGame()`を呼び直して`treasureBook`の変更をローカル/クラウドへ反映してから、
  `window.showTreasureReveal(treasure, isDupe)`でガチャ演出モーダル（`#treasure-reveal-modal`）を表示する。
- **UI**：メイン画面に「🏆 お宝図鑑」ボタン（`window.openTreasureBookModal()`）。
  図鑑モーダル（`#treasure-book-modal`）は28マスのグリッドで、未取得は「❓／？？？」、
  取得済みはアイコン・名前・（2個以上なら）個数を表示。閉じるのはそれぞれ
  `window.closeTreasureReveal()` / `window.closeTreasureBookModal()`。
  ★4はCSS `.treasure-reveal-box.r4` / `.treasure-slot.owned.r4`（紫系・r3より強い発光アニメーション付き）で演出。

## 8.5 宝島クラフトの見える化（`window.renderTreasureIsland`、2026-07-24 追加）
既存の「宝島ショップ」クラフト（`window.buyShopItem`）は、成功してもテキストのアラートだけで
見た目の変化が無かった。`inventory`（クラフトしたアイテムの在庫）は使うと減る消費物なので、
「積み上げていく達成感」を見せる場所が無かった。この機能は、クラフトした「たてもの」を
canvas上の島にずっと残る形で可視化する（inventoryとは別の非消費レイヤー。お宝図鑑と同じ設計思想）。

- **データ構造**：`window.saveData.islandBuildLog`（配列。クラフトした順に `itemKey`
  文字列 = `"booster"`/`"analyzer"`/`"hourglass"` を`push`していくだけ。1回クラフトする
  たびに1件増える。使っても・アイテムを使い切っても、この配列からは削除しない＝ずっと残る）。
  `window.saveData`の初期値宣言に含まれ、`performLogin()`のSUCCESS分岐・`loadGameLocal()`
  双方に `if(!window.saveData.islandBuildLog) window.saveData.islandBuildLog = [];` の
  初期化ガードがある。
- **記録**：`window.buyShopItem(itemKey)`のクラフト成功時、`inventory.push(itemKey)`に加えて
  `islandBuildLog.push(itemKey)`も行う。成功アラートの文言にも「島にたてものが増えた」旨を追記。
- **描画**：`window.renderTreasureIsland()`（index.html）。`#treasure-island-canvas`
  （480×150のcanvas、`#treasure-island-container-el`内、CSSで`width:100%`にして
  レスポンシブ表示）に、空・海・砂浜・草の丘・ヤシの木2本（固定の飾り）を描き、その上に
  `islandBuildLog`の内容をアイコン（🧪/🔍/⏰）として並べる。配置スロットは24個の固定パターン
  （6列×4行の千鳥配置、`Math.random`は使わない＝再描画のたびに位置が変わらない）。
  24個を超えたら、**表示するのは常に最新の24個**（`log.slice(log.length - slots.length)`）で、
  古い分は右上の「+N」バッジに集約する。最新の1個には金色の輪でハイライトを付ける。
  左上に「🏝️ Lv.N（たてもの M こ）」のラベルを表示（`N = Math.floor(合計数 / 5) + 1`）。
- **描画タイミング**：`window.refreshIslandStatusUI()`の末尾で毎回呼ぶ（このタイミングで
  一元化しているので、`buyShopItem`→`saveGame`→`refreshIslandStatusUI`の流れで
  クラフト直後にも自動的に再描画される。個別に呼び出し箇所を増やす必要はない）。
  宝島が「霧」で閉じている日でも、育てた島の絵そのものは見られる（CSSの`filter`で
  少し彩度を落とすだけで、`renderTreasureIsland`自体は開閉に関係なく毎回実行する）。
- 新しいクラフト可能アイテムを増やす場合は、`window.ISLAND_BUILDING_ICONS`に
  `{itemKey: 絵文字}`を1行足すだけでよい（未登録のキーは🏠にフォールバック）。

## 8.6 きょうだい対抗バトル（2026-07-24 追加・GAS変更を含む唯一の機能）
オンラインの対人・友達機能はやらない方針（AGENTS.mdの禁止事項）だが、りお・りさ2人だけの
「今週のクリア数」を見せ合う、家庭内限定の安全な対戦要素。**この機能だけは、このプロジェクトで
唯一クライアント側（index.html）だけでは完結せず、GAS（コード.gs）側に読み取り専用の新アクション
`GET_BATTLE_STATS`を追加する必要がある**（他の子の記録はサーバー側にしか無いため）。
GASへの追加は必ずユーザーの明示的な許可を得てから行うこと（今回は許可を得て実施ずみ）。
GASに貼るコードは `/home/claude/gas_battle_stats_addition.gs.txt`（納品物としてユーザーに送付ずみ、
リポジトリには含めない）に全文があり、ユーザー自身がコード.gsに貼り付けて再デプロイする必要がある
（このセッションからはGASを直接編集できないため）。

- **サーバー側**：`getWeeklyBattleStats()`（新設）が「ログ」シートを読み取り専用で走査し、
  月曜0時以降・ステージid列が空でない行（＝実際のクリアイベント。LOADなどは除外）を
  playerIdごとに集計して`{"りお":12,"りさ":9}`のようなオブジェクトを返す。保存・削除は一切しない。
  列はヘッダー文字列から自動検出（`日時`/`ステージ`/`playerId`等を含む列を探す）するので、
  列の並び順が変わっても比較的壊れにくい。doPostのaction分岐に
  `action === "GET_BATTLE_STATS"`のケースを1つ追加するだけで良い。
- **クライアント側**：`window.SIBLING_PLAYER_IDS = ["りお","りさ"]`（対象の子ども。増やす場合は
  GAS側の`SIBLING_IDS`とあわせて変更する）。`window.fetchBattleStats()`が
  `{action:"GET_BATTLE_STATS"}`をGASにPOSTし、`window.renderBattleStats(counts)`で
  棒グラフ表示。メイン画面下部のアコーディオン（「🥊 きょうだい対抗バトル」）を開いたタイミングで
  フェッチする（常時フェッチはしない）。
- **子どもの心理面への配慮（重要）**：「勝ち負け」を煽らないUIにしてある。常に2人の合計
  クリア数も表示し、片方が大きくリードしている場合も「〇〇がハイペース！△△も追い上げチャンス！」
  という前向きな文言のみを使う（「まけている」「負け」等の言葉は一切出さない）。通信に失敗した
  場合も、子どもを不安にさせない中立的な文言（「今は記録を読み込めなかったよ」）でフォールバックする。

## 8.7 ゆめかわチューター（単元別の予習・振り返り画面、2026-07-25 追加）
クイズ画面（`#game-screen`）とは完全に独立した、もう1つの全画面ビュー`#tutor-screen`
（メイン画面の「📖 ゆめかわチューター」ボタンから開く）。新しいAI/外部APIは一切使わず、
既存の`js/quizzes/*.js`/`QUIZZES`にすでにある各問題の`hint`（ヒント文）と`job_desc`
（正解後に出る解説文）だけを素材にして、単元（ステージ）ごとに自動で一覧化する
「静的」な仕組み（AI接続や新規コンテンツ執筆が要らないため、実装コストゼロで
全教科・全単元に即対応できるのが利点）。

- **画面構成**：`#tutor-list-view`（教科タブ→カテゴリのアコーディオン→単元ごとに
  「🔍予習する」「📝振り返る」の2ボタン）と`#tutor-detail-view`（選んだ単元のポイント一覧）
  の2ビューを、同じ`#tutor-screen`内で出し分ける（`window.openTutorScreen()`/
  `window.closeTutorScreen()`/`window.openTutorDetail(stageId, mode)`/
  `window.closeTutorDetail()`）。
- **予習と振り返りの違い**：
  - 予習（`mode:"preview"`）：そのステージを未クリアでも使える。各問題の`hint`
    （答えを直接明かさないヒント文）だけを見せる。
  - 振り返り（`mode:"review"`）：`window.saveData.clearedStages[stageId]`が
    trueのときだけボタンが有効になる。各問題の`job_desc`（解説文。無ければ`hint`で代替）
    を見せる。
  - どちらも同じ単元内で重複する文言は`Set`で除去してから表示する。
- **データソース**：`window.CONTENT.quizzes[stageId]`（js/quizzes/*.js由来）。GAS配信ステージ
  （js/quizzes/*.jsに無い、スプレッドシート直配信のステージ）はhint/job_descの束が無いため、
  自動的に両ボタンとも`disabled`になる（`window.CONTENT.quizzes[stg.id]`が空の場合）。
- **教科・単元一覧の取得**：`window.globalStageMaster` / `window.availableSubjects`を
  そのまま再利用（`window.injectContentStages()`を`openTutorScreen()`内で呼んでから
  参照するので、メイン画面を経由せず直接チューター画面を開いても最新の一覧になる）。
- **今後の拡張候補**（未実装）：単元ごとの手書き解説文の追加、予習/振り返りの既読管理、
  苦手リスト（`weakQuestions`）と連携した「この単元は特に振り返っておこう」のレコメンド。

## 8.8 済ステージへの問題追加とクリア判定・報酬計算（2026-07-29 追加）
既存の問題数トラッキングとは別に、**クリア済みステージに問題が追加されたときの
初回クリア報酬（pt/Q）の再付与**を目的とした専用の仕組みを`index.html`側に用意している。

- **`window.saveData.clearedQuestionCounts`**（オブジェクト、キーはステージid、値は
  「最後にクリアした時点の問題数」）。`exitToMainMenu()`でステージをクリアするたびに
  その時点の`window.CONTENT.quizzes[stageId].length`で上書き更新される。
  `normalizeSaveData`・初期`window.saveData`・`performLogin`・`loadGameLocal`すべてに
  `|| {}`のフォールバックがある。
- **`window.hasNewQuestionsSinceCleared(stageId)`**：`clearedStages[stageId]`が
  trueで、かつ現在の`window.CONTENT.quizzes[stageId].length`が
  `clearedQuestionCounts[stageId]`の記録より増えていれば`true`を返す（＝クリア後に
  問題が追加された）。`clearedQuestionCounts[stageId]`が未記録（`typeof !== "number"`、
  この仕組み導入前にクリアされた既存セーブなど）の場合は`false`を返す＝**過去分の遡及判定は
  しない**（次に実際にクリアし直した時点からスナップショットが記録され、以後は正しく機能する）。
- **`computeStageBadgeFlags(stg)`**はこの判定を取り込み、問題が追加された済ステージを
  `isCleared:false`・`isNewStage:true`（🆕NEWバッジ表示）として返す（`stg.created`の
  14日以内チェックとは独立に、新問題追加を検知したら常にNEWバッジを立てる）。
  `openBriefing`・`exitToMainMenu`・`triggerCorrectAnswer`（1問ごとのpt計算）は、いずれも
  この判定結果（または`hasNewQuestionsSinceCleared`）を使って`isCleared`を決定するため、
  問題が追加された済ステージでは「本日上限」の周回ペナルティを踏まずに初回クリア相当の
  報酬（pt/Q）が付与される。
- **既存の`js/patch.js`の`ensureStageQuestionCountTracking`（`stageQuestionCounts`）との違い**：
  あちらはログイン時に問題数の増加を検知すると`clearedStages[stageId]`を**削除**し、
  「済」を外した旨のアラートを出す、より粗い仕組み（該当ステージは進捗表示ごと「未クリア」に
  戻る）。こちらの`clearedQuestionCounts`は`clearedStages`自体は書き換えず、報酬計算・NEWバッジの
  判定だけを内部的に「未クリア扱い」にする、より穏やかな仕組み。両者は併存しており、
  `ensureStageQuestionCountTracking`が先に`clearedStages[stageId]`を削除した場合は
  `hasNewQuestionsSinceCleared`はその時点で`clearedStages[stageId]`が偽になるため
  素通り（`false`を返す）し、報酬計算は`clearedStages`が偽である通常の「未クリア」経路で
  正しく処理される。

## 9. 苦手リストの安定id化（qid）と、周回プレイでの数値の その場 再生成
- `js/patch.js` は起動時に、`QUIZZES` の全問題へ自動で `qid`（安定id）を振る
  （`job_title`＋`hint`＋`q`冒頭14文字からのハッシュ。手で編集する必要はない）。
  苦手リストは以後 `ステージid::qid` 形式で保存される（旧形式 `ステージid_q_インデックス番号` は、
  問題の並び順を変えると指し先がズレるという弱点があった）。
- 旧形式のまま残っている苦手リストは `window.migrateWeakQuestionIds()`（js/patch.js）が自動で
  新形式へ書きかえる。**この関数は js/patch.js 読み込み時ではなく、`index.html` の
  `loadGameLocal()` と `performLogin()` 成功時（＝実際のセーブデータが `window.saveData` に
  入ったあと）に呼ぶ**（js/patch.js自体の実行タイミングでは、セーブデータの読み込みがまだ
  非同期で終わっていないため、そこで呼んでも何もマイグレードされない）。
- クリア済みステージを周回プレイすると、`regen:{kind:"hissan_divide"}` を持つ問題（今のところ
  `算数/わり算/hissan_amari02` の筆算系9問）は、`window.regenerateQuestion()`（index.html）が
  その場で数値をランダムに再生成する（q・hint・job_desc・選択肢・canvas描画をすべて作り直す。
  `window.currentQuestions` 側の該当1問だけを差し替え、`QUIZZES`本体のマスターデータは触らない）。
  再生成された問題には `qid` は元のまま引き継がれるので、苦手リストの「どのテンプレートか」の
  判定は数値が変わってもズレない。画面には「🔄 数字が新しくなったよ！」の小さいバッジが出る
  （`#regen-badge`）。初回プレイ（まだクリアしていないステージ）や苦手撃破ラボ中は再生成しない
  （苦手撃破ラボは「まさにその問題を克服できたか」を見るためのものなので、あえて数値を変えない）。
- 新しい単元に regen対応の問題を追加したいときは、問題オブジェクトに
  `regen:{kind:"hissan_divide"}` を足すだけでよい（今のところ generator の種類は
  `hissan_divide`（2けた÷2けたのわり算の筆算）のみ。別の種類を増やす場合は
  `window.regenHissanDivide` の隣に新しい生成関数を足し、`window.regenerateQuestion`の
  `if (original.regen.kind === "...")` 分岐を増やす）。まだ全ステージには展開していない
  （今のところ算数/わり算/hissan_amari02のみに適用）。

## 10. 苦手撃破ラボは複数ステージにまたがるにがて問題もまとめて処理する
`js/patch.js`の`launchWeakAttackLab`パッチは、`weakQuestions`の全要素をそれぞれ
新形式（`ステージid::qid`）または旧形式（`ステージid_q_インデックス番号`）として解釈し、
`window.CONTENT.quizzes`から解決できるものはすべて対象に含める（複数ステージが混ざっていてOK）。
1件も解決できない場合のみ、旧来の単一ステージ動的読み込み（`.js`ファイルをfetchするGAS時代の方式）
にフォールバックする。ダミー問題での水増し（3問未満のときの穴うめ）は、引き続き最初の1件が
属するステージのバンドルからのみ選ぶ（複数ステージから均等に集める、まではやっていない）。
この仕組みが生まれた経緯（過去のバグ）は `.knowledge/postmortems.md` 参照。

## 11. 苦手問題にアップする基準
「1問でもまちがえたら即座に苦手リストへ追加」という基準（あえて厳しめ）。将来ここを変える場合は
`triggerWrongAnswer`（index.html）内の該当ロジックを見ること。

## 12. 既存ユニットの実例（新ユニット作成時の参考）
- `理科/季節と生き物/kisetsu01`（4年生、全11問・showCount:11）：春夏秋冬の生き物の変化
  （サクラ・ヘチマ・ツバメ・こん虫の冬越し）＋こん虫の冬越しの姿を示す canvas 図解1問＋
  「ねらいを見ぬこう」「ニコに教えてあげよう」各1問＋text_input 2問、という構成パターン
  （`denki01`/`hoshi01`と同じ型）。事実（昆虫の冬越しの姿・ツバメの渡り時期）は複数の専門サイトで
  クロスチェック済み。
- `社会/都道府県/todofuken01`（4年生、全11問・showCount:11）：都道府県の数（47）、8地方区分
  （地方ごとの都道府県数を示す canvas 棒グラフ図解1問）、面積が最大／最小の都道府県、
  「ねらいを見ぬこう」「ニコに教えてあげよう」各1問、text_input 2問という構成。事実も同様に
  複数サイトでクロスチェック済み。
- 新ユニットを作るときはこの型（体験→canvas図解問題→ねらいを見ぬこう→教えてあげよう→text_input復習）
  を踏襲し、事実確認が必要な内容は必ずWeb検索で複数ソースをクロスチェックしてから出題する。

## 13. ディレクトリ構成（実際の状態）
```
（リポジトリ直下）
  index.html         … アプリ本体（1ファイル、Vite等のビルド無し）
  js/stages.js         … 全ステージ一覧（STAGES、全教科ぶん）。window.CONTENT_STAGESとして公開
  js/quizzes/          … 問題データ本体（QUIZZES）を教科ごとに分割
    math.js              … 算数。window.CONTENT_QUIZZES_MATHとして公開
    science.js           … 理科。window.CONTENT_QUIZZES_SCIENCEとして公開
    japanese.js          … 国語。window.CONTENT_QUIZZES_JAPANESEとして公開
    social.js            … 社会。window.CONTENT_QUIZZES_SOCIALとして公開
    kanji.js             … 漢検。window.CONTENT_QUIZZES_KANJIとして公開
    inquiry.js           … 探究。window.CONTENT_QUIZZES_INQUIRYとして公開
    english.js           … 英語。window.CONTENT_QUIZZES_ENGLISHとして公開
  js/patch.js          … 上記を全部合流させる自動パッチ処理・既存エンジンへの統合ロジック
                          （2026-07-29に旧content.js 1ファイルから3分割 → 同日中に問題データを
                          教科ごとへ再分割。上記「1.」参照）
  images/              … 画像アセット
  lab/教科/xxx.html    … 各単元の体験・実験ラボ（個別ファイル）
  算数/ 国語/ 理科/ 社会/ 外国語/ 探究/ … 過去（content.js/js分割方式より前）の個別 questions.js が残っている場合がある。
                          特に指示がない限り、削除や整理はしない（現状維持）。
  docs/                … 初期設計時の参照ドキュメント（要件定義・デザイン方針。技術スタックの記載は
                          その後 index.html 1ファイル方式に実装が変わったため古いが、学習設計・
                          ペダゴジー面の意図は今も参考になる）
  .knowledge/          … このファイルを含む詳細ナレッジ（AGENTS.mdから必要時のみ参照される）
```
※ サーバー（GAS = Google Apps Script）は別管理。`コード.gs` はこのリポジトリには含まれない場合がある。
　GAS側の仕様を変更する提案・実装は、必ずユーザーに確認してから行うこと（現状はGASを一切さわらない方針）。

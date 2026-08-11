# AIモデル用 厳格開発ルール & STEAM拡張仕様書

本ドキュメントは、**「ゆめかわ★学びアドベンチャー LAB Pro」**のシステム構造、問題データ仕様、および **STEAM教育（Science, Technology, Engineering, Arts, Mathematics）** に則したコンテンツ拡張ルールを他のAIモデルでも誤りなく実装・維持できるように定義した厳格な開発ガイドラインです。

---

## 1. システムアーキテクチャとファイル構造

本アプリはビルドツールを使用しない純粋な HTML/CSS/JS アーキテクチャです。

### 1.1 読み込み順序と責務（`index.html`）
`index.html` の末尾において、必ず以下の順序で `<script>` が読み込まれます。この順序を崩してはなりません。

```html
<script src="./js/stages.js"></script>
<script src="./js/quizzes/math.js"></script>
<script src="./js/quizzes/science.js"></script>
<script src="./js/quizzes/japanese.js"></script>
<script src="./js/quizzes/social.js"></script>
<script src="./js/quizzes/kanji.js"></script>
<script src="./js/quizzes/inquiry.js"></script>
<script src="./js/quizzes/english.js"></script>
<!-- ※新しい教科ファイルを追加した場合はここに挿入 -->
<script src="./js/patch.js"></script>
```

### 1.2 ファイルの責務
1. `js/stages.js`: 全ステージ定義（`window.CONTENT_STAGES`）。
2. `js/quizzes/*.js`: 教科別の問題データ（`window.CONTENT_QUIZZES_*`）。
3. `js/patch.js`: 即時実行関数。各教科の問題データを `QUIZZES` に統合し、`window.CONTENT` を生成。`launchQuest` や `stableQid` をパッチ処理。
4. `index.html`: UIレンダリング、クイズ実行エンジン、TTS（音声合成）、キャンバス描画、分岐図解レンダラー。
5. `問題管理台帳.html`: 全ステージ・問題数を管理する台帳。`LEDGER` 配列を同期必須。

---

## 2. 問題データスキーマ（`QUIZZES` 仕様）

問題データは `QUIZZES["教科/カテゴリ/ステージID"] = [ ... ]` の配列構造です。

### 2.1 各問題オブジェクトのフィールド定義

| フィールド名 | 型 | 必須 | 説明 / 用途 |
|:---|:---|:---:|:---|
| `q` | `string` | **必須** | 問題文。小学4年生が読めるようにひらがな・ふりがな表記。 |
| `a` | `Array<string>` | 条件付 | 選択肢（通常4つの文字列）。`type:"choice"` または未指定時に使用。 |
| `c` | `number` | 条件付 | 正解インデックス（0〜3の整数）。`a` 配列と連動。 |
| `type` | `string` | 任意 | `"choice"` (デフォルト), `"text_input"`, `"kanji_build"`, `"branch_diagram"` |
| `thinking` | `boolean` | 任意 | `true` の場合、ひらめき・思考力問題（`💡`バッジ付与、優先出題）。 |
| `hint` | `string` | **推奨** | ナビ助言・ヒントテキスト。間違えた際やヒントボタンで表示。 |
| `job_title` | `string` | 任意 | 正解時に表示される職業・称号名（例：「プログラミングはかせ！」）。 |
| `job_desc` | `string` | 任意 | 正解時の詳しい解説・学びのフィードバック。 |
| `speech_text` | `string` | 任意 | TTS（音声読み上げ）用テキスト。**答えネタバレ厳禁**。 |
| `scenario` | `Array<Object>`| 任意 | ニコとの会話（マンガ形式）。`[{name:"ニコ", icon:"🦄", msg:"..."}]` |
| `canvas_code` | `string` | 任意 | HTML5 Canvas描画コード。`new Function('ctx', 'canvas', canvas_code)` で実行。 |
| `correct_answers`| `Array<string>`| 条件付 | `type:"text_input"` 時の正解文字列配列（表記ゆれを含める）。 |
| `diagram` | `Object` | 条件付 | `type:"branch_diagram"` 時のフローチャート/マインドマップ構造定義。 |

---

## 3. STEAM教育コンテンツ拡張ルール

AIモデルが新しいステージ・問題を追加する際は、以下の指標を厳格に順守してください。

### 3.1 STEAM各領域の基準と定義

- **S (Science / 科学)**: 理科・自然現象・観察・状態変化
- **T (Technology / 技術)**: プログラミング思考（順次・分岐・反復）、情報モラル・セキュリティ
- **E (Engineering / 工学)**: 設計思考（課題→計画→試作→改善）、科学的実験計画（条件制御）
- **A (Arts / 人文・表現)**: 読解、言語表現、言葉のしくみ、図解・コミュニケーション
- **M (Mathematics / 数学)**: 算数、図形、計算、データ読解（グラフ）

### 3.2 思考力問題（`thinking: true`）の必須組み込み
- **ルール**: 各ステージ（5〜10問中）に**最低1〜2問**は `thinking: true` の問題を配置すること。
- **条件**: 暗記ではなく「条件整理」「順序立て」「法則の発見」を求めること。

---

## 4. AIモデル向け開発チェックリスト（必須順守）

新しい問題データを書き込む前に、AIモデルは以下の項目をセルフチェックすること。

1. **正答の正確性**: 学術的・教科書的に100%正しいか。
2. **正解インデックス一致**: `a[c]` が正解文字列と合致しているか。
3. **選択肢の重複なし**: `a` 配列の4つの要素がすべて異なるか。
4. **ネタバレ防止**: `speech_text` や `q` の文中に正解をそのまま書いていないか。
5. **台帳同期**: `js/stages.js` や `js/quizzes/*.js` に追加後、`問題管理台帳.html` の `LEDGER` も更新したか。
6. **機械検証実行**: `node verify_quizzes.js` 等で構文エラーゼロを確認したか。

/* =====================================================================
   js/adaptive-question-generator.js  ---  苦手分野の自動分析 → Gemini APIでの練習問題生成
   ---------------------------------------------------------------------
   読み込み順番： index.html で js/patch.js のあとに読み込むこと
   （window.CONTENT.quizzes / window.postToGAS / window.saveGame に依存するため）。

   ★AGENTS.md 絶対禁止事項「APIキーをフロントエンドに置かない」を守るため、
   Gemini APIの実呼び出しはこのファイルからは行わない。window.postToGAS()経由で
   GASプロキシの汎用アクション "GENERATE_QUIZ_QUESTIONS" を叩く想定（GAS側でGemini APIキーを
   スクリプトプロパティとして保持して中継する）。GAS側の追加は別途ユーザーの許可が必要
   （AGENTS.md 6・8.6参照）なので、このファイルはGASが未対応でも単体でログ解析・
   プロンプト構築まではテストできるように分けてある。

   このファイルは2つの用途で共用する：
   (A) 苦手分野の分析結果から克服問題を生成（analyzeWeakAreas〜）
   (B) 既に済（クリア済み）の単元をくり返しプレイしたときの、まる暗記対策の
       問題内容自動リフレッシュ（maybeTriggerUnitContentRefresh〜。2026-08-08追加）
   ===================================================================== */
(function () {

  /* ---------------------------------------------------------------------
     (1) ログ解析機能：苦手分野の算出・特定
     入力ログの1件は { category, correct, answerTimeMs?, hintItemUsed? } を想定。
     - correctRate が低いカテゴリ（正答率が低い）
     - 正解していてもヒントアイテム（選択肢消去など）の使用頻度が高いカテゴリ
     の2条件で「苦手」を判定する。
     --------------------------------------------------------------------- */
  window.WEAK_AREA_THRESHOLDS = {
    minAttempts: 3,        // これ未満の挑戦回数のカテゴリは判定材料不足として除外
    lowAccuracyRate: 0.6,  // 正答率がこれ未満なら「苦手」判定
    highHintUsageRate: 0.5 // 正解時のヒント使用率がこれ以上なら「ヒント依存」判定
  };

  window.analyzeWeakAreas = function (logs, thresholds) {
    thresholds = Object.assign({}, window.WEAK_AREA_THRESHOLDS, thresholds || {});
    if (!Array.isArray(logs) || logs.length === 0) return [];

    var byCategory = {};
    logs.forEach(function (entry) {
      if (!entry || !entry.category) return;
      var cat = entry.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { category: cat, total: 0, correct: 0, hintUsedOnCorrect: 0, totalTimeMs: 0, timedCount: 0 };
      }
      var stat = byCategory[cat];
      stat.total += 1;
      var isCorrect = !!entry.correct;
      var usedHint = !!(entry.hintItemUsed || entry.hintUsed);
      if (isCorrect) {
        stat.correct += 1;
        if (usedHint) stat.hintUsedOnCorrect += 1;
      }
      if (typeof entry.answerTimeMs === "number" && entry.answerTimeMs >= 0) {
        stat.totalTimeMs += entry.answerTimeMs;
        stat.timedCount += 1;
      }
    });

    var results = Object.keys(byCategory).map(function (cat) {
      var s = byCategory[cat];
      var correctRate = s.total > 0 ? s.correct / s.total : 0;
      var hintUsageRateOnCorrect = s.correct > 0 ? s.hintUsedOnCorrect / s.correct : 0;
      var reasons = [];
      if (s.total >= thresholds.minAttempts && correctRate < thresholds.lowAccuracyRate) reasons.push("low_accuracy");
      if (s.correct >= thresholds.minAttempts && hintUsageRateOnCorrect >= thresholds.highHintUsageRate) reasons.push("hint_dependent");
      return {
        category: cat,
        totalAttempts: s.total,
        correctCount: s.correct,
        correctRate: Number(correctRate.toFixed(3)),
        hintUsageRateOnCorrect: Number(hintUsageRateOnCorrect.toFixed(3)),
        avgAnswerTimeMs: s.timedCount > 0 ? Math.round(s.totalTimeMs / s.timedCount) : null,
        reasons: reasons,
        isWeak: reasons.length > 0,
        // 正答率の低さを重め（0.7）、ヒント依存を軽め（0.3）で合成した優先度スコア
        weaknessScore: Number(((1 - correctRate) * 0.7 + hintUsageRateOnCorrect * 0.3).toFixed(3))
      };
    });

    return results
      .filter(function (r) { return r.isWeak; })
      .sort(function (a, b) { return b.weaknessScore - a.weaknessScore; });
  };

  /* ---------------------------------------------------------------------
     (2) Gemini API プロンプト構築
     --------------------------------------------------------------------- */
  window.buildWeakAreaGeminiRequest = function (weakAreas, opts) {
    opts = opts || {};
    var questionsPerCategory = opts.questionsPerCategory || 2;
    var grade = opts.grade || "小学4年生";

    var categoryLines = weakAreas.map(function (w) {
      var reasonText = w.reasons.map(function (r) {
        return r === "low_accuracy"
          ? "正答率" + Math.round(w.correctRate * 100) + "%と低い"
          : "正解時でもヒント（選択肢消去）の使用率" + Math.round(w.hintUsageRateOnCorrect * 100) + "%と高く、理解が浅い可能性";
      }).join("／");
      return "- 「" + w.category + "」：" + reasonText;
    }).join("\n");

    var responseFormatExample = {
      generated_questions: [{
        question_id: "gen_001",
        category: "対象カテゴリ",
        question_text: "問題文",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correct_index: 0,
        explanation: "解説文"
      }]
    };

    var systemPrompt = [
      "あなたは" + grade + "向け学習アプリ「ゆめかわ★学びアドベンチャー LAB」の問題作成アシスタントです。",
      "以下の「苦手カテゴリ」ごとに、克服のための練習問題を" + questionsPerCategory + "問ずつ作成してください。",
      "",
      "【厳守事項】",
      "- 対象は" + grade + "。使う漢字・言葉は" + grade + "が読めるやさしい表現にすること（習っていない漢字は使わない、または平仮名にする）。",
      "- 4択問題のみ（options は必ず4つ、correct_index は0〜3）。正解は1つだけで、誤答は正答と明確に区別できる内容にすること。",
      "- question_text に答えをそのまま書かない・答えが一意に推測できる書き方をしない。",
      "- こわい話題・大人向けの話題・個人情報に関する内容は一切含めない。",
      "- explanation は正解の理由を簡潔にやさしく説明すること。",
      "- 出力は指定のJSON以外の文章（前置き・挨拶・コードブロック記号）を一切含めないこと。",
      "",
      "【出力フォーマット（厳守・このJSON以外を出力しない）】",
      JSON.stringify(responseFormatExample, null, 2)
    ].join("\n");

    var userPrompt = "苦手カテゴリ一覧：\n" + categoryLines;

    return { systemPrompt: systemPrompt, userPrompt: userPrompt };
  };

  /* ---------------------------------------------------------------------
     (2') Gemini API 呼び出し（GASプロキシ経由）
     GAS側には action:"GENERATE_QUIZ_QUESTIONS" という1つの汎用ハンドラだけを用意すればよい
     （systemPrompt/userPromptをそのままGeminiへ中継して返すだけの処理なので、苦手分野向け・
     まる暗記対策の単元リフレッシュ向けなど、呼び出し元が違ってもGAS側は1本で共有できる）。
     未実装ならcatchでフォールバックする。
     --------------------------------------------------------------------- */
  window.generateWeakAreaQuestions = function (weakAreas, opts) {
    if (!Array.isArray(weakAreas) || weakAreas.length === 0) {
      return Promise.resolve({ generated_questions: [], error: "no_weak_areas" });
    }
    if (typeof window.postToGAS !== "function") {
      console.error("[adaptive-question-generator] window.postToGAS が見つかりません");
      return Promise.resolve({ generated_questions: [], error: "no_transport" });
    }
    var request = window.buildWeakAreaGeminiRequest(weakAreas, opts);
    return window.postToGAS({
      action: "GENERATE_QUIZ_QUESTIONS",
      systemPrompt: request.systemPrompt,
      userPrompt: request.userPrompt
    }).then(function (res) {
      return window.parseGeneratedQuestionsResponse(res);
    }).catch(function (err) {
      // ★通信失敗（オフライン・GAS未対応など）はここで必ず握りつぶし、呼び出し元には
      //   空配列＋errorコードのフォールバックを返す（他のGAS呼び出し同様、無音落ちにはしない）。
      console.error("[adaptive-question-generator] generation failed", err);
      return { generated_questions: [], error: "communication_failed" };
    });
  };

  /* ---------------------------------------------------------------------
     (3) APIレスポンスのJSONパース・スキーマ検証（フォールバック処理込み）
     --------------------------------------------------------------------- */
  window.parseGeneratedQuestionsResponse = function (raw) {
    var data = raw;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("[adaptive-question-generator] JSONパース失敗", e, raw);
        return { generated_questions: [], error: "invalid_json" };
      }
    }
    if (!data || !Array.isArray(data.generated_questions)) {
      console.error("[adaptive-question-generator] レスポンス形式が不正", data);
      return { generated_questions: [], error: "invalid_shape" };
    }

    var valid = [];
    data.generated_questions.forEach(function (q, idx) {
      if (!q || typeof q.question_text !== "string" || !q.question_text.trim()) return;
      if (!Array.isArray(q.options) || q.options.length !== 4) return;
      if (q.options.some(function (o) { return typeof o !== "string" || !o.trim(); })) return;
      if (typeof q.correct_index !== "number" || q.correct_index < 0 || q.correct_index > 3) return;
      if (typeof q.category !== "string" || !q.category.trim()) return;
      valid.push({
        question_id: (typeof q.question_id === "string" && q.question_id.trim()) ? q.question_id : ("gen_" + Date.now() + "_" + idx),
        category: q.category,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: typeof q.explanation === "string" ? q.explanation : ""
      });
    });

    if (valid.length === 0) return { generated_questions: [], error: "no_valid_questions" };
    return { generated_questions: valid };
  };

  /* ---------------------------------------------------------------------
     (4) 生成された問題を既存の問題データ配列へ追加・保存
     --------------------------------------------------------------------- */
  window.convertGeneratedQuestionToQuizFormat = function (genQ) {
    return {
      q: genQ.question_text,
      a: genQ.options,
      c: genQ.correct_index,
      hint: genQ.explanation || "",
      job_title: "AI特訓もんだい",
      job_desc: genQ.explanation || "",
      qid: "ai_" + genQ.question_id,
      aiGenerated: true
    };
  };

  // stageIdの問題配列（window.CONTENT.quizzes[stageId]）へ追加し、saveDataにも永続化する。
  // 戻り値は実際に追加できた件数（重複qidはスキップ）。
  window.addGeneratedQuestionsToQuizzes = function (generatedQuestions, stageId) {
    if (!window.CONTENT || !window.CONTENT.quizzes) {
      console.error("[adaptive-question-generator] window.CONTENT.quizzes が未初期化です");
      return 0;
    }
    if (!stageId || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) return 0;

    if (!Array.isArray(window.CONTENT.quizzes[stageId])) window.CONTENT.quizzes[stageId] = [];
    if (!window.saveData) window.saveData = {};
    if (!window.saveData.aiGeneratedQuizzes) window.saveData.aiGeneratedQuizzes = {};
    if (!Array.isArray(window.saveData.aiGeneratedQuizzes[stageId])) window.saveData.aiGeneratedQuizzes[stageId] = [];

    var existingIds = {};
    window.CONTENT.quizzes[stageId].forEach(function (q) { if (q && q.qid) existingIds[q.qid] = true; });

    var addedCount = 0;
    generatedQuestions.forEach(function (genQ) {
      var converted = window.convertGeneratedQuestionToQuizFormat(genQ);
      if (existingIds[converted.qid]) return; // 同じ問題の重複追加を防止
      window.CONTENT.quizzes[stageId].push(converted);
      window.saveData.aiGeneratedQuizzes[stageId].push(converted);
      existingIds[converted.qid] = true;
      addedCount += 1;
    });

    if (addedCount > 0 && typeof window.saveGame === "function") window.saveGame();
    return addedCount;
  };

  // 次回起動時、保存済みのAI生成問題をライブのCONTENT.quizzesへ再合流させる
  // （window.migrateWeakQuestionIds()と同じタイミング＝loadGameLocal/performLogin成功後に呼ぶこと）。
  window.reinjectSavedAiQuestions = function () {
    if (!window.saveData || !window.saveData.aiGeneratedQuizzes) return;
    if (!window.CONTENT || !window.CONTENT.quizzes) return;
    Object.keys(window.saveData.aiGeneratedQuizzes).forEach(function (stageId) {
      if (!Array.isArray(window.CONTENT.quizzes[stageId])) window.CONTENT.quizzes[stageId] = [];
      var existingIds = {};
      window.CONTENT.quizzes[stageId].forEach(function (q) { if (q && q.qid) existingIds[q.qid] = true; });
      window.saveData.aiGeneratedQuizzes[stageId].forEach(function (q) {
        if (q && q.qid && !existingIds[q.qid]) {
          window.CONTENT.quizzes[stageId].push(q);
          existingIds[q.qid] = true;
        }
      });
    });
  };

  /* ---------------------------------------------------------------------
     (5) まる暗記対策：済（クリア済み）単元の周回プレイに対する問題内容の自動リフレッシュ
     2026-08-08追加。対象は「すでに済になっていて、かつ周回している」単元のみ（初回学習中の
     単元には手を出さない）。window.saveData.loopCounts[stageId]（index.htmlのexitToMainMenu内、
     computeStageClearRewardでisCleared時にインクリメント）を判定材料にする。
     --------------------------------------------------------------------- */
  window.UNIT_REFRESH_LOOP_INTERVAL = 3;    // 周回数がこれより多くなるたびにリフレッシュを検討する
  window.UNIT_REFRESH_MAX_AI_QUESTIONS = 6; // 1ステージあたりAI生成問題をここまでに制限（際限なく増やさない）

  window.buildUnitRefreshGeminiRequest = function (stage, sampleQuestions, opts) {
    opts = opts || {};
    var grade = opts.grade || "小学4年生";
    var sampleLines = (sampleQuestions || []).slice(0, 3).map(function (q) {
      return "- " + (q.q || "");
    }).join("\n");

    var responseFormatExample = {
      generated_questions: [{
        question_id: "gen_001",
        category: stage.category || stage.name,
        question_text: "問題文",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correct_index: 0,
        explanation: "解説文"
      }]
    };

    var systemPrompt = [
      "あなたは" + grade + "向け学習アプリ「ゆめかわ★学びアドベンチャー LAB」の問題作成アシスタントです。",
      "この子は単元「" + stage.name + "」（" + (stage.subject || "") + "/" + (stage.category || "") + "）を",
      "すでにクリア済みで、くり返し練習しています。同じ問題文をまる暗記してしまわないように、",
      "同じ単元・同じねらいのまま、問われる事実や数値・言い回しが違う新しい4択問題を3問 作ってください。",
      "",
      "【厳守事項】",
      "- 対象は" + grade + "。使う漢字・言葉は" + grade + "が読めるやさしい表現にすること。",
      "- 4択問題のみ（options は必ず4つ、correct_index は0〜3）。正解は1つだけ。",
      "- 下記の「すでにある問題」と、問われている事実・数値・文言が重ならないようにすること。",
      "- question_text に答えをそのまま書かない・答えが一意に推測できる書き方をしない。",
      "- こわい話題・大人向けの話題・個人情報に関する内容は一切含めない。",
      "- explanation は正解の理由を簡潔にやさしく説明すること。",
      "- 出力は指定のJSON以外の文章（前置き・挨拶・コードブロック記号）を一切含めないこと。",
      "",
      "【すでにある問題（このまま繰り返さない）】",
      sampleLines || "（なし）",
      "",
      "【出力フォーマット（厳守・このJSON以外を出力しない）】",
      JSON.stringify(responseFormatExample, null, 2)
    ].join("\n");

    var userPrompt = "単元「" + stage.name + "」向けの、まる暗記対策の新しい練習問題を3問作ってください。";

    return { systemPrompt: systemPrompt, userPrompt: userPrompt };
  };

  window.generateUnitRefreshQuestions = function (stage, sampleQuestions, opts) {
    if (!stage) return Promise.resolve({ generated_questions: [], error: "no_stage" });
    if (typeof window.postToGAS !== "function") {
      return Promise.resolve({ generated_questions: [], error: "no_transport" });
    }
    var request = window.buildUnitRefreshGeminiRequest(stage, sampleQuestions, opts);
    return window.postToGAS({
      action: "GENERATE_QUIZ_QUESTIONS",
      systemPrompt: request.systemPrompt,
      userPrompt: request.userPrompt
    }).then(function (res) {
      return window.parseGeneratedQuestionsResponse(res);
    }).catch(function (err) {
      console.error("[adaptive-question-generator] unit refresh generation failed", err);
      return { generated_questions: [], error: "communication_failed" };
    });
  };

  // exitToMainMenu（index.html）から、isCleared（＝済単元の周回プレイ）のときだけ呼ぶこと。
  // 周回数が前回リフレッシュ時より UNIT_REFRESH_LOOP_INTERVAL より多く進んでいれば、
  // バックグラウンドで問題を生成・追加する（通信中でも通常のクリア処理はブロックしない）。
  window.maybeTriggerUnitContentRefresh = function (stageId) {
    if (!stageId || !window.saveData || !window.CONTENT || !window.CONTENT.quizzes) return;

    var loopCount = (window.saveData.loopCounts && window.saveData.loopCounts[stageId]) || 0;
    if (loopCount <= window.UNIT_REFRESH_LOOP_INTERVAL) return;

    if (!window.saveData.lastContentRefreshLoopCount) window.saveData.lastContentRefreshLoopCount = {};
    var lastRefreshAt = window.saveData.lastContentRefreshLoopCount[stageId] || 0;
    if (loopCount - lastRefreshAt <= window.UNIT_REFRESH_LOOP_INTERVAL) return;

    var bundle = window.CONTENT.quizzes[stageId] || [];
    var aiCount = bundle.filter(function (q) { return q && q.aiGenerated; }).length;
    if (aiCount >= window.UNIT_REFRESH_MAX_AI_QUESTIONS) return;

    var stage = (window.CONTENT.stages || []).filter(function (s) { return s.id === stageId; })[0];
    if (!stage) return;

    // 二重発火防止のため、実際の生成結果を待たずに先に記録する
    window.saveData.lastContentRefreshLoopCount[stageId] = loopCount;

    var sampleQuestions = bundle.filter(function (q) { return q && q.q; }).slice(0, 3);
    window.generateUnitRefreshQuestions(stage, sampleQuestions).then(function (result) {
      if (result.generated_questions.length > 0) {
        window.addGeneratedQuestionsToQuizzes(result.generated_questions, stageId);
      }
    });
  };

  /* ---------------------------------------------------------------------
     まとめて実行するオーケストレーター（分析→生成→検証→追加保存を一括で行いたい場合用）
     --------------------------------------------------------------------- */
  window.runAdaptiveQuestionGeneration = function (logs, stageId, opts) {
    var weakAreas = window.analyzeWeakAreas(logs, opts && opts.thresholds);
    if (weakAreas.length === 0) return Promise.resolve({ weakAreas: [], generated_questions: [], addedCount: 0 });
    return window.generateWeakAreaQuestions(weakAreas, opts).then(function (result) {
      var addedCount = 0;
      if (result.generated_questions.length > 0 && stageId) {
        addedCount = window.addGeneratedQuestionsToQuizzes(result.generated_questions, stageId);
      }
      return { weakAreas: weakAreas, generated_questions: result.generated_questions, error: result.error, addedCount: addedCount };
    });
  };

})();

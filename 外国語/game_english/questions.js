const loadedQuestions = [
    {
        title: "【英語】チャットで見かける『lol』って何？",
        problem_statement: "海外プレイヤーがよく使う『lol』。正しい天秤に落とそう！",
        ui_mode: "SCALE",
        scale_left_text: "大笑い（わら）",
        scale_right_text: "がっかり（トホホ）",
        moving_object: { icon: "💬", name: "lol" },
        correct_direction: "left",
        useful_for: { title: "解説", description: "lolはLaughing Out Loudの略だよ！" },
        // 🃏 ドロップするカード情報（コモン）
        drop_card: { id: "card_lol", name: "ネット英語『lol』", rarity: "コモン", icon: "💬", color: "#94a3b8" }
    },
    {
        title: "【英語】試合終了時の挨拶『gg』を仕分けよう！",
        problem_statement: "ゲームが決着した瞬間にみんなが打ち込む『gg』。本来の正しい意味は？",
        ui_mode: "SCALE",
        scale_left_text: "Good Game（いい試合だった！）",
        scale_right_text: "Go Gold（金を奪え！）",
        moving_object: { icon: "🏆", name: "gg" },
        correct_direction: "left",
        useful_for: { title: "解説", description: "お互いの健闘をたたえ合う素晴らしい挨拶だよ！" },
        // 🃏 ドロップするカード情報（レア）
        drop_card: { id: "card_gg", name: "挨拶『gg』", rarity: "レア", icon: "🏆", color: "#38bdf8" }
    },
    {
        title: "【韓国語】チャットに流れる『ㅋㅋ』の意味は？",
        problem_statement: "韓国のプレイヤーがよくチャットに入力する『ㅋㅋ』。どんな感情かな？",
        ui_mode: "SCALE",
        scale_left_text: "クスクス（笑い声）",
        scale_right_text: "ぷんぷん（怒り）",
        moving_object: { icon: "🇰🇷", name: "ㅋㅋ" },
        correct_direction: "left",
        useful_for: { title: "解説", description: "韓国語の『ㅋ』は『ク』の音。笑い声のオノマトペだよ！" },
        // 🃏 ドロップするカード情報（神・ゴッドバズワード）
        drop_card: { id: "card_kr_lol", name: "韓国語『ㅋㅋ』", rarity: "神 (ゴッド)", icon: "👑", color: "#f59e0b" }
    }
];
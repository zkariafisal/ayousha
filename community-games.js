/**
 * عيون عيوشة — ألعاب المجتمع التفاعلية الثنائية المطورة
 * Balderdash (خمنها), Fibbage (كذبة مقنعة), Codenames (كلمات سرية),
 * Werewolf (ليلة الذئب), Resistance (المهمة السرية)
 *
 * تصميم متكامل 100% بنفس تنسيقات وثيم برنامج عيون عيوشة 🌸
 */

(function () {
  'use strict';

  // ==========================================
  // 1. التعريفات وقواعد الألعاب
  // ==========================================
  const GAMES = {
    balderdash: {
      id: 'balderdash',
      title: '🌀 خمنها — Balderdash',
      shortTitle: 'خمنها',
      badge: 'تعريفات وخداع',
      icon: '🌀',
      how: 'تظهر كلمة أو أداة غريبة نادرة. يكتب كل لاعب سراً تعريفاً وهمياً يبدو مقنعاً، ثم تُخلط الإجابات مع التعريف الحقيقي. يصوّت كل منكما لاكتشاف الحقيقة! تحصل على نقطتين (+2) إذا اخترت التعريف الحقيقي، ونقطة (+1) عن كل لاعب انخدع بتعريفك الوهمي.',
      desc: 'لعبة الخداع والذكاء اللغوي'
    },
    fibbage: {
      id: 'fibbage',
      title: '🤥 كذبة مقنعة — Fibbage',
      shortTitle: 'كذبة مقنعة',
      badge: 'حقائق وكذبات',
      icon: '🤥',
      how: 'يُعرض سؤال أو حقيقة واقعية غريبة تحتوي فراغاً. يكتب كل لاعب كذبة مقنعة لتعبئة الفراغ. بعد ذلك، تُعرض كل الخيارات عشوائياً بما فيها الإجابة الحقيقية الصادمة! صوّت للحق واخدع شريكك لكسب النقاط.',
      desc: 'أغرب الحقائق وأذكى الكذبات'
    },
    codenames: {
      id: 'codenames',
      title: '🕵️ كلمات سرية — Codenames',
      shortTitle: 'كلمات سرية',
      badge: 'أسماء رمزية',
      icon: '🕵️',
      how: 'لوحة من 25 كلمة غامضة. في كل جولة يكون أحدكما القائد (Spymaster) والآخر المخمّن (Operative). القائد يرى الألوان السرية ويعطي تلميحاً من كلمة واحدة ورقماً يدل على عدد كلماته. المخمّن يضغط الكلمات المستهدفة! احذروا الكلمة القاتلة 💀!',
      desc: 'تنسيق سري وتخمين ذكي'
    },
    werewolf: {
      id: 'werewolf',
      title: '🐺 ليلة الذئب — Werewolf',
      shortTitle: 'ليلة الذئب',
      badge: 'كشف المخادع',
      icon: '🐺',
      how: 'يوزع النظام الأدوار سراً (ذئب مخادع 🐺 مقابل قروي/محقق بريء 🔍). اقرؤوا السيناريو الغامض وناقشوا التفاصيل عبر الشات، ثم صوّتوا لتحديد من هو الذئب. يكسب المحقق إذا كشف الذئب، ويكسب الذئب إذا أفلت من الاتهام!',
      desc: 'غموض، شكوك، ومحاكمة سرية'
    },
    resistance: {
      id: 'resistance',
      title: '🎭 المهمة السرية — Resistance',
      shortTitle: 'المهمة السرية',
      badge: 'المقاومة والجاسوس',
      icon: '🎭',
      how: 'يوزع دور المقاومة 🛡️ والمخرّب 🦹 سراً. يقترح القائد تنفيذ المهمة ويصوّت اللاعبان بالموافقة أو الرفض. إذا قُبلت المهمة، يختار كل منكما سراً نتيجتها (نجاح أو تخريب). المخرّب وحده يستطيع التخريب، وتُكشف النتيجة النهائية دون كشف صاحب القرار!',
      desc: 'مهام سرية وشكوك ولع وفوز حاسم'
    }
  };

  // ==========================================
  // 2. دوال مساعدة والأدوار
  // ==========================================
  const esc = (v) => {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const getRole = () => {
    if (typeof window.MY_ROLE !== 'undefined' && window.MY_ROLE) return window.MY_ROLE;
    try {
      return localStorage.getItem('ayousha_role') || 'me';
    } catch {
      return 'me';
    }
  };

  const getOtherRole = () => (getRole() === 'me' ? 'her' : 'me');

  const getRoleName = (r) => {
    if (typeof window.senderName === 'function') {
      try {
        const name = window.senderName(r);
        if (name) return name;
      } catch {}
    }
    const myName = window.state?.settings?.myName || 'أنا';
    const herName = window.state?.settings?.wifeName || 'عيوشة';
    return r === 'me' ? myName : herName;
  };

  const getGameBank = (type) => {
    return (window.AYOUSHA_GAME_BANKS && window.AYOUSHA_GAME_BANKS[type]) || [];
  };

  const getSettings = (type) => {
    try {
      const saved = localStorage.getItem('ayousha-community-settings-' + type);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { rounds: 5, mode: 'standard' };
  };

  const saveSettings = (type, cfg) => {
    try {
      localStorage.setItem('ayousha-community-settings-' + type, JSON.stringify(cfg));
    } catch {}
  };

  const notifyPartner = (title, body, gameId) => {
    try {
      if (typeof window.addNotification === 'function') {
        window.addNotification(title, body, 'game', gameId);
      }
      if (window.ayoushaRealtime?.notify) {
        window.ayoushaRealtime.notify(title, body);
      }
    } catch {}
  };

  const triggerCelebration = () => {
    try {
      if (typeof window.burstHearts === 'function') window.burstHearts();
      if (typeof window.playEventSound === 'function') window.playEventSound('win');
      if (typeof window.addSharedHearts === 'function') window.addSharedHearts(5);
    } catch {}
  };

  const triggerPing = () => {
    try {
      if (typeof window.playEventSound === 'function') window.playEventSound('ping');
    } catch {}
  };

  // ==========================================
  // 3. طبقة المزامنة المتطورة (Firebase + Local/Tab Sync)
  // ==========================================
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ayousha_community_sync') : null;

  const storageKey = (t) => 'ayousha_game_state_' + t;
  const roomPath = (t) => 'games/community/' + t + '/room';

  const readState = async (type) => {
    // 1. Try Firebase Realtime Database
    try {
      if (window.ayoushaRealtime?.ready?.()) {
        const data = await window.ayoushaRealtime.read(roomPath(type));
        if (data && typeof data === 'object') return data;
      }
    } catch (e) {
      console.warn('Realtime DB read fallback to local state:', e);
    }
    // 2. Fallback to localStorage
    try {
      const local = localStorage.getItem(storageKey(type));
      if (local) return JSON.parse(local);
    } catch {}
    return null;
  };

  const writeState = async (type, data) => {
    // 1. LocalStorage + BroadcastChannel for instant local tab sync
    try {
      localStorage.setItem(storageKey(type), JSON.stringify(data));
      if (syncChannel) {
        syncChannel.postMessage({ type, data, fromRole: getRole(), timestamp: Date.now() });
      }
    } catch {}

    // 2. Firebase Realtime Database
    try {
      if (window.ayoushaRealtime?.ready?.()) {
        await window.ayoushaRealtime.write(roomPath(type), data);
      }
    } catch (e) {
      console.warn('Realtime DB write fallback:', e);
    }
  };

  const patchState = async (type, patch) => {
    const current = (await readState(type)) || {};
    const updated = { ...current, ...patch };
    await writeState(type, updated);
    return updated;
  };

  let activeGameListener = null;

  const listenState = (type, callback) => {
    if (activeGameListener) {
      try { activeGameListener(); } catch {}
      activeGameListener = null;
    }

    let unsubFirebase = null;
    try {
      if (window.ayoushaRealtime?.ready?.()) {
        unsubFirebase = window.ayoushaRealtime.listen(roomPath(type), (val) => {
          if (val && typeof val === 'object') {
            try { localStorage.setItem(storageKey(type), JSON.stringify(val)); } catch {}
            callback(val);
          }
        });
      }
    } catch {}

    const onChannelMsg = (ev) => {
      if (ev.data && ev.data.type === type && ev.data.data) {
        callback(ev.data.data);
      }
    };
    if (syncChannel) {
      syncChannel.addEventListener('message', onChannelMsg);
    }

    const onStorage = (ev) => {
      if (ev.key === storageKey(type) && ev.newValue) {
        try {
          callback(JSON.parse(ev.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    const cleanup = () => {
      if (unsubFirebase) try { unsubFirebase(); } catch {}
      if (syncChannel) syncChannel.removeEventListener('message', onChannelMsg);
      window.removeEventListener('storage', onStorage);
    };

    activeGameListener = cleanup;
    if (window._activeGameUnsub) try { window._activeGameUnsub(); } catch {}
    window._activeGameUnsub = cleanup;

    return cleanup;
  };

  function shuffled(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ==========================================
  // 4. بناء الغرف وتهيئة الجولات
  // ==========================================
  function pickQuestion(type, roundNum, mode) {
    const bank = getGameBank(type);
    if (!bank.length) return null;
    if (mode === 'random') {
      return bank[Math.floor(Math.random() * bank.length)];
    }
    return bank[((Math.max(1, roundNum) - 1) % bank.length)];
  }

  function createInitialState(type, cfg, existingState = null) {
    const round = (existingState?.round || 0) + 1;
    const scores = existingState?.scores || { me: 0, her: 0 };
    const mode = cfg.mode || 'standard';
    const maxRounds = cfg.rounds || 5;

    if (type === 'balderdash' || type === 'fibbage') {
      const item = pickQuestion(type, round, mode) || {
        q: type === 'balderdash' ? 'ما معنى كلمة «بَرهَف»؟' : 'لماذا مُنع شخص من دخول المكتبة؟',
        answer: 'إجابة نموذجية حقيقية',
        fake: ['احتمال تمويهي أول', 'احتمال تمويهي ثاني']
      };
      return {
        game: type,
        round,
        maxRounds,
        mode,
        status: 'writing',
        question: item.q,
        answer: item.answer,
        defaultFakes: item.fake || [],
        submissions: {},
        votes: {},
        scores,
        options: [],
        createdAt: Date.now()
      };
    }

    if (type === 'codenames') {
      const seed = pickQuestion(type, round, mode) || { clue: 'فضاء', words: ['قمر', 'مريخ', 'نجم', 'صاروخ'], targets: ['قمر', 'مريخ'] };
      const WORD_POOL = [
        'قمر', 'مريخ', 'نجم', 'بحر', 'مفتاح', 'خبز', 'مدار', 'صاروخ',
        'ملعقة', 'فرن', 'قدر', 'مجرة', 'قلم', 'طبق', 'وسادة', 'سكين',
        'غابة', 'نهر', 'وردة', 'جبل', 'حاسوب', 'مصباح', 'سحابة', 'كتاب',
        'شمس', 'باب', 'نافذة', 'حصان', 'مدينة', 'قطار', 'ساعة', 'مطر',
        'حديقة', 'ثلج', 'طائرة', 'مدرسة', 'سفينة', 'تفاحة', 'موسيقى', 'مرآة',
        'ذهب', 'قهوة', 'صحراء', 'جسر', 'فراشة', 'مظلة', 'كرسي', 'نخلة'
      ];
      const combined = shuffled([...new Set([...(seed.words || []), ...WORD_POOL])]).slice(0, 25);
      const targetWords = (seed.targets || []).filter(w => combined.includes(w));
      const red = [...targetWords];
      for (const w of combined) {
        if (red.length >= 7) break;
        if (!red.includes(w)) red.push(w);
      }
      const remain = combined.filter(w => !red.includes(w));
      const blue = shuffled(remain).slice(0, 5);
      const assassin = shuffled(remain.filter(w => !blue.includes(w)))[0] || remain[remain.length - 1];

      const key = {};
      red.forEach(w => (key[w] = 'red'));
      blue.forEach(w => (key[w] = 'blue'));
      if (assassin) key[assassin] = 'assassin';
      combined.forEach(w => { if (!key[w]) key[w] = 'neutral'; });

      return {
        game: 'codenames',
        round,
        maxRounds,
        mode,
        spymaster: round % 2 === 1 ? 'me' : 'her',
        status: 'playing',
        clue: seed.clue || 'تلميح سري',
        number: red.length,
        words: combined,
        key,
        revealed: {},
        scores,
        guessesRemaining: red.length + 1,
        createdAt: Date.now()
      };
    }

    if (type === 'werewolf') {
      const item = pickQuestion(type, round, mode) || {
        scenario: 'اختفى المفتاح السري من الغرفة بعد الغروب.',
        task: 'ناقشوا السيناريو وتعرفوا على الذئب المخادع.'
      };
      const rolesList = shuffled(['ذئب', 'قروي']);
      return {
        game: 'werewolf',
        round,
        maxRounds,
        mode,
        scenario: item.scenario,
        task: item.task,
        roles: { me: rolesList[0], her: rolesList[1] },
        status: 'discussion',
        votes: {},
        scores,
        result: '',
        createdAt: Date.now()
      };
    }

    if (type === 'resistance') {
      const item = pickQuestion(type, round, mode) || {
        mission: 'نقل خريطة سرية إلى محطة القطار وتأمين الطريق.',
        task: 'صوّتوا على قبول المهمة ثم نفذوها سراً.'
      };
      const rolesList = shuffled(['مقاومة', 'مخرّب']);
      return {
        game: 'resistance',
        round,
        maxRounds,
        mode,
        mission: item.mission,
        task: item.task,
        roles: { me: rolesList[0], her: rolesList[1] },
        leader: round % 2 === 1 ? 'me' : 'her',
        phase: 'proposal',
        status: 'playing',
        votes: {},
        actions: {},
        scores,
        result: '',
        createdAt: Date.now()
      };
    }

    return { game: type, round, maxRounds, scores, status: 'playing' };
  }

  // ==========================================
  // 5. واجهات النوافذ المودال المشتركة
  // ==========================================
  function renderHeader(type, state) {
    const meta = GAMES[type] || { title: 'اللعبة', icon: '🎮' };
    const myRole = getRole();
    const otherRole = getOtherRole();
    const myName = getRoleName(myRole);
    const otherName = getRoleName(otherRole);

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <h3 style="margin:0;font-size:1.15rem;color:var(--primary);display:flex;align-items:center;gap:6px;">
            <span>${meta.icon}</span> <span>${meta.title}</span>
          </h3>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="btn btn-soft" style="padding:4px 9px;font-size:.78rem;" onclick="window.showGameSettings('${type}')" title="إعدادات الجولات">⚙️</button>
          <button class="btn btn-soft" style="padding:4px 9px;font-size:.78rem;" onclick="window.resetCommunityGame('${type}')" title="تصفير اللعبة">🔄</button>
        </div>
      </div>

      <!-- شريط معلومات الجولة والنقاط وتحديد الدور -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,rgba(216,27,96,0.06),rgba(212,175,117,0.12));border:1px solid var(--border);border-radius:14px;padding:8px 12px;margin-bottom:12px;font-size:.82rem;flex-wrap:wrap;gap:6px;">
        <div>
          <span>🏆 <b>${myName}:</b> ${state?.scores?.me || 0}</span>
          <span style="margin:0 6px;color:var(--border);">|</span>
          <span><b>${otherName}:</b> ${state?.scores?.her || 0}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span>🎯 الجولة <b>${state?.round || 1}</b> / ${state?.maxRounds || 5}</span>
          <button class="btn btn-soft" style="padding:2px 7px;font-size:.72rem;background:#fff;" onclick="window.toggleCommunityRole('${type}')" title="تبديل هوية الجهاز لأغراض التجربة">
            👤 ${myName} (بدّل)
          </button>
        </div>
      </div>
    `;
  }

  function renderFooter(type) {
    const inlineChat = window.renderGameChatUI ? window.renderGameChatUI('games/community/' + type) : '';
    return `
      ${inlineChat}
      <div style="margin-top:12px;">
        <button class="btn btn-soft btn-full" onclick="window.closeModal()">إغلاق</button>
      </div>
    `;
  }

  function renderHowToPlay(type) {
    const meta = GAMES[type];
    if (!meta) return '';
    return `
      <details class="v9-panel" style="margin:8px 0;padding:8px 12px;cursor:pointer;">
        <summary style="font-weight:bold;color:var(--primary);font-size:.85rem;">📘 طريقة اللعب وقواعد النقاط</summary>
        <p style="margin-top:6px;font-size:.84rem;line-height:1.7;color:var(--text);">${esc(meta.how)}</p>
      </details>
    `;
  }

  // ==========================================
  // 6. منطق وشاشات كل لعبة
  // ==========================================

  // ---------- 1 & 2: Balderdash & Fibbage ----------
  function renderTextGame(type, state) {
    const myRole = getRole();
    const otherRole = getOtherRole();
    const myName = getRoleName(myRole);
    const otherName = getRoleName(otherRole);

    const sub = state.submissions || {};
    const mySub = sub[myRole];
    const otherSub = sub[otherRole];
    const votes = state.votes || {};
    const myVote = votes[myRole];
    const otherVote = votes[otherRole];

    let body = '';

    if (state.status === 'writing') {
      if (!mySub) {
        body = `
          <div class="v9-panel" style="text-align:center;">
            <div style="font-size:.82rem;color:var(--muted);margin-bottom:4px;">${type === 'balderdash' ? 'الكلمة أو الأداة الغامضة:' : 'السؤال / الحقيقة الغريبة:'}</div>
            <div style="font-size:1.15rem;font-weight:bold;color:#ad1457;">${esc(state.question)}</div>
          </div>
          <div style="margin:14px 0;">
            <label style="font-size:.85rem;font-weight:600;display:block;margin-bottom:6px;">
              🎭 ${type === 'balderdash' ? 'اكتب تعريفاً خيالياً يبدو حقيقياً ومقنعاً:' : 'اكتب إجابة كاذبة تبدو مقنعة لخداع ' + otherName + ':'}
            </label>
            <textarea id="cgTextInput" class="answer-input" rows="3" maxlength="350" placeholder="${type === 'balderdash' ? 'مثال: أداة قديمة لقياس رطوبة الهواء...' : 'مثال: لأنه أحضر قطة صغيرة معه...'}" style="width:100%;padding:10px 12px;border-radius:14px;border:1px solid var(--border);font-family:inherit;font-size:.95rem;"></textarea>
            <button id="cgSubmitBtn" class="btn btn-primary btn-full" style="margin-top:10px;">🚀 إرسال التمويه الذكي</button>
          </div>
        `;
      } else {
        body = `
          <div class="v9-panel" style="text-align:center;">
            <div style="font-size:.82rem;color:var(--muted);margin-bottom:4px;">${type === 'balderdash' ? 'الكلمة الغامضة:' : 'السؤال الغريب:'}</div>
            <div style="font-size:1.15rem;font-weight:bold;color:#ad1457;">${esc(state.question)}</div>
          </div>
          <div class="v9-panel" style="background:#fff8e1;border-color:#ffe082;color:#6d4c41;text-align:center;padding:16px;">
            <div style="font-size:1.2rem;margin-bottom:6px;">🔒 تم إرسال تمويهك بنجاح!</div>
            <p style="margin:0;font-size:.92rem;">"<b>${esc(mySub)}</b>"</p>
            <div style="margin-top:10px;font-size:.84rem;color:#8d6e63;">
              ${otherSub ? '✅ الطرف الآخر أرسل تمويهه أيضاً! جارٍ تجهيز الخيارات...' : '⏳ بانتظار أن يكتب <b>' + otherName + '</b> تمويهه لاكتمال مرحلة التصويت...'}
            </div>
          </div>
        `;
      }
    } else if (state.status === 'voting') {
      const opts = state.options || [];
      body = `
        <div class="v9-panel" style="text-align:center;">
          <div style="font-size:.82rem;color:var(--muted);">${type === 'balderdash' ? 'الكلمة المطلوبة:' : 'السؤال:'}</div>
          <div style="font-size:1.1rem;font-weight:bold;color:#ad1457;">${esc(state.question)}</div>
        </div>

        <p style="font-size:.88rem;color:var(--muted);margin:8px 0 10px;">
          🎯 <b>اختر الإجابة التي تعتقد أنها الحقيقة:</b>
        </p>

        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
          ${opts.map((opt, idx) => {
            const isMine = (opt.owner === myRole);
            const isSelected = (myVote === idx);
            let btnStyle = 'justify-content:flex-start;text-align:right;padding:12px;border-radius:14px;';
            if (isSelected) btnStyle += 'background:linear-gradient(135deg,#d81b60,#ad1457);color:#fff;border-color:transparent;';
            return `
              <button class="btn btn-soft" style="${btnStyle}" data-cg-vote="${idx}" ${isMine || myVote !== undefined ? 'disabled' : ''}>
                ${isMine ? '🔒 (تمويهك) ' : isSelected ? '👉 ' : '🔘 '} ${esc(opt.text)}
              </button>
            `;
          }).join('')}
        </div>

        <div class="v9-panel" style="font-size:.84rem;text-align:center;">
          <span>تصويتك: ${myVote !== undefined ? '✅ تم الاختيار' : '⏳ لم تختر بعد'}</span>
          <span style="margin:0 8px;">·</span>
          <span>${otherName}: ${otherVote !== undefined ? '✅ صوّت' : '⏳ بانتظاره'}</span>
        </div>
      `;
    } else if (state.status === 'finished') {
      const myPoints = state.scores?.[myRole] || 0;
      const otherPoints = state.scores?.[otherRole] || 0;
      const opts = state.options || [];
      const myChoice = opts[myVote];
      const otherChoice = opts[otherVote];

      const iWasCorrect = myChoice?.correct;
      const otherWasCorrect = otherChoice?.correct;
      const otherTrickedByMe = (otherChoice?.owner === myRole);
      const iWasTrickedByOther = (myChoice?.owner === otherRole);

      body = `
        <div class="v9-panel" style="background:#f1f8e9;border-color:#c8e6c9;color:#2e7d32;text-align:center;">
          <div style="font-size:1.15rem;font-weight:bold;margin-bottom:4px;">🌟 الحقيقة الصحيحة:</div>
          <div style="font-size:1rem;color:#1b5e20;">"<b>${esc(state.answer)}</b>"</div>
        </div>

        <div class="v9-panel" style="font-size:.88rem;line-height:1.8;">
          <div><b>نتيجة اختيارك:</b> ${iWasCorrect ? '🎉 أصبت الحقيقة! (+2 نقطة)' : iWasTrickedByOther ? '😅 انخدعت بتمويه ' + otherName + '!' : 'لم تختر الإجابة الصحيحة.'}</div>
          <div><b>نتيجة تمويهك:</b> ${otherTrickedByMe ? '🎭 رائع! انخدع ' + otherName + ' بتمويهك الذكي (+1 نقطة)' : 'لم ينخدع الشريك بتمويهك هذه المرة.'}</div>
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;">
          <button id="cgNextRoundBtn" class="btn btn-primary btn-full">
            ${(state.round || 1) >= (state.maxRounds || 5) ? '🏁 عرض النتيجة النهائية' : 'الجولة التالية ▶'}
          </button>
        </div>
      `;
    }

    return `
      ${renderHeader(type, state)}
      ${renderHowToPlay(type)}
      <div id="cgGameBody">${body}</div>
      ${renderFooter(type)}
    `;
  }

  // ---------- 3: Codenames (كلمات سرية) ----------
  function renderCodenames(state) {
    const myRole = getRole();
    const otherRole = getOtherRole();
    const myName = getRoleName(myRole);
    const otherName = getRoleName(otherRole);
    const isSpymaster = (state.spymaster === myRole);
    const words = state.words || [];
    const revealed = state.revealed || {};
    const key = state.key || {};

    let actionsHtml = '';
    if (state.status === 'playing') {
      if (isSpymaster) {
        actionsHtml = `
          <div class="v9-panel" style="background:#fff3e0;border-color:#ffe0b2;color:#e65100;font-size:.86rem;">
            <b>🕵️ أنت القائد (Spymaster) في هذه الجولة:</b><br>
            الألوان السرية ظاهرة لك وحدك في الأسفل:
            <span style="color:#c62828;">● أحمر (كلماتكم المستهدفة)</span> ·
            <span style="color:#1565c0;">● أزرق (الخصم)</span> ·
            <span style="color:#212121;">● أسود (القاتلة 💀)</span>.<br>
            أرسل تلميحاً وعدد الكلمات لـ <b>${otherName}</b>:
          </div>
          <div style="display:flex;gap:8px;margin:10px 0;">
            <input id="cgClueInput" placeholder="التلميح (مثال: فضاء)" value="${esc(state.clue || '')}" style="flex:2;padding:9px 12px;border-radius:12px;border:1px solid var(--border);font-family:inherit;">
            <input id="cgNumInput" type="number" min="1" max="9" value="${state.number || 2}" style="flex:1;padding:9px 12px;border-radius:12px;border:1px solid var(--border);font-family:inherit;">
            <button id="cgUpdateClueBtn" class="btn btn-primary" style="flex:2;">📢 إرسال</button>
          </div>
        `;
      } else {
        actionsHtml = `
          <div class="v9-panel" style="background:#e8eaf6;border-color:#c5cae9;color:#283593;font-size:.88rem;text-align:center;">
            <b>🔍 أنت المخمّن (Operative):</b><br>
            تلميح القائد: <b style="font-size:1.1rem;color:#1a237e;">"${esc(state.clue || 'بانتظار التلميح')}"</b> (العدد: <b>${state.number || 0}</b>)<br>
            اضغط الكلمات المرتبطة بالتلميح. احذر من الكلمة القاتلة!
          </div>
        `;
      }
    } else {
      actionsHtml = `
        <div class="v9-panel" style="background:#fce4ec;color:#880e4f;text-align:center;">
          <div style="font-size:1.1rem;font-weight:bold;margin-bottom:4px;">${esc(state.result || 'انتهت الجولة!')}</div>
          <button id="cgNextRoundBtn" class="btn btn-primary" style="margin-top:8px;">▶ بدء جولة جديدة وتبديل القائد</button>
        </div>
      `;
    }

    const boardHtml = words.map(w => {
      const isRev = !!revealed[w];
      const kind = key[w] || 'neutral';

      let bg = '#fff';
      let fg = '#33242d';
      let border = '1px solid var(--border)';

      if (isRev) {
        if (kind === 'red') { bg = 'linear-gradient(135deg,#e53935,#c62828)'; fg = '#fff'; border = 'none'; }
        else if (kind === 'blue') { bg = 'linear-gradient(135deg,#1e88e5,#1565c0)'; fg = '#fff'; border = 'none'; }
        else if (kind === 'assassin') { bg = '#212121'; fg = '#fff'; border = 'none'; }
        else { bg = '#e0e0e0'; fg = '#757575'; }
      } else if (isSpymaster) {
        if (kind === 'red') { bg = '#ffebee'; fg = '#c62828'; border = '2px solid #ef9a9a'; }
        else if (kind === 'blue') { bg = '#e3f2fd'; fg = '#1565c0'; border = '2px solid #90caf9'; }
        else if (kind === 'assassin') { bg = '#424242'; fg = '#fff'; border = '2px solid #212121'; }
        else { bg = '#fafafa'; fg = '#616161'; border = '1px dashed #bdbdbd'; }
      }

      const disabled = (isRev || state.status !== 'playing' || isSpymaster);
      return `
        <button class="btn" data-cg-word="${esc(w)}" ${disabled ? 'disabled' : ''} style="background:${bg};color:${fg};border:${border};padding:8px 4px;border-radius:12px;font-size:.82rem;font-weight:600;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.04);word-break:break-word;">
          <span>${esc(w)}</span>
          ${isRev ? '<span style="font-size:.7rem;margin-top:2px;">✓ مكشوفة</span>' : ''}
        </button>
      `;
    }).join('');

    return `
      ${renderHeader('codenames', state)}
      ${renderHowToPlay('codenames')}
      ${actionsHtml}
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0;">
        ${boardHtml}
      </div>
      ${renderFooter('codenames')}
    `;
  }

  // ---------- 4: Werewolf (ليلة الذئب) ----------
  function renderWerewolf(state) {
    const myRole = getRole();
    const otherRole = getOtherRole();
    const myName = getRoleName(myRole);
    const otherName = getRoleName(otherRole);

    const secretRole = state.roles?.[myRole] || 'قروي';
    const isWolf = (secretRole === 'ذئب');
    const myVote = state.votes?.[myRole];
    const otherVote = state.votes?.[otherRole];

    let content = '';

    if (state.status === 'discussion') {
      content = `
        <div class="v9-panel" style="text-align:center;">
          <div style="font-size:.82rem;color:var(--muted);margin-bottom:4px;">📜 سيناريو اللغز في القرية:</div>
          <div style="font-size:1.05rem;font-weight:bold;color:#ad1457;line-height:1.7;">${esc(state.scenario)}</div>
        </div>

        <!-- بطاقة الدور السري مع خاصية الحماية البصرية -->
        <div class="v9-panel" style="background:#263238;color:#eceff1;text-align:center;padding:14px;border-radius:18px;">
          <div style="font-size:.82rem;color:#b0bec5;margin-bottom:6px;">🔐 دورك السري لهذه الجولة (احفظه سراً):</div>
          <div id="cgSecretRoleBox" onclick="this.classList.toggle('revealed')" style="cursor:pointer;padding:10px;background:rgba(255,255,255,0.08);border-radius:12px;user-select:none;">
            <span class="role-blur" style="font-size:1.25rem;font-weight:bold;color:${isWolf ? '#ff5252' : '#69f0ae'};">
              ${isWolf ? '🐺 أنت الذئب المخادع' : '🔍 أنت القروي / المحقق'}
            </span>
            <div style="font-size:.76rem;color:#90a4ae;margin-top:4px;">(انقر لإخفاء / إظهار الدور)</div>
          </div>
          <p style="font-size:.82rem;margin-top:8px;color:#cfd8dc;">
            ${isWolf ? 'هدفك: تضليل ' + otherName + ' وإقناعه ببراءتك دون أن يكتشفك!' : 'هدفك: كشف التناقضات ومعرفة إن كان ' + otherName + ' هو الذئب!'}
          </p>
        </div>

        <!-- التصويت السري -->
        <div style="margin:14px 0;">
          <p style="font-size:.88rem;font-weight:600;margin-bottom:8px;">🗳️ صوّت سراً: من تعتقد أنه الذئب؟</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button class="btn btn-soft" data-cg-wolf="me" ${myVote ? 'disabled' : ''} style="${myVote === 'me' ? 'background:var(--primary);color:#fff;' : ''}">
              أنا هو الذئب
            </button>
            <button class="btn btn-soft" data-cg-wolf="her" ${myVote ? 'disabled' : ''} style="${myVote === 'her' ? 'background:var(--primary);color:#fff;' : ''}">
              ${otherName} هو الذئب
            </button>
          </div>
          <div class="v9-panel" style="font-size:.82rem;text-align:center;margin-top:10px;">
            تصويتك: ${myVote ? '✅ تم الإرسال' : '⏳ بانتظار تصويتك'} · ${otherName}: ${otherVote ? '✅ صوّت' : '⏳ يناقش'}
          </div>
        </div>
      `;
    } else {
      content = `
        <div class="v9-panel" style="background:#fff3e0;border-color:#ffe0b2;color:#e65100;text-align:center;padding:16px;">
          <div style="font-size:1.2rem;font-weight:bold;margin-bottom:6px;">🏁 كشف الأدوار والنتيجة</div>
          <p style="font-size:.95rem;margin:6px 0;">${esc(state.result)}</p>
          <div style="font-size:.86rem;color:#795548;margin-top:8px;">
            أنت كنت: <b>${state.roles?.me || ''}</b> · ${otherName} كان: <b>${state.roles?.her || ''}</b>
          </div>
        </div>
        <button id="cgNextRoundBtn" class="btn btn-primary btn-full" style="margin-top:10px;">
          ${(state.round || 1) >= (state.maxRounds || 5) ? '🏁 انتهاء المباراة' : 'الجولة التالية ▶'}
        </button>
      `;
    }

    return `
      ${renderHeader('werewolf', state)}
      ${renderHowToPlay('werewolf')}
      ${content}
      ${renderFooter('werewolf')}
    `;
  }

  // ---------- 5: Resistance (المهمة السرية) ----------
  function renderResistance(state) {
    const myRole = getRole();
    const otherRole = getOtherRole();
    const myName = getRoleName(myRole);
    const otherName = getRoleName(otherRole);

    const secretRole = state.roles?.[myRole] || 'مقاومة';
    const isSpy = (secretRole === 'مخرّب');
    const myVote = state.votes?.[myRole];
    const otherVote = state.votes?.[otherRole];
    const myAction = state.actions?.[myRole];
    const otherAction = state.actions?.[otherRole];
    const isLeader = (state.leader === myRole);

    let content = '';

    if (state.status === 'playing') {
      content = `
        <div class="v9-panel" style="text-align:center;">
          <div style="font-size:.82rem;color:var(--muted);margin-bottom:4px;">🎯 المهمة المقترحة:</div>
          <div style="font-size:1.05rem;font-weight:bold;color:#ad1457;">${esc(state.mission)}</div>
          <div style="font-size:.84rem;margin-top:6px;">قائد المهمة الحالي: <b>${isLeader ? 'أنت (' + myName + ')' : otherName}</b></div>
        </div>

        <!-- كرت الدور السري -->
        <div class="v9-panel" style="background:#1a237e;color:#e8eaf6;text-align:center;padding:12px;border-radius:18px;">
          <div style="font-size:.8rem;color:#9fa8da;margin-bottom:4px;">🔐 دورك السري:</div>
          <div id="cgSecretRoleBox" onclick="this.classList.toggle('revealed')" style="cursor:pointer;padding:8px;background:rgba(255,255,255,0.08);border-radius:12px;">
            <span class="role-blur" style="font-size:1.2rem;font-weight:bold;color:${isSpy ? '#ff8a80' : '#80d8ff'};">
              ${isSpy ? '🦹 أنت المخرّب (الجاسوس)' : '🛡️ أنت عميل المقاومة الصالح'}
            </span>
            <div style="font-size:.74rem;color:#c5cae9;margin-top:4px;">(انقر لإظهار / إخفاء الدور)</div>
          </div>
        </div>
      `;

      if (state.phase === 'proposal') {
        content += `
          <div style="margin:14px 0;">
            <p style="font-size:.88rem;font-weight:600;margin-bottom:8px;">🗳️ المرحلة 1: التصويت على قبول فريق المهمة</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <button class="btn btn-primary" data-cg-approve="yes" ${myVote ? 'disabled' : ''}>
                ✅ قبول الفريق
              </button>
              <button class="btn btn-soft" data-cg-approve="no" ${myVote ? 'disabled' : ''}>
                ❌ رفض الفريق
              </button>
            </div>
            <div class="v9-panel" style="font-size:.82rem;text-align:center;margin-top:10px;">
              صوتك: ${myVote ? (myVote === 'yes' ? '✅ قبول' : '❌ رفض') : '⏳ بانتظار تصويتك'} · ${otherName}: ${otherVote ? '✅ صوّت' : '⏳ يفكر'}
            </div>
          </div>
        `;
      } else {
        content += `
          <div style="margin:14px 0;">
            <p style="font-size:.88rem;font-weight:600;margin-bottom:8px;">⚡ المرحلة 2: تنفيذ المهمة سراً</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <button class="btn btn-primary" data-cg-mission="success" ${myAction ? 'disabled' : ''} style="background:linear-gradient(135deg,#2e7d32,#1b5e20);">
                🟢 نجاح المهمة
              </button>
              <button class="btn btn-soft" data-cg-mission="fail" ${myAction || !isSpy ? 'disabled' : ''} style="${!isSpy ? 'opacity:0.4;cursor:not-allowed;' : 'background:#ffebee;color:#c62828;'}">
                🔴 تخريب المهمة ${!isSpy ? '(للمخرّب فقط)' : ''}
              </button>
            </div>
            <div class="v9-panel" style="font-size:.82rem;text-align:center;margin-top:10px;">
              قرارك: ${myAction ? '✅ تم إرسال بطاقتك سراً' : '⏳ بانتظار بطاقتك'} · ${otherName}: ${otherAction ? '✅ أرسل بطاقته' : '⏳ يقرر'}
            </div>
          </div>
        `;
      }
    } else {
      content = `
        <div class="v9-panel" style="background:#ede7f6;border-color:#d1c4e9;color:#4a148c;text-align:center;padding:16px;">
          <div style="font-size:1.2rem;font-weight:bold;margin-bottom:6px;">🏁 نتيجة المهمة</div>
          <p style="font-size:.95rem;margin:6px 0;">${esc(state.result)}</p>
        </div>
        <button id="cgNextRoundBtn" class="btn btn-primary btn-full" style="margin-top:10px;">
          ${(state.round || 1) >= (state.maxRounds || 5) ? '🏁 انتهاء المباراة' : 'الجولة التالية ▶'}
        </button>
      `;
    }

    return `
      ${renderHeader('resistance', state)}
      ${renderHowToPlay('resistance')}
      ${content}
      ${renderFooter('resistance')}
    `;
  }

  // ==========================================
  // 7. ربط الأحداث وإدارة الانتقالات
  // ==========================================
  function bindGameEvents(type, state) {
    const myRole = getRole();
    const otherRole = getOtherRole();

    // 1. Text games (Balderdash & Fibbage)
    const textInput = document.getElementById('cgTextInput');
    const submitBtn = document.getElementById('cgSubmitBtn');
    if (submitBtn && textInput) {
      submitBtn.onclick = async () => {
        const val = textInput.value.trim();
        if (!val) {
          if (window.toast) window.toast('اكتب إجابتك أو تعريفك أولاً ✍️');
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'جارٍ الإرسال...';

        const current = (await readState(type)) || state;
        const subs = { ...(current.submissions || {}), [myRole]: val };

        let nextStatus = current.status;
        let options = current.options || [];

        // Check if both submitted
        if (subs.me && subs.her) {
          nextStatus = 'voting';
          const rawOptions = [
            { text: current.answer, correct: true, owner: null },
            { text: subs.me, correct: false, owner: 'me' },
            { text: subs.her, correct: false, owner: 'her' },
            ...(current.defaultFakes || []).slice(0, 1).map(t => ({ text: t, correct: false, owner: null }))
          ];
          // Remove duplicate text and shuffle
          options = shuffled(rawOptions.filter((item, idx, self) => idx === self.findIndex(t => t.text === item.text)));
        }

        await patchState(type, { submissions: subs, status: nextStatus, options, votes: {} });
        triggerPing();
        notifyPartner('🎭 إجابة جديدة في ' + (GAMES[type]?.shortTitle || ''), 'أرسل الشريك إجابته التمويهية!', type);
      };
    }

    // Voting buttons for Text games
    document.querySelectorAll('[data-cg-vote]').forEach(btn => {
      btn.onclick = async () => {
        const voteIdx = Number(btn.dataset.cgVote);
        const current = (await readState(type)) || state;
        if (current.status !== 'voting' || current.votes?.[myRole] !== undefined) return;

        const votes = { ...(current.votes || {}), [myRole]: voteIdx };
        let nextStatus = current.status;
        let scores = { ...(current.scores || { me: 0, her: 0 }) };

        // If both voted, calculate scores and finish round
        if (votes.me !== undefined && votes.her !== undefined) {
          nextStatus = 'finished';
          for (const r of ['me', 'her']) {
            const chosen = current.options[votes[r]];
            if (chosen?.correct) scores[r] = (scores[r] || 0) + 2;
            const opp = (r === 'me' ? 'her' : 'me');
            if (current.options[votes[opp]]?.owner === r) scores[r] = (scores[r] || 0) + 1;
          }
          triggerCelebration();
        } else {
          triggerPing();
        }

        await patchState(type, { votes, status: nextStatus, scores });
      };
    });

    // 2. Codenames
    const clueBtn = document.getElementById('cgUpdateClueBtn');
    if (clueBtn) {
      clueBtn.onclick = async () => {
        const clue = document.getElementById('cgClueInput')?.value.trim();
        const num = Number(document.getElementById('cgNumInput')?.value) || 1;
        if (!clue) {
          if (window.toast) window.toast('اكتب تلميحاً للكلمات أولاً 💡');
          return;
        }
        await patchState('codenames', { clue, number: num });
        triggerPing();
        notifyPartner('🕵️ تلميح جديد في كلمات سرية!', `أرسل القائد تلميح: "${clue}" (${num})`, 'codenames');
      };
    }

    document.querySelectorAll('[data-cg-word]').forEach(btn => {
      btn.onclick = async () => {
        const word = btn.dataset.cgWord;
        const current = (await readState('codenames')) || state;
        if (current.status !== 'playing' || current.revealed?.[word]) return;

        const revealed = { ...(current.revealed || {}), [word]: true };
        const kind = current.key?.[word];
        let status = 'playing';
        let result = '';
        let scores = { ...(current.scores || { me: 0, her: 0 }) };

        if (kind === 'assassin') {
          status = 'finished';
          result = '💀 اخترتم الكلمة القاتلة! انتهت الجولة بالخسارة.';
          triggerPing();
        } else if (kind === 'red') {
          const redFound = Object.keys(revealed).filter(w => current.key[w] === 'red').length;
          scores[myRole] = (scores[myRole] || 0) + 1;
          if (redFound >= current.number) {
            status = 'finished';
            result = '🎉 فوز رائع! كشفتم جميع الكلمات المستهدفة بنجاح!';
            triggerCelebration();
          } else {
            triggerPing();
          }
        } else if (kind === 'blue') {
          status = 'finished';
          result = 'اخترتم كلمة الفريق الخصم؛ انتهت محاولات التخمين.';
          triggerPing();
        } else {
          status = 'finished';
          result = 'كلمة محايدة؛ انتهت محاولة التخمين لهذه الجولة.';
          triggerPing();
        }

        await patchState('codenames', { revealed, status, result, scores });
      };
    });

    // 3. Werewolf
    document.querySelectorAll('[data-cg-wolf]').forEach(btn => {
      btn.onclick = async () => {
        const chosen = btn.dataset.cgWolf;
        const current = (await readState('werewolf')) || state;
        if (current.votes?.[myRole]) return;

        const votes = { ...(current.votes || {}), [myRole]: chosen };
        let status = current.status;
        let result = '';
        let scores = { ...(current.scores || { me: 0, her: 0 }) };

        if (votes.me && votes.her) {
          status = 'finished';
          const wolfRole = (current.roles?.me === 'ذئب' ? 'me' : 'her');
          const myCorrect = (votes.me === wolfRole);
          const otherCorrect = (votes.her === wolfRole);

          if (myCorrect) scores.me = (scores.me || 0) + 2;
          if (otherCorrect) scores.her = (scores.her || 0) + 2;

          // If wolf wasn't caught by the villager
          const villagerRole = (wolfRole === 'me' ? 'her' : 'me');
          if (votes[villagerRole] !== wolfRole) {
            scores[wolfRole] = (scores[wolfRole] || 0) + 1;
          }

          const wolfName = getRoleName(wolfRole);
          result = `الذئب الحقيقي كان: ${wolfName}! ${myCorrect || otherCorrect ? 'تم كشف المخادع واحتساب النقاط.' : 'أفلت الذئب من الاتهام!'}`;
          triggerCelebration();
        } else {
          triggerPing();
        }

        await patchState('werewolf', { votes, status, result, scores });
      };
    });

    // 4. Resistance
    document.querySelectorAll('[data-cg-approve]').forEach(btn => {
      btn.onclick = async () => {
        const val = btn.dataset.cgApprove;
        const current = (await readState('resistance')) || state;
        if (current.votes?.[myRole]) return;

        const votes = { ...(current.votes || {}), [myRole]: val };
        let phase = current.phase;
        let status = current.status;
        let result = '';

        if (votes.me && votes.her) {
          if (votes.me === 'yes' && votes.her === 'yes') {
            phase = 'mission';
          } else {
            status = 'finished';
            result = 'رُفض فريق المهمة؛ تتقدم اللعبة إلى الجولة التالية دون تنفيذ.';
          }
          triggerPing();
        }

        await patchState('resistance', { votes, phase, status, result });
      };
    });

    document.querySelectorAll('[data-cg-mission]').forEach(btn => {
      btn.onclick = async () => {
        const val = btn.dataset.cgMission;
        const current = (await readState('resistance')) || state;
        if (current.actions?.[myRole]) return;

        const actions = { ...(current.actions || {}), [myRole]: val };
        let status = current.status;
        let result = '';
        let scores = { ...(current.scores || { me: 0, her: 0 }) };

        if (actions.me && actions.her) {
          status = 'finished';
          const hasSabotage = (actions.me === 'fail' || actions.her === 'fail');
          if (hasSabotage) {
            result = '💥 فشلت المهمة! وُجدت بطاقة تخريب في الصندوق السري.';
            if (current.roles?.me === 'مخرّب') scores.me = (scores.me || 0) + 2;
            if (current.roles?.her === 'مخرّب') scores.her = (scores.her || 0) + 2;
          } else {
            result = '🎉 نجحت المهمة بامتياز! جميع البطاقات كانت نجاحاً.';
            if (current.roles?.me === 'مقاومة') scores.me = (scores.me || 0) + 1;
            if (current.roles?.her === 'مقاومة') scores.her = (scores.her || 0) + 1;
            triggerCelebration();
          }
        } else {
          triggerPing();
        }

        await patchState('resistance', { actions, status, result, scores });
      };
    });

    // 5. Next round button
    const nextBtn = document.getElementById('cgNextRoundBtn');
    if (nextBtn) {
      nextBtn.onclick = async () => {
        const current = (await readState(type)) || state;
        const cfg = getSettings(type);
        if ((current.round || 1) >= (current.maxRounds || cfg.rounds || 5)) {
          if (window.toast) window.toast('انتهت المباراة! يمكنك تصفير اللعبة للبدء مجدداً 🏆');
          return;
        }
        const next = createInitialState(type, cfg, current);
        await writeState(type, next);
        triggerPing();
      };
    }
  }

  // ==========================================
  // 8. الدالة الرئيسية لفتح الألعاب
  // ==========================================
  window.openCommunityGame = async function (type) {
    if (!GAMES[type]) {
      console.warn('Unknown community game type:', type);
      return;
    }

    const cfg = getSettings(type);
    let state = await readState(type);
    if (!state || !state.game || state.game !== type) {
      state = createInitialState(type, cfg, null);
      await writeState(type, state);
    }

    const render = (currentState) => {
      let html = '';
      if (type === 'balderdash' || type === 'fibbage') {
        html = renderTextGame(type, currentState);
      } else if (type === 'codenames') {
        html = renderCodenames(currentState);
      } else if (type === 'werewolf') {
        html = renderWerewolf(currentState);
      } else if (type === 'resistance') {
        html = renderResistance(currentState);
      }

      if (window.openModal) {
        window.openModal(html);
        bindGameEvents(type, currentState);
        if (window.listenGameInlineChat) {
          window.listenGameInlineChat('games/community/' + type);
        }
      }
    };

    render(state);
    listenState(type, render);
  };

  // Alias for compatibility
  window.launchCommunityGameModal = window.openCommunityGame;
  window.openBalderdashGame = () => window.openCommunityGame('balderdash');
  window.openFibbageGame = () => window.openCommunityGame('fibbage');
  window.openCodenamesGame = () => window.openCommunityGame('codenames');
  window.openWerewolfGame = () => window.openCommunityGame('werewolf');
  window.openResistanceGame = () => window.openCommunityGame('resistance');

  // تبديل هوية الدور لأغراض التجربة المحلية
  window.toggleCommunityRole = function (type) {
    const cur = getRole();
    const next = (cur === 'me' ? 'her' : 'me');
    try {
      localStorage.setItem('ayousha_role', next);
      window.MY_ROLE = next;
    } catch {}
    if (window.toast) window.toast('تم تبديل الدور إلى: ' + getRoleName(next));
    window.openCommunityGame(type);
  };

  // تصفير اللعبة
  window.resetCommunityGame = async function (type) {
    const cfg = getSettings(type);
    const fresh = createInitialState(type, cfg, null);
    await writeState(type, fresh);
    if (window.toast) window.toast('🔄 تم تصفير اللعبة وبدء مباراة جديدة!');
    window.openCommunityGame(type);
  };

  // نافذة الإعدادات
  window.showGameSettings = function (type) {
    const meta = GAMES[type] || { title: 'إعدادات اللعبة' };
    const cur = getSettings(type);

    const html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0;color:var(--primary);">⚙️ إعدادات ${meta.shortTitle || meta.title}</h3>
      </div>
      <div class="v9-panel">
        <label style="font-weight:bold;display:block;margin-bottom:4px;">عدد الجولات:</label>
        <select id="cfgRoundsSelect" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--border);margin-bottom:12px;">
          <option value="3" ${cur.rounds === 3 ? 'selected' : ''}>3 جولات (مباراة سريعة ⚡)</option>
          <option value="5" ${cur.rounds === 5 ? 'selected' : ''}>5 جولات (الافتراضي 🌟)</option>
          <option value="10" ${cur.rounds === 10 ? 'selected' : ''}>10 جولات (تحدٍ طويل 🏆)</option>
          <option value="15" ${cur.rounds === 15 ? 'selected' : ''}>15 جولة (ماراثون 🔥)</option>
        </select>

        <label style="font-weight:bold;display:block;margin-bottom:4px;">طريقة اختيار الأسئلة:</label>
        <select id="cfgModeSelect" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--border);">
          <option value="standard" ${cur.mode === 'standard' ? 'selected' : ''}>بالترتيب المنتظم لبنك الأسئلة</option>
          <option value="random" ${cur.mode === 'random' ? 'selected' : ''}>اختيار عشوائي ومفاجآت 🎲</option>
        </select>
      </div>

      <div style="display:flex;gap:8px;margin-top:14px;">
        <button id="cfgSaveBtn" class="btn btn-primary btn-full">حفظ وبدء اللعبة</button>
        <button class="btn btn-soft" onclick="window.openCommunityGame('${type}')">إلغاء</button>
      </div>
    `;

    if (window.openModal) {
      window.openModal(html);
      document.getElementById('cfgSaveBtn').onclick = async () => {
        const rounds = Number(document.getElementById('cfgRoundsSelect').value) || 5;
        const mode = document.getElementById('cfgModeSelect').value || 'standard';
        saveSettings(type, { rounds, mode });
        const fresh = createInitialState(type, { rounds, mode }, null);
        await writeState(type, fresh);
        if (window.toast) window.toast('تم حفظ الإعدادات!');
        window.openCommunityGame(type);
      };
    }
  };

  // ==========================================
  // 9. سؤال اليوم المشترك
  // ==========================================
  window.openDailySharedQuestion = async function () {
    const questions = window.AYOUSHA_DAILY_QUESTIONS || [
      'ما أكثر شيء بسيط يجعلك تبتسم اليوم؟',
      'لو سافرنا غداً، أي مدينة نختار؟',
      'ما ذكرى مشتركة بيننا تحب استعادتها دائماً؟'
    ];
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dayIndex = Math.abs(Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)) % questions.length;
    const dailyQ = questions[dayIndex];

    const myRole = getRole();
    const otherRole = getOtherRole();
    const myName = getRoleName(myRole);
    const otherName = getRoleName(otherRole);

    const path = 'app/dailyShared/' + dateKey;
    let saved = {};
    try {
      if (window.ayoushaRealtime?.ready?.()) {
        saved = (await window.ayoushaRealtime.read(path)) || {};
      } else {
        saved = JSON.parse(localStorage.getItem('ayousha_daily_' + dateKey) || '{}');
      }
    } catch {}

    const myAns = saved?.answers?.[myRole] || '';
    const otherAns = saved?.answers?.[otherRole] || '';

    const html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;color:var(--primary);">🌟 سؤال اليوم المشترك</h3>
        <span style="font-size:.78rem;color:var(--muted);background:#fff0f6;padding:3px 8px;border-radius:10px;">${dateKey}</span>
      </div>
      <div class="v9-panel" style="text-align:center;">
        <div style="font-size:1.15rem;font-weight:bold;color:#ad1457;line-height:1.7;">${esc(dailyQ)}</div>
        <p style="font-size:.82rem;color:var(--muted);margin-top:6px;">سؤال موحد للطرفين طوال اليوم؛ يكتمل بحفظ إجابتي الطرفين 💞</p>
      </div>

      <div style="margin:12px 0;">
        <label style="font-size:.85rem;font-weight:600;display:block;margin-bottom:6px;">إجابتك يا ${myName}:</label>
        <textarea id="dailyAnsInput" class="answer-input" rows="3" placeholder="اكتب إجابتك هنا من القلب..." style="width:100%;padding:10px;border-radius:14px;border:1px solid var(--border);font-family:inherit;">${esc(myAns)}</textarea>
        <button id="dailySaveBtn" class="btn btn-primary btn-full" style="margin-top:8px;">💾 حفظ ومزامنة إجابتي</button>
      </div>

      <div class="v9-panel" style="font-size:.86rem;line-height:1.8;">
        <div><b>${myName}:</b> ${myAns ? '✅ ' + esc(myAns) : '⏳ بانتظار إجابتك'}</div>
        <div style="margin-top:4px;"><b>${otherName}:</b> ${otherAns ? '✅ ' + esc(otherAns) : '⏳ بانتظار إجابة الشريك'}</div>
      </div>

      <div style="margin-top:12px;">
        <button class="btn btn-soft btn-full" onclick="window.closeModal()">إغلاق</button>
      </div>
    `;

    if (window.openModal) {
      window.openModal(html);
      document.getElementById('dailySaveBtn').onclick = async () => {
        const val = document.getElementById('dailyAnsInput')?.value.trim();
        if (!val) {
          if (window.toast) window.toast('اكتب إجابتك أولاً');
          return;
        }
        const updatedAnswers = { ...(saved.answers || {}), [myRole]: val };
        const record = { date: dateKey, question: dailyQ, answers: updatedAnswers, updatedAt: Date.now() };

        try {
          localStorage.setItem('ayousha_daily_' + dateKey, JSON.stringify(record));
        } catch {}

        try {
          if (window.ayoushaRealtime?.ready?.()) {
            await window.ayoushaRealtime.write(path, record);
          }
        } catch {}

        triggerCelebration();
        if (window.toast) window.toast('💖 تم حفظ ومزامنة إجابتك بنجاح!');
        window.openDailySharedQuestion();
      };
    }
  };

  console.log('✅ تم تحميل محرك ألعاب المجتمع (عيوشة) بنجاح.');
})();

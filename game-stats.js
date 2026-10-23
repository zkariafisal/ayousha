/**
 * 🏆 نظام النقاط والإحصائيات المتقدم
 * نظام شامل لتتبع النقاط والمستويات والإنجازات
 */

class GameStats {
  constructor() {
    this.loadStats();
  }

  loadStats() {
    const saved = localStorage.getItem('ayousha_stats');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(this, data);
    } else {
      this.initializeStats();
    }
  }

  initializeStats() {
    this.totalPoints = 0;
    this.currentLevel = 1;
    this.levelProgress = 0;
    this.pointsToNextLevel = 1000;
    this.totalGamesPlayed = 0;
    this.totalWins = 0;
    this.winStreak = 0;
    this.longestWinStreak = 0;
    this.badges = new Map();
    this.dailyRewards = {
      lastClaimedDate: null,
      streakDays: 0,
      totalClaimed: 0
    };
    this.gameStats = {};
    this.unlockedGames = ['trivia', 'story', 'draw', 'cards', 'xo'];
    this.gems = 0; // العملات النادرة
    this.achievements = {
      firstWin: false,
      tenWins: false,
      hundredPoints: false,
      level5: false,
      level10: false,
      winStreak10: false,
      winStreak25: false,
      collectAllBadges: false
    };
  }

  addPoints(points, gameType = 'general') {
    const bonusMultiplier = this.getStreakBonus();
    const actualPoints = Math.floor(points * bonusMultiplier);

    this.totalPoints += actualPoints;
    this.levelProgress += actualPoints;

    // تحديث إحصائيات اللعبة
    if (!this.gameStats[gameType]) {
      this.gameStats[gameType] = { points: 0, wins: 0, plays: 0 };
    }
    this.gameStats[gameType].points += actualPoints;
    this.gameStats[gameType].plays += 1;

    // فحص الترقية
    while (this.levelProgress >= this.pointsToNextLevel) {
      this.levelUp();
    }

    this.checkAchievements();
    this.save();

    return {
      pointsAdded: actualPoints,
      totalPoints: this.totalPoints,
      levelProgress: this.levelProgress,
      bonusMultiplier: bonusMultiplier
    };
  }

  addWin(gameType = 'general') {
    this.totalWins += 1;
    this.totalGamesPlayed += 1;
    this.winStreak += 1;

    if (this.winStreak > this.longestWinStreak) {
      this.longestWinStreak = this.winStreak;
    }

    if (!this.gameStats[gameType]) {
      this.gameStats[gameType] = { points: 0, wins: 0, plays: 0 };
    }
    this.gameStats[gameType].wins += 1;

    // إضافة نقاط للفوز
    const winBonus = 100 + (this.winStreak * 10);
    this.addPoints(winBonus, gameType);

    // منح شارات
    this.checkWinAchievements();
    this.save();

    return {
      winStreak: this.winStreak,
      bonusPoints: winBonus,
      newBadges: this.getNewBadges()
    };
  }

  addLoss(gameType = 'general') {
    this.totalGamesPlayed += 1;
    this.winStreak = 0; // إعادة تعيين التسلسل

    if (!this.gameStats[gameType]) {
      this.gameStats[gameType] = { points: 0, wins: 0, plays: 0 };
    }
    this.gameStats[gameType].plays += 1;

    // إضافة نقاط مشاركة (أقل من الفوز)
    this.addPoints(10, gameType);
    this.save();
  }

  levelUp() {
    this.currentLevel += 1;
    this.levelProgress -= this.pointsToNextLevel;
    this.pointsToNextLevel = Math.floor(this.pointsToNextLevel * 1.15); // زيادة 15%

    // منح مكافآت الترقية
    const gemsReward = Math.floor(this.currentLevel / 5) * 5; // جوهرة كل 5 مستويات
    this.gems += gemsReward;

    // فتح ألعاب جديدة في مستويات معينة
    this.unlockNewGames();

    // تشغيل احتفال
    this.triggerLevelUpCelebration();
    this.save();

    return {
      newLevel: this.currentLevel,
      gemsEarned: gemsReward,
      newPointsRequired: this.pointsToNextLevel
    };
  }

  unlockNewGames() {
    const gameUnlocks = {
      5: 'speedRound',
      10: 'duelMode',
      15: 'survivalMode',
      20: 'teamBattle',
      30: 'memoryChallenge'
    };

    if (gameUnlocks[this.currentLevel] && !this.unlockedGames.includes(gameUnlocks[this.currentLevel])) {
      this.unlockedGames.push(gameUnlocks[this.currentLevel]);
      this.showNotification(`🎉 فتحت لعبة جديدة: ${gameUnlocks[this.currentLevel]}!`);
    }
  }

  addBadge(badgeId, badgeName) {
    if (!this.badges.has(badgeId)) {
      this.badges.set(badgeId, {
        id: badgeId,
        name: badgeName,
        unlockedAt: new Date().toISOString(),
        icon: this.getBadgeIcon(badgeId)
      });
      this.save();
      return true;
    }
    return false;
  }

  getBadgeIcon(badgeId) {
    const icons = {
      'first_win': '🏆',
      'ten_wins': '🥇',
      'hundred_points': '💯',
      'win_streak_10': '🔥',
      'win_streak_25': '⚡',
      'level_10': '👑',
      'level_25': '💎',
      'master': '🌟',
      'speedster': '⚡',
      'survivor': '🛡️'
    };
    return icons[badgeId] || '🎖️';
  }

  checkWinAchievements() {
    if (this.totalWins === 1) {
      this.addBadge('first_win', 'أول فوز');
    }
    if (this.totalWins === 10) {
      this.addBadge('ten_wins', 'عشرة انتصارات');
    }
    if (this.winStreak === 10) {
      this.addBadge('win_streak_10', 'سلسلة النار');
    }
    if (this.winStreak === 25) {
      this.addBadge('win_streak_25', 'البرق الخاطف');
    }
  }

  checkAchievements() {
    if (this.totalPoints >= 100 && !this.achievements.hundredPoints) {
      this.achievements.hundredPoints = true;
      this.addBadge('hundred_points', '100 نقطة');
    }
  }

  getStreakBonus() {
    // كل 5 انتصارات متتالية = 1.1x مضاعف
    return 1 + (Math.floor(this.winStreak / 5) * 0.1);
  }

  claimDailyReward() {
    const today = new Date().toDateString();

    if (this.dailyRewards.lastClaimedDate === today) {
      return { claimed: false, message: 'لقد حصلت على المكافأة اليومية بالفعل' };
    }

    const lastDate = this.dailyRewards.lastClaimedDate ? new Date(this.dailyRewards.lastClaimedDate) : null;
    const isConsecutive = lastDate && (new Date(today) - lastDate) === 86400000;

    if (isConsecutive) {
      this.dailyRewards.streakDays += 1;
    } else {
      this.dailyRewards.streakDays = 1;
    }

    // حساب المكافأة
    const baseReward = 50 * this.dailyRewards.streakDays;
    const bonus = this.dailyRewards.streakDays >= 7 ? 500 : 0; // مكافأة أسبوعية

    this.addPoints(baseReward + bonus);
    this.dailyRewards.lastClaimedDate = today;
    this.dailyRewards.totalClaimed += baseReward + bonus;

    this.save();

    return {
      claimed: true,
      points: baseReward,
      bonus: bonus,
      streak: this.dailyRewards.streakDays
    };
  }

  getLeaderboardPosition() {
    // سيتم الحصول على البيانات من السيرفر لاحقاً
    return {
      rank: 1,
      totalPlayers: 100,
      percentile: 99
    };
  }

  getPlayerStats() {
    return {
      level: this.currentLevel,
      totalPoints: this.totalPoints,
      levelProgress: this.levelProgress,
      pointsToNextLevel: this.pointsToNextLevel,
      wins: this.totalWins,
      plays: this.totalGamesPlayed,
      winRate: ((this.totalWins / this.totalGamesPlayed) * 100).toFixed(1),
      winStreak: this.winStreak,
      longestWinStreak: this.longestWinStreak,
      gems: this.gems,
      badges: Array.from(this.badges.values()),
      gameStats: this.gameStats,
      dailyStreak: this.dailyRewards.streakDays
    };
  }

  save() {
    const data = {
      totalPoints: this.totalPoints,
      currentLevel: this.currentLevel,
      levelProgress: this.levelProgress,
      pointsToNextLevel: this.pointsToNextLevel,
      totalGamesPlayed: this.totalGamesPlayed,
      totalWins: this.totalWins,
      winStreak: this.winStreak,
      longestWinStreak: this.longestWinStreak,
      badges: Array.from(this.badges.entries()),
      dailyRewards: this.dailyRewards,
      gameStats: this.gameStats,
      unlockedGames: this.unlockedGames,
      gems: this.gems,
      achievements: this.achievements
    };
    localStorage.setItem('ayousha_stats', JSON.stringify(data));
  }

  triggerLevelUpCelebration() {
    // سيتم تشغيل احتفال بصري
    const event = new CustomEvent('levelup', {
      detail: { level: this.currentLevel }
    });
    document.dispatchEvent(event);
  }

  getNewBadges() {
    return Array.from(this.badges.values()).slice(-1); // آخر شارة تم إضافتها
  }

  showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'toast show';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  reset() {
    this.initializeStats();
    this.save();
  }
}

// إنشاء كائن عام للإحصائيات
window.gameStats = new GameStats();

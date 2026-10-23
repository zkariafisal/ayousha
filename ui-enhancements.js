/**
 * 🎨 تحسينات الواجهة والتفاعل
 * نظام النقاط والترتيب والمكافآت
 */

// ============ عرض نظام النقاط ============
function renderGameStats() {
  const stats = window.gameStats.getPlayerStats();

  const html = `
    <div class="stats-container">
      <div class="stats-header">
        <div class="level-badge">
          <div class="level-number">${stats.level}</div>
          <div class="level-label">المستوى</div>
        </div>
        <div class="points-display">
          <div class="total-points">${stats.totalPoints.toLocaleString()}</div>
          <div class="points-label">إجمالي النقاط</div>
        </div>
        <div class="gems-display">
          <span class="gem-icon">💎</span>
          <div class="gem-count">${stats.gems}</div>
        </div>
      </div>

      <div class="level-progress">
        <div class="progress-bar-label">
          <span>النقاط إلى المستوى التالي</span>
          <span>${stats.levelProgress} / ${stats.pointsToNextLevel}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${(stats.levelProgress / stats.pointsToNextLevel * 100)}%"></div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.wins}</div>
          <div class="stat-label">انتصارات</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.plays}</div>
          <div class="stat-label">لعبات</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.winRate}%</div>
          <div class="stat-label">معدل الفوز</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.winStreak}</div>
          <div class="stat-label">التسلسل الحالي</div>
        </div>
      </div>

      <div class="badges-section">
        <div class="section-title">🏆 الشارات المفتوحة</div>
        <div class="badges-grid">
          ${stats.badges.map(badge => `
            <div class="badge-item" title="${badge.name}">
              <span class="badge-icon">${badge.icon}</span>
              <span class="badge-name">${badge.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return html;
}

// ============ لوحة الترتيب ============
function renderLeaderboard() {
  // سيتم الحصول على البيانات من السيرفر لاحقاً
  const mockLeaderboard = [
    { rank: 1, name: 'أنتِ', level: 15, points: 50000, badge: '👑' },
    { rank: 2, name: 'محمد', level: 14, points: 48000, badge: '🥈' },
    { rank: 3, name: 'فاطمة', level: 13, points: 45000, badge: '🥉' },
    { rank: 4, name: 'علي', level: 12, points: 40000, badge: '' },
    { rank: 5, name: 'زينب', level: 11, points: 35000, badge: '' }
  ];

  const html = `
    <div class="leaderboard-container">
      <div class="leaderboard-title">🏅 لوحة الترتيب العالمية</div>
      <div class="leaderboard-tabs">
        <button class="tab-btn active" onclick="switchLeaderboardTab('weekly')">أسبوعي</button>
        <button class="tab-btn" onclick="switchLeaderboardTab('monthly')">شهري</button>
        <button class="tab-btn" onclick="switchLeaderboardTab('alltime')">الأفضل</button>
      </div>
      <div class="leaderboard-list">
        ${mockLeaderboard.map(entry => `
          <div class="leaderboard-entry ${entry.rank === 1 ? 'top-rank' : ''}">
            <div class="rank-badge">${entry.badge || '#' + entry.rank}</div>
            <div class="player-info">
              <div class="player-name">${entry.name}</div>
              <div class="player-level">المستوى ${entry.level}</div>
            </div>
            <div class="player-points">${entry.points.toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return html;
}

// ============ عرض المكافآت اليومية ============
function renderDailyRewards() {
  const html = `
    <div class="daily-rewards-card">
      <div class="card-title">📅 المكافآت اليومية</div>
      <div class="rewards-grid">
        <div class="reward-item day-1">
          <div class="day-number">اليوم 1</div>
          <div class="reward-amount">50 نقطة</div>
          <button class="reward-btn" onclick="claimDailyReward(1)">ادعي</button>
        </div>
        <div class="reward-item day-3">
          <div class="day-number">اليوم 3</div>
          <div class="reward-amount">200 نقطة</div>
          <button class="reward-btn" onclick="claimDailyReward(3)">ادعي</button>
        </div>
        <div class="reward-item day-7">
          <div class="day-number">اليوم 7</div>
          <div class="reward-amount">1000 نقطة + جوهرة</div>
          <button class="reward-btn premium" onclick="claimDailyReward(7)">ادعي</button>
        </div>
      </div>
      <div class="streak-info" id="streakInfo"></div>
    </div>
  `;

  return html;
}

// ============ احتفالات الفوز ============
function celebrateWin(points, bonus = null) {
  // إنشاء عناصر الاحتفال
  const celebration = document.createElement('div');
  celebration.className = 'celebration-container';

  // كونفيتي
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.delay = Math.random() * 0.5 + 's';
    confetti.textContent = ['🎉', '🌟', '💫', '⭐', '✨'][Math.floor(Math.random() * 5)];
    celebration.appendChild(confetti);
  }

  // نص النقاط
  const pointsText = document.createElement('div');
  pointsText.className = 'points-popup';
  pointsText.textContent = `+${points} نقطة`;
  if (bonus) pointsText.innerHTML += `<div class="bonus-text">+${bonus} مكافأة!</div>`;
  celebration.appendChild(pointsText);

  document.body.appendChild(celebration);

  setTimeout(() => celebration.remove(), 2000);
}

// ============ تأثير الترقية ============
function celebrateLevelUp(newLevel) {
  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.innerHTML = `
    <div class="levelup-content">
      <div class="levelup-emoji">🎊</div>
      <h2>تم الترقية!</h2>
      <div class="new-level">${newLevel}</div>
      <p>تهانينا على الوصول للمستوى ${newLevel}</p>
      <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">رائع!</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // تشغيل الأصوات والاهتزازات
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }

  setTimeout(() => {
    overlay.classList.add('show');
  }, 100);
}

// ============ تحديث الواجهة ============
function updateUIAfterGame(result) {
  const { pointsAdded, levelProgress, totalPoints } = window.gameStats.addPoints(result.points, result.gameType);

  // إظهار النقاط المضافة
  celebrateWin(pointsAdded, result.bonus);

  // تحديث شريط التقدم
  updateProgressBar(levelProgress, window.gameStats.pointsToNextLevel);

  // تحديث عداد النقاط
  updatePointsDisplay(totalPoints);

  // فحص الإنجازات الجديدة
  checkAndDisplayAchievements();
}

// ============ CSS لتحسينات الواجهة ============
const enhancementStyles = `
<style>
/* Stats Container */
.stats-container {
  padding: 16px;
}

.stats-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.level-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e83e80, #ad1457);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(216, 27, 96, 0.3);
}

.level-number {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}

.level-label {
  font-size: 0.6rem;
  opacity: 0.9;
}

.points-display {
  text-align: center;
}

.total-points {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
}

.points-label {
  font-size: 0.75rem;
  color: var(--muted);
}

.gems-display {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(212, 175, 117, 0.15);
  padding: 6px 12px;
  border-radius: 16px;
}

.gem-icon {
  font-size: 1.2rem;
}

.gem-count {
  font-weight: 800;
  color: #d4af75;
}

/* Progress Bar */
.level-progress {
  margin-bottom: 16px;
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--muted);
  margin-bottom: 6px;
}

.progress-bar-bg {
  height: 8px;
  background: #f0e2e9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #e83e80, #ad1457);
  transition: width 0.3s ease;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff2f7;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #f5d7e4;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-2);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 4px;
}

/* Badges */
.badges-section {
  margin-top: 16px;
}

.section-title {
  font-weight: 800;
  color: var(--primary-2);
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.badge-item {
  background: linear-gradient(135deg, #fff8e1, #ffe0b2);
  border: 1px solid #ffe0b2;
  border-radius: 12px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.badge-item:hover {
  transform: scale(1.05);
}

.badge-icon {
  display: block;
  font-size: 1.6rem;
  margin-bottom: 4px;
}

.badge-name {
  display: block;
  font-size: 0.6rem;
  color: #5d4037;
  font-weight: 600;
}

/* Leaderboard */
.leaderboard-container {
  padding: 16px;
}

.leaderboard-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-2);
  margin-bottom: 12px;
}

.leaderboard-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  background: #f2d9e4;
  color: var(--primary-2);
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #e83e80, #ad1457);
  color: white;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f2d9e4;
  transition: transform 0.2s;
}

.leaderboard-entry:hover {
  transform: translateX(-4px);
}

.leaderboard-entry.top-rank {
  background: linear-gradient(135deg, #fff8e1, #ffe0b2);
  border: 2px solid #ffb300;
}

.rank-badge {
  font-size: 1.4rem;
  font-weight: 800;
  min-width: 30px;
  text-align: center;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 700;
  color: var(--primary-2);
}

.player-level {
  font-size: 0.8rem;
  color: var(--muted);
}

.player-points {
  font-weight: 800;
  color: var(--primary);
  min-width: 60px;
  text-align: right;
}

/* Celebration */
.celebration-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confetti {
  position: absolute;
  font-size: 1.5rem;
  animation: fall 2s ease-in forwards;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.points-popup {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
  animation: popupFly 1.5s ease-out forwards;
  text-shadow: 0 2px 8px rgba(216, 27, 96, 0.3);
}

@keyframes popupFly {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1.5);
    opacity: 0;
  }
}

.bonus-text {
  font-size: 0.8rem;
  color: #ffb300;
  margin-top: 4px;
}

/* Level Up */
.levelup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(45, 27, 38, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s;
}

.levelup-overlay.show {
  opacity: 1;
}

.levelup-content {
  background: linear-gradient(135deg, #fff8e1, #ffe0b2);
  border: 2px solid #ffb300;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  max-width: 300px;
  animation: levelupBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes levelupBounce {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.levelup-emoji {
  font-size: 3rem;
  margin-bottom: 12px;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(20deg); }
}

.levelup-content h2 {
  color: #5d4037;
  font-size: 1.4rem;
  margin: 8px 0;
}

.new-level {
  font-size: 3rem;
  font-weight: 800;
  color: #ffb300;
  margin: 12px 0;
}

.levelup-content p {
  color: #5d4037;
  margin-bottom: 16px;
}

/* Daily Rewards */
.daily-rewards-card {
  padding: 16px;
  background: linear-gradient(135deg, #fff8e1, #ffe0b2);
  border-radius: 16px;
  border: 1px dashed #ffb300;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 12px 0;
}

.reward-item {
  background: white;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  border: 1px solid #ffe0b2;
}

.reward-item.day-7 {
  border: 2px solid #ffb300;
  background: linear-gradient(135deg, #fff9f0, #ffe8d0);
}

.day-number {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

.reward-amount {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--primary-2);
  margin: 4px 0;
}

.reward-btn {
  width: 100%;
  padding: 4px;
  background: #fff2f7;
  color: var(--primary-2);
  border: 1px solid #f5d7e4;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.reward-btn:active {
  transform: scale(0.95);
}

.reward-btn.premium {
  background: linear-gradient(135deg, #ffb300, #ff8f00);
  color: white;
  border: none;
}

.streak-info {
  margin-top: 12px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--primary-2);
  font-weight: 600;
}
</style>
`;

// إضافة الأنماط عند تحميل الملف
document.head.insertAdjacentHTML('beforeend', enhancementStyles);

/**
 * ⚡ الألعاب الجديدة الاحترافية
 * Speed Round, Duel Mode, Survival Mode, Memory Challenge
 */

// ============ Speed Round ⚡ ============
class SpeedRound {
  constructor() {
    this.timePerQuestion = 10;
    this.currentQuestion = 0;
    this.score = 0;
    this.combo = 0;
    this.questions = this.generateQuestions();
    this.startTime = Date.now();
    this.questionStartTime = null;
    this.responseTime = [];
  }

  generateQuestions() {
    // سيتم استخدام الأسئلة الموجودة بالفعل
    return window.TRIVIA_BANK?.slice(0, 20) || [];
  }

  nextQuestion() {
    if (this.currentQuestion < this.questions.length) {
      this.questionStartTime = Date.now();
      return this.questions[this.currentQuestion];
    }
    return null;
  }

  submitAnswer(isCorrect) {
    const responseTime = Date.now() - this.questionStartTime;
    this.responseTime.push(responseTime);

    if (isCorrect) {
      this.combo += 1;
      // نقاط = 100 + bonus السرعة + bonus combo
      const speedBonus = Math.max(0, 10 - Math.floor(responseTime / 1000));
      const comboBonus = (this.combo - 1) * 10;
      const points = 100 + speedBonus + comboBonus;
      this.score += points;
    } else {
      this.combo = 0;
    }

    this.currentQuestion += 1;
  }

  getStats() {
    const avgResponseTime = this.responseTime.length > 0
      ? Math.round(this.responseTime.reduce((a, b) => a + b) / this.responseTime.length)
      : 0;

    return {
      score: this.score,
      questionsAnswered: this.currentQuestion,
      accuracy: ((this.currentQuestion > 0 ? (this.score / (this.currentQuestion * 100)) * 100 : 0).toFixed(1)) + '%',
      averageResponseTime: avgResponseTime + 'ms',
      maxCombo: Math.max(...this.responseTime.map((t, i) => t < 3000 ? i : 0))
    };
  }
}

// ============ Duel Mode 🤝 ============
class DuelMode {
  constructor(playerName, opponentName) {
    this.playerName = playerName;
    this.opponentName = opponentName;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.round = 1;
    this.maxRounds = 5;
    this.currentQuestion = null;
    this.questions = this.generateQuestions();
    this.history = [];
  }

  generateQuestions() {
    return window.TRIVIA_BANK?.slice(0, 10) || [];
  }

  newRound() {
    if (this.round <= this.maxRounds) {
      this.currentQuestion = this.questions[this.round - 1];
      return this.currentQuestion;
    }
    return null;
  }

  submitPlayerAnswer(isCorrect) {
    const pointsEarned = isCorrect ? 10 : 0;
    this.playerScore += pointsEarned;

    this.history.push({
      round: this.round,
      player: this.playerName,
      correct: isCorrect,
      points: pointsEarned
    });

    this.round += 1;
  }

  getWinner() {
    if (this.playerScore > this.opponentScore) {
      return { winner: this.playerName, score: this.playerScore };
    } else if (this.opponentScore > this.playerScore) {
      return { winner: this.opponentName, score: this.opponentScore };
    }
    return { winner: 'draw', score: this.playerScore };
  }

  getStats() {
    return {
      playerScore: this.playerScore,
      opponentScore: this.opponentScore,
      currentRound: this.round,
      history: this.history,
      winner: this.getWinner()
    };
  }
}

// ============ Survival Mode 🎯 ============
class SurvivalMode {
  constructor() {
    this.lives = 3;
    this.score = 0;
    this.level = 1;
    this.questionsAnswered = 0;
    this.difficulty = 'easy';
    this.questions = this.generateQuestions();
    this.questionIndex = 0;
  }

  generateQuestions() {
    const easy = window.TRIVIA_BANK?.slice(0, 10) || [];
    const medium = window.TRIVIA_BANK?.slice(10, 25) || [];
    const hard = window.TRIVIA_BANK?.slice(25, 35) || [];
    return { easy, medium, hard };
  }

  getCurrentQuestion() {
    const questionArray = this.questions[this.difficulty];
    return questionArray[this.questionIndex % questionArray.length];
  }

  submitAnswer(isCorrect) {
    if (isCorrect) {
      this.questionsAnswered += 1;
      const levelBonus = 50 * this.level;
      const difficultyBonus = this.difficulty === 'easy' ? 0 : this.difficulty === 'medium' ? 50 : 100;
      this.score += 100 + levelBonus + difficultyBonus;

      // تصعيد الصعوبة
      if (this.questionsAnswered % 5 === 0) {
        this.increaseDifficulty();
      }
    } else {
      this.lives -= 1;
    }

    this.questionIndex += 1;
  }

  increaseDifficulty() {
    if (this.difficulty === 'easy') {
      this.difficulty = 'medium';
      this.level = 2;
    } else if (this.difficulty === 'medium') {
      this.difficulty = 'hard';
      this.level = 3;
    }
  }

  isGameOver() {
    return this.lives <= 0;
  }

  getStats() {
    return {
      score: this.score,
      level: this.level,
      difficulty: this.difficulty,
      lives: Math.max(0, this.lives),
      questionsAnswered: this.questionsAnswered,
      survived: !this.isGameOver()
    };
  }
}

// ============ Memory Challenge 🧠 ============
class MemoryChallenge {
  constructor() {
    this.colors = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.score = 0;
    this.maxSequenceReached = 0;
    this.gameActive = false;
  }

  startGame() {
    this.gameActive = true;
    this.addToSequence();
  }

  addToSequence() {
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.sequence.push(randomColor);
    this.playerSequence = [];
    this.level = this.sequence.length;
    this.score = Math.pow(this.level, 2) * 100;
    this.maxSequenceReached = Math.max(this.maxSequenceReached, this.level);
  }

  getSequenceDisplay() {
    return this.sequence.join('');
  }

  playerInput(color) {
    this.playerSequence.push(color);

    // فحص الإجابة
    const lastIndex = this.playerSequence.length - 1;
    if (this.playerSequence[lastIndex] !== this.sequence[lastIndex]) {
      this.gameActive = false;
      return { correct: false, gameOver: true };
    }

    // إذا أكمل التسلسل الكامل
    if (this.playerSequence.length === this.sequence.length) {
      return { correct: true, levelComplete: true };
    }

    return { correct: true, levelComplete: false };
  }

  getStats() {
    return {
      score: this.score,
      level: this.level,
      maxLevelReached: this.maxSequenceReached,
      accuracy: '100%' // في هذه اللعبة الدقة دائماً 100% إذا لم تخطئ
    };
  }
}

// ============ Time Attack ⏱️ ============
class TimeAttack {
  constructor() {
    this.totalTime = 60; // ثانية
    this.remainingTime = this.totalTime;
    this.questionsAnswered = 0;
    this.correctAnswers = 0;
    this.score = 0;
    this.startTime = null;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.startTimer();
  }

  startTimer() {
    const interval = setInterval(() => {
      this.remainingTime = Math.max(0, this.totalTime - Math.floor((Date.now() - this.startTime) / 1000));

      if (this.remainingTime <= 0) {
        this.isRunning = false;
        clearInterval(interval);
        this.endGame();
      }
    }, 100);
  }

  submitAnswer(isCorrect) {
    if (!this.isRunning) return false;

    this.questionsAnswered += 1;
    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += 10;
    }
    return true;
  }

  endGame() {
    this.isRunning = false;
  }

  getStats() {
    return {
      questionsAnswered: this.questionsAnswered,
      correctAnswers: this.correctAnswers,
      accuracy: ((this.correctAnswers / this.questionsAnswered) * 100).toFixed(1) + '%',
      score: this.score,
      timeUsed: this.totalTime - this.remainingTime,
      questionsPerSecond: (this.questionsAnswered / (this.totalTime - this.remainingTime)).toFixed(2)
    };
  }
}

// ============ Mystery Box 🎁 ============
class MysteryBox {
  constructor() {
    this.boxes = this.generateBoxes();
    this.openedBoxes = [];
    this.totalReward = 0;
  }

  generateBoxes() {
    const boxes = [];
    const rewards = [10, 50, 100, 500, 1000];
    const specials = ['gem', 'badge', 'doubleXP'];

    // 5 صناديق معروفة
    for (let i = 0; i < 5; i++) {
      boxes.push({
        id: i,
        reward: rewards[i],
        type: 'points'
      });
    }

    // صندوق خاص واحد
    boxes.push({
      id: 5,
      reward: specials[Math.floor(Math.random() * specials.length)],
      type: 'special'
    });

    return boxes.sort(() => Math.random() - 0.5);
  }

  openBox(boxIndex) {
    if (this.openedBoxes.includes(boxIndex)) {
      return { error: 'هذا الصندوق مفتوح بالفعل' };
    }

    const box = this.boxes[boxIndex];
    this.openedBoxes.push(boxIndex);

    if (box.type === 'points') {
      this.totalReward += box.reward;
      return {
        boxIndex,
        reward: box.reward,
        type: 'points',
        message: `لقد حصلت على ${box.reward} نقطة! 🎉`
      };
    } else {
      return {
        boxIndex,
        reward: box.reward,
        type: 'special',
        message: `مكافأة خاصة: ${box.reward}! 🌟`
      };
    }
  }

  getStats() {
    return {
      totalReward: this.totalReward,
      boxesOpened: this.openedBoxes.length,
      boxesRemaining: this.boxes.length - this.openedBoxes.length,
      allOpened: this.openedBoxes.length === this.boxes.length
    };
  }
}

// تصدير الألعاب
window.GameClasses = {
  SpeedRound,
  DuelMode,
  SurvivalMode,
  MemoryChallenge,
  TimeAttack,
  MysteryBox
};

//一些原生JSCode 不需要使用到Vue 可以直接定義在外部的JS環境即可
function getRandomVal(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
  //假如：希望得到值的區間為 5 - 12：random結果可能是0 乘多少都是0 那麼加5可固定最小值有5
  //random結果也可能無限趨近1 乘上最大值-最小值頂多無限趨近7 再加上5 也只會得到12以內的值
}

const app = Vue.createApp({
  data() {
    return {
      playerHealth: 100,
      monsterHealth: 100,
      currentRound: 0,
      winner: null, //null的boolean為false
      logMsg: [],
    };
  },
  computed: {
    //不該在HTML定義太多邏輯 所以:style :disabled的部分放在計算屬性操作
    monsterBarStyles() {
      if (this.monsterHealth < 0) {
        return { width: "0%" };
      }
      return { width: this.monsterHealth + "%" };
    },
    playerBarStyles() {
      if (this.playerHealth < 0) {
        return { width: "0%" };
      }
      return { width: this.playerHealth + "%" };
    },
    mayUseSpecialAttack() {
      return this.currentRound % 3 !== 0;
      //設定強力攻擊只能3回合使用一次
    },
    mayUseHeal() {
      return this.playerHealth === 100;
      //設定一開始滿血時無法補血
    },
  },
  methods: {
    startAgain() {
      this.playerHealth = 100;
      this.monsterHealth = 100;
      this.currentRound = 0;
      this.winner = null;
      this.logMsg = [];
    },
    attackMonster() {
      if (this.currentRound !== 0 && this.currentRound !== 3) {
        this.currentRound++;
        //等強力攻擊使用過才開始計算是否過了3回合 避免第一擊使用普通攻擊而強力攻擊會有2回合無法使用
      }
      const attackVal = getRandomVal(5, 12);
      this.monsterHealth -= attackVal;
      this.addLogMsg("player", "attack", attackVal);
      this.attackPlayer();
      //攻擊怪物後會調用怪物反擊的函式 不用迷茫this的指向 因為參考的是obj而不是function
    },
    attackPlayer() {
      const attackVal = getRandomVal(8, 15);
      setTimeout(() => {
        this.playerHealth -= attackVal;
        this.addLogMsg("monster", "attack", attackVal);
      }, 200);
      //讓怪物慢一點出招 顯示會比較清楚
    },
    specialAttackMonster() {
      this.currentRound = 1;
      const attackVal = getRandomVal(10, 25);
      this.monsterHealth -= attackVal;
      this.addLogMsg("player", "sp", attackVal);
      this.attackPlayer();
    },
    healPlayer() {
      if (this.currentRound !== 0 && this.currentRound !== 3) {
        this.currentRound++;
      }
      const healVal = getRandomVal(8, 20);
      if (this.playerHealth + healVal >= 100) {
        this.playerHealth = 100;
        //這裡看血條永遠不會滿100是因為 "先補完血 怪物才攻擊"
      } else {
        this.playerHealth += healVal;
      }
      this.addLogMsg("player", "heal", healVal);
      this.attackPlayer();
    },
    surrender() {
      this.winner = "monster";
    },
    addLogMsg(who, what, val) {
      this.logMsg.unshift({
        actBy: who,
        actType: what,
        actVal: val,
      });
    },
  },
  watch: {
    playerHealth(val) {
      if (val <= 0 && this.monsterHealth <= 0) {
        //draw
        this.winner = "draw";
      } else if (val <= 0) {
        //player lost
        this.winner = "monster";
      }
    },
    monsterHealth(val) {
      if (val <= 0 && this.playerHealth <= 0) {
        //draw
        this.winner = "draw";
      } else if (val <= 0) {
        //monster lost
        this.winner = "player";
      }
    },
  },
});

app.mount("#game");

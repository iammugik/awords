import type { InjectionKey } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";
import { getRandomElement, pause } from "@/stores/utils";
import { Locales } from "@/i18n/constants";

export const key: InjectionKey<Store<State>> = Symbol();

export enum GameStatus {
  INIT = "init",
  READY = "ready",
  PRE_SUBMIT = "preSubmit",
  SUBMITTING = "submitting",
  GUESS_NOT_EXIST = "guessNotExist",
  SUCCESS = "gameSuccess",
  FAILURE = "gameFailure",
}

export enum LetterStatus {
  USED = "used",
  PRESENT = "present",
  TRULY = "truly",
}

export interface Letter {
  letter: string;
  status?: LetterStatus;
}

export interface State {
  status: GameStatus;
  secretWord: string;
  rowsCount: number;
  wordLength: number;
  activeRow: number;
  guesses: Letter[][];
  secretWords: string[];
  otherWords: string[];
}

const wordLengthRange = [4, 7];
const wordLengthStart = wordLengthRange[0] - 1;

const getDefaultState = () => {
  return {
    status: GameStatus.INIT,
    secretWord: "",
    rowsCount: 6,
    wordLength: wordLengthStart,
    activeRow: 0,
    guesses: [[]],
    secretWords: [],
    otherWords: [],
  };
};

export const store = createStore<State>({
  state() {
    return getDefaultState();
  },
  getters: {
    state(state) {
      return state;
    },
  },
  mutations: {
    SET_GAME_STATUS(state, status: GameStatus) {
      state.status = status;
    },
    SET_WORD_LENGTH(state, length: number) {
      state.wordLength = length;
      localStorage.setItem("awords:wordLength", length.toString());
      state.secretWords = state.secretWords.filter((w) => w.length === length);
      state.otherWords = state.otherWords.filter((w) => w.length === length);
    },
    SET_SECRET_WORD(state, word: string) {
      state.secretWord = word;
    },
    SET_DICTIONARIES(state, { secretWords, otherWords }) {
      state.secretWords = secretWords;
      state.otherWords = otherWords;
    },
    RESET_GAME(state) {
      state.secretWord = "";
      state.activeRow = 0;
      state.guesses = [[]];
    },
    NEXT_ROUND(state) {
      state.guesses.push([]);
      state.activeRow += 1;
    },
    ADD_LETTER(state, letter: string) {
      state.guesses[state.activeRow].push({ letter });
    },
    DELETE_LETTER(state) {
      state.guesses[state.activeRow].pop();
    },
    ACTUALIZE_LETTERS(state) {
      const secretLetters = state.secretWord.split("");
      const guessLetters = state.guesses[state.activeRow].map((i) => i.letter);

      guessLetters.forEach((_, index) => {
        state.guesses[state.activeRow][index].status = LetterStatus.USED;
      });

      guessLetters.forEach((letter, index) => {
        if (letter === secretLetters[index]) {
          guessLetters[index] = "*";
          secretLetters[index] = "#";
          state.guesses[state.activeRow][index].status = LetterStatus.TRULY;
        }
      });

      guessLetters.forEach((letter, index) => {
        const position = secretLetters.findIndex((l) => l === letter);
        if (position >= 0) {
          guessLetters[index] = "*";
          secretLetters[position] = "#";
          state.guesses[state.activeRow][index].status = LetterStatus.PRESENT;
        }
      });
    },
  },
  actions: {
    async restartGame(
      { commit, state, dispatch },
      locale: Locales = Locales.RU
    ) {
      commit("RESET_GAME");
      await dispatch("loadDictionaries", locale);
      const oldWordLength = localStorage.getItem("awords:wordLength")
        ? Number(localStorage.getItem("awords:wordLength"))
        : wordLengthStart;
      const wordLength =
        oldWordLength < wordLengthRange[1]
          ? oldWordLength + 1
          : wordLengthRange[0];
      commit("SET_WORD_LENGTH", wordLength);
      const secretWord = getRandomElement(state.secretWords);
      commit("SET_SECRET_WORD", secretWord);
      commit("SET_GAME_STATUS", GameStatus.READY);
    },
    async loadDictionaries({ state, commit }, locale: Locales) {
      const secretWords = await (
        await fetch(`/dictionaries/${locale}/secretWords.json`)
      ).json();
      const otherWords = await (
        await fetch(`/dictionaries/${locale}/otherWords.json`)
      ).json();
      commit("SET_DICTIONARIES", {
        secretWords,
        otherWords,
      });
    },
    async addLetter({ state, commit, dispatch }, letter) {
      if (state.guesses[state.activeRow].length === state.wordLength) return;

      if (state.guesses[state.activeRow].length < state.wordLength) {
        commit("ADD_LETTER", letter);
      }

      if (state.guesses[state.activeRow].length === state.wordLength) {
        commit("SET_GAME_STATUS", GameStatus.PRE_SUBMIT);
        await pause(1000);
        if (state.status === GameStatus.PRE_SUBMIT) {
          await dispatch("submitGuess");
        }
      }
    },
    deleteLetter({ state, commit }) {
      if (state.guesses[state.activeRow].length === state.wordLength) {
        commit("SET_GAME_STATUS", GameStatus.READY);
      }

      if (state.guesses[state.activeRow].length > 0) {
        commit("DELETE_LETTER");
      }
    },
    async submitGuess({ state, commit, dispatch }) {
      commit("SET_GAME_STATUS", GameStatus.SUBMITTING);

      const guess = state.guesses[state.activeRow]
        .map((letterObj) => letterObj.letter)
        .join("");
      const isGuessExist = await dispatch("checkGuessExist", guess);

      if (!isGuessExist) {
        commit("SET_GAME_STATUS", GameStatus.GUESS_NOT_EXIST);
        return;
      }

      commit("ACTUALIZE_LETTERS");

      if (state.secretWord === guess) {
        commit("SET_GAME_STATUS", GameStatus.SUCCESS);
        await pause(2000);
        await dispatch("restartGame");
        return;
      }

      if (state.activeRow + 1 === state.rowsCount) {
        await pause(1000);
        commit("SET_GAME_STATUS", GameStatus.FAILURE);
        await pause(2000);
        await dispatch("restartGame");
        return;
      }

      commit("NEXT_ROUND");
      commit("SET_GAME_STATUS", GameStatus.READY);
    },
    checkGuessExist({ state }, guess) {
      return (
        state.secretWords.includes(guess) || state.otherWords.includes(guess)
      );
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}

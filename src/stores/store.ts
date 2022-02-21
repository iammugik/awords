import type { InjectionKey } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";
import { getRandomElement } from "@/stores/utils";
import { Locales } from "@/i18n/constants";

export const key: InjectionKey<Store<State>> = Symbol();

export enum GameStatus {
  INIT = "init",
  START = "start",
  END_SUCCESS = "endSuccess",
  END_FAILURE = "endFailure",
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

const wordLengths = [4, 5, 6];

const getDefaultState = () => {
  return {
    status: GameStatus.INIT,
    secretWord: "",
    rowsCount: 6,
    wordLength: 5,
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
  mutations: {
    SET_GAME_STATUS(state, status: GameStatus) {
      state.status = status;
    },
    SET_WORD_LENGTH(state, length: number) {
      state.wordLength = length;
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
      const wordLength = getRandomElement(wordLengths);
      commit("SET_WORD_LENGTH", wordLength);
      const secretWord = getRandomElement(state.secretWords);
      commit("SET_SECRET_WORD", secretWord);
      commit("SET_GAME_STATUS", GameStatus.START);
    },
    async loadDictionaries({ state, commit }, locale: Locales) {
      const secretWords = (
        await import(`../i18n/dictionaries/${locale}/secretWords.ts`)
      ).default;
      const otherWords = (
        await import(`../i18n/dictionaries/${locale}/otherWords.ts`)
      ).default;
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await dispatch("submitGuess");
      }
    },
    deleteLetter({ state, commit }) {
      if (state.guesses[state.activeRow].length > 0) {
        commit("DELETE_LETTER");
      }
    },
    async submitGuess({ state, commit, dispatch }) {
      const guess = state.guesses[state.activeRow]
        .map((letterObj) => letterObj.letter)
        .join("");
      const isGuessExist = await dispatch("checkGuessExist", guess);

      if (!isGuessExist) {
        console.log("Такого слова нет в базе");
        return;
      }

      commit("ACTUALIZE_LETTERS");

      if (state.secretWord === guess) {
        commit("SET_GAME_STATUS", GameStatus.END_SUCCESS);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await dispatch("restartGame");
        return;
      }

      if (state.activeRow + 1 === state.rowsCount) {
        commit("SET_GAME_STATUS", GameStatus.END_FAILURE);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await dispatch("restartGame");
        return;
      }

      commit("NEXT_ROUND");
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

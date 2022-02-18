import type { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import secretWords from "@/i18n/ru-RU/dictionaries/secretWords";
import otherWords from "@/i18n/ru-RU/dictionaries/otherWords";

export const key: InjectionKey<Store<State>> = Symbol();

export enum GameStatus {
  INIT = "init",
  START = "start",
  END_SUCCESS = "endSuccess",
  END_FAILURE = "endFailure",
}

export enum LetterStatus {
  PRESENT = "present",
  TRULY = "truly",
}

export interface State {
  status: GameStatus;
  secretWord: string;
  rowsCount: number;
  activeRow: number;
  wordLength: number;
  letters: {
    letter: string;
    status?: LetterStatus;
  }[];
  secretWords: string[];
  otherWords: string[];
}

const filteredSecretWords = secretWords.filter((word) => word.length === 5);
const filteredOtherWords = otherWords.filter((word) => word.length === 5);

const getDefaultState = () => {
  return {
    status: GameStatus.INIT,
    secretWord: "",
    rowsCount: 6,
    activeRow: 1,
    wordLength: 5,
    letters: [],
    secretWords: filteredSecretWords,
    otherWords: filteredOtherWords,
  };
};

export const store = createStore<State>({
  state() {
    return getDefaultState();
  },
  mutations: {
    CHANGE_STATUS(state, newStatus: GameStatus) {
      state.status = newStatus;
    },
    SET_SECRET_WORD(state, word: string) {
      state.secretWord = word;
    },
    RESET_GAME(state) {
      Object.assign(state, getDefaultState());
    },
    NEXT_ROUND(state) {
      state.activeRow += 1;
    },
    ADD_LETTER(state, letter: string) {
      state.letters.push({ letter });
    },
    DELETE_LETTER(state) {
      state.letters.pop();
    },
    ACTUALIZE_LETTERS(state) {
      const beginIndex = (state.activeRow - 1) * state.wordLength;
      const endIndex = state.activeRow * state.wordLength;

      for (let i = beginIndex, j = 0; i < endIndex; i++, j++) {
        if (state.secretWord.includes(state.letters[i].letter)) {
          state.letters[i].status = LetterStatus.PRESENT;
        }
        if (state.secretWord[j] === state.letters[i].letter) {
          state.letters[i].status = LetterStatus.TRULY;
        }
      }
    },
  },
  actions: {
    async restartGame({ commit, dispatch }) {
      commit("RESET_GAME");
      const secretWord = await dispatch("generateSecretWord");
      commit("SET_SECRET_WORD", secretWord);
      commit("CHANGE_STATUS", GameStatus.START);
    },
    generateSecretWord({ state }) {
      return state.secretWords[
        Math.floor(Math.random() * state.secretWords.length)
      ];
    },
    async addLetter({ state, commit, dispatch }, letter) {
      const limitForAdding = state.activeRow * state.wordLength;
      if (state.letters.length === limitForAdding) return;

      if (state.letters.length < limitForAdding) {
        commit("ADD_LETTER", letter);
      }

      if (state.letters.length === limitForAdding) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await dispatch("submitGuess");
      }
    },
    deleteLetter({ state, commit }) {
      const limitForDeleting = (state.activeRow - 1) * state.wordLength;
      if (state.letters.length > limitForDeleting) {
        commit("DELETE_LETTER");
      }
    },
    async submitGuess({ state, commit, dispatch }) {
      const guess = state.letters
        .slice((state.activeRow - 1) * state.wordLength)
        .map((letterObj) => letterObj.letter)
        .join("");
      const isGuessExist = await dispatch("checkGuessExist", guess);

      if (!isGuessExist) {
        console.log("Такого слова нет в базе");
        return;
      }

      commit("ACTUALIZE_LETTERS");

      if (state.secretWord === guess) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Угадано!");
        await dispatch("restartGame");
        return;
      }

      if (state.activeRow === state.rowsCount) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Не угадано");
        await dispatch("restartGame");
        return;
      }

      commit("NEXT_ROUND");
    },
    checkGuessExist({ state, commit }, guess) {
      return (
        state.secretWords.includes(guess) || state.otherWords.includes(guess)
      );
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}

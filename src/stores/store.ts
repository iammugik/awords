import type { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";

export const key: InjectionKey<Store<State>> = Symbol();

export enum GameStatus {
  IN_PROGRESS = "in-progress",
  DONE = "done",
}

export interface State {
  status: GameStatus;
  secretWord: string;
  rowsCount: number;
  activeRow: number;
  wordLength: number;
}

const initialState = {
  status: GameStatus.IN_PROGRESS,
  secretWord: "",
  rowsCount: 6,
  activeRow: 0,
  wordLength: 5,
};

export const store = createStore<State>({
  state() {
    return {
      ...initialState,
    };
  },
  mutations: {
    changeStatus(state, newStatus: GameStatus) {
      state.status = newStatus;
    },
    resetGame(state) {
      state = { ...initialState };
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}

declare namespace Utils {
  export type Reducer<State, Action> =
    (state: State, action: Action) => State;

  export type Dispatch<Action> =
    (action: Action) => void;
}

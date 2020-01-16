export type Ref<T> = {
  current: T
}

export type Component<Props> =
  (props: Props) => any;

type IntrinsicProps = {
  ref?: Ref<any>,
  key?: string | number,
  children?: any,
}

export function h<Props>(
  component: Component<Props>,
  props: Props & IntrinsicProps,
  children?: any,
): any;

export function h(
  component: string,
  props: any,
  children?: any
): any;

export function useReducer<S, A>(
  reducer: Utils.Reducer<S, A>,
  initialState: S
): [S, Utils.Dispatch<A>];

export function useState<T>(
  initialValue: T
): [T, (value: T) => void];

export function useRef<T>(
  initialValue: T
): Ref<T>

export function useEffect(
  callback: () => (() => void) | void,
  deps: any[]
): void

export let Fragment: Component<any>;

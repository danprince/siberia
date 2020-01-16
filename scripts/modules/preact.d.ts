declare namespace Preact {
  export type Ref<T> = {
    current: T
  }

  export type Key = string | number | any;

  export type VNode<Props = any> = {
    type: Component<Props>
    key: Key,
  } | {
    type: string,
    key: Key,
  };

  type RenderableProps<Props> = Readonly<
    Props & Attributes & { children?: ComponentChildren }
  >;

  export type Component<Props> =
    (props: RenderableProps<Props>) => VNode<Props> | null;

  type ComponentChild = VNode<any> | object | string | number | boolean | null | undefined;

  type ComponentChildren = ComponentChild[] | ComponentChild;

  type Attributes = {
    key?: string | number,
  }

  export let Fragment: Component<any>;

  export function h(
    component: string,
    props: Attributes & any,
    ...children: ComponentChildren[]
  ): VNode<any>;

  export function h<Props>(
    component: Component<Props>,
    props?: Attributes & Props | null,
    ...children: ComponentChildren[],
  ): VNode<Props>;

  export function render(
    node: VNode<any>,
    element: HTMLElement,
  ): void

  export type Context<T> = {
    Consumer: Component<{
      children?: (value: T) => any
    }>,
    Provider: Component<{
      value?: T,
      children?: any
    }>
  }

  export function createContext<T>(initialValue?: T): Context<T>;

  export function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initialState: S
  ): [S, (action: A) => void];

  export function useState<T>(
    initialValue?: T
  ): [T, (value: T) => void];

  export function useRef<T>(
    initialValue?: T
  ): Ref<T>

  export function useEffect(
    callback: () => (() => void) | void,
    deps: any[]
  ): void

  export function useContext<T>(
    context: Context<T>
  ): T;
}

export = Preact;
export as namespace Preact;

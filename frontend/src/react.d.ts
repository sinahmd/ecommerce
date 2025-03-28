/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  interface ReactElement {}
  interface ReactNode {}

  interface ElementRef<T> {}
  interface ComponentPropsWithoutRef<T> {}
  interface ForwardRefExoticComponent<P> {}
}

declare module "react" {
  export = React;
  export as namespace React;
}

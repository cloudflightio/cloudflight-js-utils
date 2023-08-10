# angular-display

[![@cloudflight/angular-display](https://img.shields.io/npm/v/@cloudflight/angular-display?label=@cloudflight/angular-display)](https://www.npmjs.com/package/@cloudflight/angular-display)

Breakpoint based conditional component display for angular.

## Installation

```shell
npm install --save @cloudflight/angular-display
# or
yarn add @cloudflight/angular-display
# or
pnpm add @cloudflight/angular-display
```

## Configuration

To use the library in a typesafe way you need to extend the `Breakpoints` interface using declaration merging.
The interface is exposed in the global namespace `ClfIsDisplay`.

Add the following to a `.d.ts` file that is picked up by the compiler:

```ts
declare namespace ClfIsDisplay {
    export interface Breakpoints {
        some: number;
        breakpoint: number;
        definitions: number;
        here: number;
    }
}
```

For more information check the documentation of [ClfIsDisplay.Breakpoints]()

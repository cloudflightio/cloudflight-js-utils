# RxJS-Read

This library provides the basic functionality for [`@cloudflight/akita-read`](../akita-read/README.md).

**:warning: This library is not meant to be used directly, it should only be used in combination with `@cloudflight/akita-read`. Read about why [here](../akita-read/README.md#Usage).:warning:**

That being said, you can use this library without `Akita-Read` and it will work just fine.

## Installation

```shell
npm install --save @cloudflight/akita-read
# or
yarn add @cloudflight/akita-read
# or
pnpm add @cloudflight/akita-read
```

## Goal of this library

This library aims to provide a type-save way of reusing RxJS operator pipelines to also access those values synchronously.  
It is the base of [Akita-Read](../akita-read/README.md) and aims to provide all the basic functionality so that its goal can be achieved.

To achieve this type-safety there are a few limitations when using this library. You can find them [here](#Limitations).

## Usage

To create a new Read from a BehaviorSubject you can simply use the [`readFrom`](modules.md#readFrom) function.

```ts
import { readFrom } from '@cloudflight/rxjs-read';

const subject = new BehaviorSubject('test');
const read$ = readFrom(subject);
```

The created Read can now be used to

- subscribe to the value reactively
- read the value synchronously
- pipe the value through operators similar to RxJS operators

### Subscribing to a Read

Simply call the `subscribe` method and pass it an Observer:

```ts
const subscription = read$.subscribe({
  next(value: string) {
    console.log('new value', string);
  },
  error(err: unknown) {
    console.error('new error', err);
  },
  complete() {
    console.log('subscription completed');
  },
});
```

You can stop the subscription by calling `unsubscribe`:

```ts
subscription.unsubscribe();
```

### Synchronously read the value

Simply access the `value` getter.  
This wil calculate the value synchronously:

```ts
const value = read$.value;
```

**:warning: Since the value is recalculated every time you access this getter. This operation might be very expensive. :warning:**

### Pipe the value

Like with RxJS you can pipe a Read using the provided subset of RxJS-like operators.

```ts
const pipped$: Read<number> = read$.pipe(
  map((value: string) => Number.parseInt(value, 10))
);
```

This creates a new `Read` with the result after piping the value of the original `Read`.

There are some `PipeOperator`s that can cancel the calculation in the pipeline like `filter`:

```ts
const filtered$: Read<number, true> = pipped$.pipe(
  filter((value: number) => value >= 0)
);
```

As you can see this results in a slightly different generic type for the resulting `Read`.  
The second generic parameter indicates that this is a cancelling `Read`. If this parameter is true the returned type of the synchronous `value` getter automatically gets a `undefined` added.

```ts
const filteredValue: number | undefined = filtered$.value;
```

You will receive `undefined` whenever the synchronous calculation is canceled. In this case when the number is less than 0.

If you pipe the cancelling Read again the operators do not need to care that the value might be undefined:

```ts
const mappedFiltered$: Read<string, true> = filtered$.pipe(
  map((value: number) => `${value}`)
);
```

But the resulting `Read` is still a cancelling `Read` since somewhere along the pipeline there is a cancelling `PipeOperator`.

You can find all the existing operators in the [API](modules.md#Operators).

## Limitations

As you can see in all the examples of `PipeOperator`s they always contain explicit type information in some form.
Either the input value of a function is explicitly stated or the generic of that `PipeOperator` is explicitly defined.

Because of limitations in the typescript compiler it is unable to infer the types automatically, but it is able to validate the explicit types without issues.

If you forget to state the type explicitly somewhere typescript would infer the type for the resulting `Read` as `Read<any>` which of course is problematic, since you can do anything with `any`.

Because of that this library includes a safety mechanism for that case:  
Whenever the resulting type of the `Read` after piping would be `Read<any>` it will be `Read<unknown>` instead.  
That way you can instantly see that there is something off. And in reality you want to avoid using `any` anyway.

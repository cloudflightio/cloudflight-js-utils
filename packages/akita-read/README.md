# Akita-Read

This library is a small wrapper to make working with the [Akita-Store](https://opensource.salesforce.com/akita/) more convenient.

## Installation

```shell
npm install --save @cloudflight/akita-read
# or
yarn add @cloudflight/akita-read
# or
pnpm add @cloudflight/akita-read
```

## Goal of this library

Akita allows you to access the data in the store in an asynchronous way using [`select`](https://opensource.salesforce.com/akita/docs/query#select) in a synchronous way using [`getValue`](https://opensource.salesforce.com/akita/docs/query#getvalue).

**Consider the following:**  
You created a Query for your Store that reads the date and formats it using [date-fns](https://date-fns.org/).

```ts
export class ProductQuery extends Query<ProductState> {
  constructor(protected store: ProductStore) {
    super(store);
  }

  readonly expirationDate$ = this.select('expirationDate').pipe(
    map((date) => format(date, 'dd.MM.yyyy hh:mm'))
  );
}
```

For some reason you figure it would also be good to have access to this in a synchronous way so you add a getter:

```ts
export class ProductQuery extends Query<ProductState> {
  //... other stuff ...

  get expirationDate(): string {
    return format(this.getValue().expirationDate, 'dd.MM.yyyy HH:mm');
  }

  //... other stuff ...
}
```

Later you get the requirement that the expiration date always needs to be at the end of the day. So you change your implementation to:

```ts
export class ProductQuery extends Query<ProductState> {
  //... other stuff ...

  readonly expirationDate$ = this.select('expirationDate').pipe(
    map((date) => format(endOfDay(date), 'dd.MM.yyyy hh:mm'))
  );

  //... other stuff ...
}
```

Easy right?

But you just introduced a **bug**, because you forgot to change it for the synchronous access as well.

This is where this wrapper comes into play. Instead of directly selecting/reading the value you can let this library do it for you:

```ts
import { readFrom, map } from '@cloudflight/akita-read';

export class ProductQuery extends Query<ProductState> {
  constructor(protected store: ProductStore) {
    super(store);
  }

  readonly expirationDate$ = readFrom(this, 'expirationDate').pipe(
    map((date: string) => format(date, 'dd.MM.yyyy hh:mm'))
  );
}
```

And to access the value you can then do the following:

```ts
declare const productQuery: ProductQuery;

// accessing the value asynchronously
productQuery.expirationDate$.subscribe({
  next(expirationDate) {
    console.log(expirationDate);
  },
});

// accessing the value synchronously
console.log(productQuery.expirationDate$.value);
```

Now whenever you change the implementation both ways of accessing will be up-to-date.

## Usage

The akita specific functions provided by this library build on the base library [`@cloudflight/rxjs-read`](../rxjs-read/README.md).
There the base class [`Read`](../rxjs-read/classes/Read.md) and all the operators are defined and reexported in this library for convenience reasons.  
Even though you can use `@cloudflight/rxjs-read` as a standalone library, it is not recommended, because it heavily goes against the redux concepts on which RXJS is built upon.

### [Akita-Query](https://opensource.salesforce.com/akita/docs/query)

To create a Read from a Query you can simply use the `readFrom` function.  
It allows the same selection options like the normal `select` method of the Akita-Query.

```ts
import { readFrom } from '@cloudflight/akita-read';

export class ProductQuery extends Query<ProductState> {
  constructor(protected store: ProductStore) {
    super(store);
  }

  readonly expirationDate$ = readFrom(this);
}
```

For more examples check out the API documentation of [`readFrom`](modules.md#readFrom)

import {
  concurrencyPoolOfSize,
  InvalidConcurrencyPoolSizeException,
  subConcurrencyPoolFrom,
} from './concurrency-pool';
import { sleep } from './common/sleep';

describe('SubConcurrencyPool', () => {
  describe('when creating sub pool', () => {
    it('given negative number then throw error', () => {
      const parentPool = concurrencyPoolOfSize(1);

      expect(() => subConcurrencyPoolFrom(-1, parentPool)).toThrow(
        InvalidConcurrencyPoolSizeException
      );
    });

    it('given 0 then throw error', () => {
      const parentPool = concurrencyPoolOfSize(1);

      expect(() => subConcurrencyPoolFrom(0, parentPool)).toThrow(
        InvalidConcurrencyPoolSizeException
      );
    });

    it('given positive number then pool is created', () => {
      const parentPool = concurrencyPoolOfSize(1);

      expect(() => subConcurrencyPoolFrom(1, parentPool)).not.toThrow();
    });
  });

  describe('when acquiring token', () => {
    it('given parent has no free token and sub pool has no free token then acquiring does not work', async () => {
      const parentPool = concurrencyPoolOfSize(1);
      void parentPool.acquireToken();
      const subPool = subConcurrencyPoolFrom(1, parentPool);
      void subPool.acquireToken();

      const token = subPool.acquireToken();
      let acquired = false;

      void token.then(() => {
        acquired = true;
      });

      await sleep(0);

      expect(acquired).toEqual(false);
    });

    it('given parent has no free token and sub pool has free token then acquiring does not work', async () => {
      const parentPool = concurrencyPoolOfSize(1);
      void parentPool.acquireToken();
      const subPool = subConcurrencyPoolFrom(1, parentPool);

      const token = subPool.acquireToken();
      let acquired = false;

      void token.then(() => {
        acquired = true;
      });

      await sleep(0);

      expect(acquired).toEqual(false);
    });

    it('given parent has free token and sub pool has no free token then acquiring does not work', async () => {
      const parentPool = concurrencyPoolOfSize(1);
      const subPool = subConcurrencyPoolFrom(1, parentPool);
      void subPool.acquireToken();

      const token = subPool.acquireToken();
      let acquired = false;

      void token.then(() => {
        acquired = true;
      });

      await sleep(0);

      expect(acquired).toEqual(false);
    });

    it('given parent has free token and sub pool has free token then acquiring works', async () => {
      const parentPool = concurrencyPoolOfSize(1);
      const subPool = subConcurrencyPoolFrom(1, parentPool);

      const token = subPool.acquireToken();
      let acquired = false;

      void token.then(() => {
        acquired = true;
      });

      await sleep(0);

      expect(acquired).toEqual(true);
    });
  });

  describe('when releasing token', () => {
    it('given exhausted parent and sub pool then acquiring next token works', async () => {
      const parentPool = concurrencyPoolOfSize(1);
      const subPool = subConcurrencyPoolFrom(1, parentPool);

      const token1 = subPool.acquireToken();
      const token2 = subPool.acquireToken();

      let token1Acquired = false;
      let token2Acquired = false;

      void token1.then(() => {
        token1Acquired = true;
      });
      void token2.then(() => {
        token2Acquired = true;
      });

      await sleep(0);

      expect(token1Acquired).toEqual(true);
      expect(token2Acquired).toEqual(false);

      (await token1).release();

      await sleep(0);

      expect(token2Acquired).toEqual(true);
    });
  });
});

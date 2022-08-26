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

    it('given positive number the pool starts idle', () => {
      const parentPool = concurrencyPoolOfSize(1);
      const subPool = subConcurrencyPoolFrom(1, parentPool);

      expect(subPool.isIdle).toEqual(true);
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

    it(
      'given parent has free tokens and tokens are acquired through the sub pool ' +
        'then both the parent and sub pool should be idle once all the sub pool tokens where released',
      async () => {
        const parentPool = concurrencyPoolOfSize(4);
        const subPool = subConcurrencyPoolFrom(2, parentPool);

        const token1 = subPool.acquireToken();
        const token2 = subPool.acquireToken();

        await sleep(0);

        expect(parentPool.isIdle).toEqual(false);
        expect(subPool.isIdle).toEqual(false);

        (await token1).release();
        expect(parentPool.isIdle).toEqual(false);
        expect(subPool.isIdle).toEqual(false);

        (await token2).release();
        expect(parentPool.isIdle).toEqual(true);
        expect(subPool.isIdle).toEqual(true);
      }
    );

    it('given a hierarchy of sub pools and all sub pool tokens released then the pools should be idle', async () => {
      const parentPool = concurrencyPoolOfSize(4);
      const subPool1 = subConcurrencyPoolFrom(2, parentPool);
      const subPool2 = subConcurrencyPoolFrom(2, parentPool);
      const subSubPool = subConcurrencyPoolFrom(1, subPool1);

      const parentToken = parentPool.acquireToken();
      const subToken1 = subPool1.acquireToken();
      const subToken2 = subPool2.acquireToken();
      const subSubToken = subSubPool.acquireToken();
      expect(parentPool.isIdle).toEqual(false);
      expect(subPool1.isIdle).toEqual(false);
      expect(subPool2.isIdle).toEqual(false);
      expect(subSubPool.isIdle).toEqual(false);

      (await subToken1).release();
      expect(parentPool.isIdle).toEqual(false);
      expect(subPool1.isIdle).toEqual(false);
      expect(subPool2.isIdle).toEqual(false);
      expect(subSubPool.isIdle).toEqual(false);

      (await subToken2).release();
      expect(parentPool.isIdle).toEqual(false);
      expect(subPool1.isIdle).toEqual(false);
      expect(subPool2.isIdle).toEqual(true);
      expect(subSubPool.isIdle).toEqual(false);

      (await subSubToken).release();
      expect(parentPool.isIdle).toEqual(false);
      expect(subPool1.isIdle).toEqual(true);
      expect(subPool2.isIdle).toEqual(true);
      expect(subSubPool.isIdle).toEqual(true);

      (await parentToken).release();
      expect(parentPool.isIdle).toEqual(true);
      expect(subPool1.isIdle).toEqual(true);
      expect(subPool2.isIdle).toEqual(true);
      expect(subSubPool.isIdle).toEqual(true);
    });

    it('given the parent has no free tokens and the sub pool did not provide tokens then the sub pool should be idle', async () => {
      const parentPool = concurrencyPoolOfSize(1);
      const subPool = subConcurrencyPoolFrom(1, parentPool);

      const token1 = parentPool.acquireToken();
      const token2 = parentPool.acquireToken();

      expect(parentPool.isIdle).toEqual(false);
      expect(subPool.isIdle).toEqual(true);

      (await token1).release();
      expect(parentPool.isIdle).toEqual(false);
      expect(subPool.isIdle).toEqual(true);

      (await token2).release();
      expect(parentPool.isIdle).toEqual(true);
      expect(subPool.isIdle).toEqual(true);
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

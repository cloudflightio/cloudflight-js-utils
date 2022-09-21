import {
  concurrencyPoolOfSize,
  InvalidConcurrencyPoolSizeException,
} from './concurrency-pool';
import { sleep } from './common/sleep';

describe('ConcurrencyPool', () => {
  describe('when creating pool', () => {
    it('given negative number then throw error', () => {
      expect(() => concurrencyPoolOfSize(-1)).toThrow(
        InvalidConcurrencyPoolSizeException
      );
    });

    it('given 0 then throw error', () => {
      expect(() => concurrencyPoolOfSize(0)).toThrow(
        InvalidConcurrencyPoolSizeException
      );
    });

    it('given positive number then pool is created', () => {
      expect(() => concurrencyPoolOfSize(1)).not.toThrow();
    });
  });

  describe('when acquiring single token', () => {
    it('given pool with one token then acquiring one works', async () => {
      const pool = concurrencyPoolOfSize(1);

      const token = pool.acquireToken();

      let acquired = false;
      void token.then(() => {
        acquired = true;
      });

      await sleep(0);

      expect(acquired).toEqual(true);
    });

    it('given pool with multiple token when then acquiring works', async () => {
      const pool = concurrencyPoolOfSize(3);

      const token = pool.acquireToken();

      let acquired = false;
      void token.then(() => {
        acquired = true;
      });

      await sleep(0);

      expect(acquired).toEqual(true);
    });
  });

  describe('when acquiring multiple token', () => {
    it('given pool with one token then acquiring works after releasing previous ones', async () => {
      const pool = concurrencyPoolOfSize(1);

      const token1 = pool.acquireToken();
      const token2 = pool.acquireToken();
      const token3 = pool.acquireToken();

      let acquired1 = false;
      let acquired2 = false;
      let acquired3 = false;
      void token1.then(() => {
        acquired1 = true;
      });
      void token2.then(() => {
        acquired2 = true;
      });
      void token3.then(() => {
        acquired3 = true;
      });

      await sleep(0);

      expect(acquired1).toEqual(true);
      expect(acquired2).toEqual(false);
      expect(acquired3).toEqual(false);

      (await token1).release();
      await sleep(0);

      expect(acquired2).toEqual(true);
      expect(acquired3).toEqual(false);

      (await token2).release();
      await sleep(0);

      expect(acquired3).toEqual(true);
    });

    it('given pool with multiple token then acquiring works', async () => {
      const pool = concurrencyPoolOfSize(3);

      const token1 = pool.acquireToken();
      const token2 = pool.acquireToken();
      const token3 = pool.acquireToken();

      let acquired1 = false;
      let acquired2 = false;
      let acquired3 = false;
      void token1.then(() => {
        acquired1 = true;
      });
      void token2.then(() => {
        acquired2 = true;
      });
      void token3.then(() => {
        acquired3 = true;
      });

      await sleep(0);

      expect(acquired1).toEqual(true);
      expect(acquired2).toEqual(true);
      expect(acquired3).toEqual(true);
    });
  });

  describe('when releasing a token', () => {
    it('given multiple tokens acquired then releasing the same token multiple times should only release it once', async () => {
      const pool = concurrencyPoolOfSize(2);

      const token1 = pool.acquireToken();
      const token2 = pool.acquireToken();
      const token3 = pool.acquireToken();
      const token4 = pool.acquireToken();

      let acquired1 = false;
      let acquired2 = false;
      let acquired3 = false;
      let acquired4 = false;
      void token1.then(() => {
        acquired1 = true;
      });
      void token2.then(() => {
        acquired2 = true;
      });
      void token3.then(() => {
        acquired3 = true;
      });
      void token4.then(() => {
        acquired4 = true;
      });

      await sleep(0);

      expect(acquired1).toEqual(true);
      expect(acquired2).toEqual(true);
      expect(acquired3).toEqual(false);
      expect(acquired4).toEqual(false);

      (await token1).release();
      (await token1).release();
      (await token1).release();

      await sleep(0);

      expect(acquired2).toEqual(true);
      expect(acquired3).toEqual(true);
      expect(acquired4).toEqual(false);
    });
  });
});

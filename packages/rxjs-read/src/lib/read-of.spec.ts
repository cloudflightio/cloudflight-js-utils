import {from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {Read} from './read';
import {readOf} from './read-of';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('readOf', () => {
    describe('when creating a new Read of a value', () => {
        let read: Read<string>;
        const expectedValue = 'value';

        beforeEach(() => {
            read = readOf(expectedValue);
        });

        it('should be created', () => {
            expect(read).toBeDefined();
        });

        describe('and when subscribing', () => {
            it('should observe the whole state', () => {
                testScheduler.run(({expectObservable, cold}) => {
                    const expected$ = cold('(a|)', {a: expectedValue});
                    expectObservable(from(read)).toEqual(expected$);
                });
            });
        });

        describe('and when synchronously accessing', () => {
            it('should return the whole state', () => {
                expect(read.value).toEqual(expectedValue);
            });
        });
    });
});

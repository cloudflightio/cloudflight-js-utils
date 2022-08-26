import { Component } from '@angular/core';
import { TeleportService } from './teleport.service';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'clf-test-component',
  template: ``,
})
class TestComponent {}

describe('TeleportDirective', () => {
  let service: TeleportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [TestComponent] });

    service = TestBed.inject(TeleportService);
  });

  test('given target when creating then target has source as child', () => {
    const target = document.createElement('div');

    service.create(TestComponent, target);

    expect(target.childElementCount).toEqual(1);
  });

  it('given component destroyed when creating then target does not have source as child', () => {
    const target = document.createElement('div');

    const ref = service.create(TestComponent, target);

    ref.destroy();

    expect(target.childElementCount).toEqual(0);
  });
});

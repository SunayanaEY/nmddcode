import { TestBed } from '@angular/core/testing';

import { HeartbeatServiceService } from './heartbeat-service.service';

describe('HeartbeatServiceService', () => {
  let service: HeartbeatServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartbeatServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { expect } from 'chai';
import { indexEmail } from '../services';

describe('ES service', () => {
  it('indexEmail should not throw', async () => {
    await indexEmail({ id: '1', from: 'a@b.com', to: ['x@x.com'], subject: 't', date: new Date().toISOString(), body: 'b' } as any);
  });
});

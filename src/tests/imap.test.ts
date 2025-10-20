import { expect } from 'chai';
import { fetchRecentEmails } from '../services/imap';

describe('IMAP service', () => {
  it('fetchRecentEmails should return an array', async () => {
    const emails = await fetchRecentEmails();
    expect(emails).to.be.an('array');
  });
});

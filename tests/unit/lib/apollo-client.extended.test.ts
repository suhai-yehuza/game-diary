import { apolloClient } from '@/lib/apollo-client';

describe('apolloClient configuration', () => {
  it('should be defined with cache and link', () => {
    expect(apolloClient).toBeTruthy();
    // access a couple of fields to ensure initialization code paths are covered

    const anyClient = apolloClient as any;
    expect(anyClient.link).toBeTruthy();
    expect(anyClient.cache).toBeTruthy();
  });
});

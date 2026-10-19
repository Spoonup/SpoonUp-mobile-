import {
  homeService,
  mockHomeControls,
} from '../src/features/home/services/homeService';

describe('homeService', () => {
  afterEach(() => {
    mockHomeControls.fail = false;
  });

  test('resolves home content', async () => {
    await expect(homeService.get()).resolves.toMatchObject({
      location: { pincode: '560102' },
    });
  });

  test('rejects when forced to fail, so Home shows ErrorState with retry', async () => {
    mockHomeControls.fail = true;
    await expect(homeService.get()).rejects.toThrow();
  });
});

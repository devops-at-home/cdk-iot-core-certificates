import { getCertIdFromARN } from './iot';

beforeEach(() => {
  jest.resetAllMocks();
});

it.each`
  arn                                                                        | certID
  ${'arn:aws:iot:ap-southeast-1:123456789012:cert/ac736b56174a6da252dc7006'} | ${'ac736b56174a6da252dc7006'}
  ${'arn:aws:iot:us-west-2:123456789012:cert/fa5135eb1ee371c15f5cb180'}      | ${'fa5135eb1ee371c15f5cb180'}
`('gets cert ID from ARN', async ({ arn, certID }) => {
  const response = getCertIdFromARN(arn);
  expect(response).toBe(certID);
});

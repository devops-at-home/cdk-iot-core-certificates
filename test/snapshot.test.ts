import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ThingWithCert } from '../src';

describe('Snapshot test', () => {
  const stack = new Stack();

  new ThingWithCert(stack, 'ThingWithCert', {
    thingName: 'thingName',
    saveToParamStore: true,
    paramPrefix: 'paramPrefix',
  });

  const template = Template.fromStack(stack);

  test('Snapshot test', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});

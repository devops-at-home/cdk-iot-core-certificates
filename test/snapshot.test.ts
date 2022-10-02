import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { IotCertificateWithDefaultCa, IotThing } from '../src';

describe('Snapshot test', () => {
    const stack = new Stack();

    const certificate = new IotCertificateWithDefaultCa(stack, 'IotCertificateWithDefaultCa', {
        paramStorePath: 'some/path',
    });

    new IotThing(stack, 'IotThing', {
        thingName: 'thingName',
        certificate,
        statements: [],
    });

    const template = Template.fromStack(stack);

    test('Snapshot test', () => {
        expect(template.toJSON()).toMatchSnapshot();
    });
});

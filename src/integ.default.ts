import * as cdk from '@aws-cdk/core';
import { ThingWithCert } from './';

export class IntegTesting {
  readonly stack: cdk.Stack[];
  constructor() {
    const app = new cdk.App();

    const env = {
      region:
        process.env.CDK_INTEG_REGION ||
        process.env.CDK_DEFAULT_REGION ||
        'us-east-1',
      account: process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    };

    const stack = new cdk.Stack(app, 'integ-stack', { env });

    new ThingWithCert(stack, 'ThingWithCert', {
      thingName: 'thingName',
      saveToParamStore: true,
    });

    this.stack = [stack];
  }
}

new IntegTesting();

import { CfnCustomResource } from '@aws-cdk/aws-cloudformation';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { RetentionDays } from '@aws-cdk/aws-logs';
import * as ssm from '@aws-cdk/aws-ssm';
import * as cdk from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';

export interface ThingWithCertProps extends cdk.ResourceProps {
  readonly thingName: string;
  readonly saveToParamStore?: boolean;
  readonly paramPrefix?: string;
}

export class ThingWithCert extends cdk.Construct {
  public readonly thingArn: string;
  public readonly certId: string;
  public readonly certPem: string;
  public readonly privKey: string;
  constructor(scope: cdk.Construct, id: string, props: ThingWithCertProps) {
    super(scope, id);

    const { thingName, saveToParamStore, paramPrefix } = props;

    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
      ),
    });

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
      }),
    );

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['iot:*'],
      }),
    );

    const lambdaFunction = new NodejsFunction(this, 'lambdaFunction', {
      entry: `${__dirname}/lambda/index.ts`,
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(10),
      role: lambdaExecutionRole,
      logRetention: RetentionDays.ONE_DAY,
    });

    const lambdaProvider = new Provider(this, 'lambdaProvider', {
      onEventHandler: lambdaFunction,
    });

    const lambdaCustomResource = new CfnCustomResource(
      this,
      'lambdaCustomResource',
      {
        serviceToken: lambdaProvider.serviceToken,
      },
    );

    lambdaCustomResource.addPropertyOverride('ThingName', thingName);

    let paramStorePath = paramPrefix
      ? `${paramPrefix}/${thingName}`
      : thingName;

    if (saveToParamStore) {
      new ssm.CfnParameter(this, 'paramStoreCertPem', {
        type: 'String',
        value: lambdaCustomResource.getAtt('certPem').toString(),
        name: `${paramStorePath}/certPem`,
      });

      new ssm.CfnParameter(this, 'paramStorePrivKey', {
        type: 'String',
        value: lambdaCustomResource.getAtt('privKey').toString(),
        name: `${paramStorePath}/privKey`,
      });
    }

    this.thingArn = lambdaCustomResource.getAtt('thingArn').toString();
    this.certId = lambdaCustomResource.getAtt('certId').toString();
    this.certPem = lambdaCustomResource.getAtt('certPem').toString();
    this.privKey = lambdaCustomResource.getAtt('privKey').toString();
  }
}

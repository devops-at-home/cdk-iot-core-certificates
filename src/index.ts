import { Duration, ResourceProps } from 'aws-cdk-lib';
import { CfnCustomResource } from 'aws-cdk-lib/aws-cloudformation';
import { CompositePrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface ThingWithCertProps extends ResourceProps {
  readonly thingName: string;
  readonly saveToParamStore?: boolean;
  readonly paramPrefix?: string;
}

export class ThingWithCert extends Construct {
  public readonly thingArn: string;
  public readonly certId: string;
  public readonly certPem: string;
  public readonly privKey: string;
  constructor(scope: Construct, id: string, props: ThingWithCertProps) {
    super(scope, id);

    const { thingName, saveToParamStore, paramPrefix } = props;

    const lambdaExecutionRole = new Role(this, 'LambdaExecutionRole', {
      assumedBy: new CompositePrincipal(new ServicePrincipal('lambda.amazonaws.com')),
    });

    lambdaExecutionRole.addToPolicy(
      new PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      })
    );

    lambdaExecutionRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['iot:*'],
      })
    );

    const lambdaFunction = new NodejsFunction(this, 'lambdaFunction', {
      entry: `${__dirname}/lambda/index.ts`,
      handler: 'handler',
      timeout: Duration.seconds(10),
      role: lambdaExecutionRole,
      logRetention: RetentionDays.ONE_DAY,
    });

    const lambdaProvider = new Provider(this, 'lambdaProvider', {
      onEventHandler: lambdaFunction,
    });

    const lambdaCustomResource = new CfnCustomResource(this, 'lambdaCustomResource', {
      serviceToken: lambdaProvider.serviceToken,
    });

    lambdaCustomResource.addPropertyOverride('ThingName', thingName);

    let paramStorePath = paramPrefix ? `${paramPrefix}/${thingName}` : thingName;

    if (saveToParamStore) {
      new CfnParameter(this, 'paramStoreCertPem', {
        type: 'String',
        value: lambdaCustomResource.getAtt('certPem').toString(),
        name: `${paramStorePath}/certPem`,
      });

      new CfnParameter(this, 'paramStorePrivKey', {
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

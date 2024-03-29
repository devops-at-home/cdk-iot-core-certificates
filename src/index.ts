import { Duration, ResourceProps } from 'aws-cdk-lib';
import { CfnCustomResource } from 'aws-cdk-lib/aws-cloudformation';
import { CompositePrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { join } from 'path';

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

        const role = new Role(this, 'LambdaExecutionRole', {
            assumedBy: new CompositePrincipal(new ServicePrincipal('lambda.amazonaws.com')),
        });

        role.addToPolicy(
            new PolicyStatement({
                resources: ['arn:aws:logs:*:*:*'],
                actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
            })
        );

        role.addToPolicy(
            new PolicyStatement({
                resources: ['*'],
                actions: ['iot:*'],
            })
        );

        const onEventHandler = new NodejsFunction(this, 'lambdaFunction', {
            entry: join(__dirname, 'lambda', 'index.js'),
            handler: 'handler',
            timeout: Duration.seconds(10),
            role,
            logRetention: RetentionDays.ONE_DAY,
        });

        const { serviceToken } = new Provider(this, 'lambdaProvider', {
            onEventHandler,
        });

        const lambdaCustomResource = new CfnCustomResource(this, 'lambdaCustomResource', {
            serviceToken,
        });

        lambdaCustomResource.addPropertyOverride('ThingName', thingName);

        const paramStorePath = getParamStorePath(thingName, paramPrefix);

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

export const getParamStorePath = (thingName: string, paramPrefix?: string) => {
    if (thingName.charAt(0) === '/') {
        throw new Error("thingName cannot start with '/'");
    }

    if (paramPrefix && paramPrefix.charAt(0) === '/') {
        throw new Error("paramPrefix cannot start with '/'");
    }

    return paramPrefix ? `/${paramPrefix}/${thingName}` : `/${thingName}`;
};

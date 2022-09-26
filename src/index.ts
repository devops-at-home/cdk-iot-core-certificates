import { Duration, ResourceProps } from 'aws-cdk-lib';
import { CfnCustomResource } from 'aws-cdk-lib/aws-cloudformation';
import { CompositePrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { CustomResourceFunction } from './custom-resource-function';

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

        const onEventHandler = new CustomResourceFunction(this, 'CustomResourceFunction', {
            role,
            timeout: Duration.seconds(10),
            logRetention: RetentionDays.ONE_DAY,
        });

        const { serviceToken } = new Provider(this, 'lambdaProvider', {
            onEventHandler,
        });

        const lambdaCustomResource = new CfnCustomResource(this, 'lambdaCustomResource', {
            serviceToken,
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

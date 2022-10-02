import { Duration, ResourceProps, Token } from 'aws-cdk-lib';
import { CfnCertificate, CfnPolicyPrincipalAttachment, CfnThingPrincipalAttachment } from 'aws-cdk-lib/aws-iot';
import { CfnCustomResource } from 'aws-cdk-lib/aws-cloudformation';
import {
    CfnPolicy,
    CompositePrincipal,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { CfnCACertificate, CfnThing } from 'aws-cdk-lib/aws-iot';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

type IIotCoreCertficate = {
    certId: string;
    certArn: string;
};

type IIotCaCertificate = {
    readonly certId: string;
    readonly certArn: string;
    readonly caCertificatePem: string;
};

export interface IotThingProps extends ResourceProps {
    readonly thingName: string;
    readonly statements: PolicyStatement[];
    readonly certificate: IIotCoreCertficate;
    readonly attributePayload?: CfnThing.AttributePayloadProperty;
}

export class IotThing extends Construct {
    public readonly thingName: string;
    constructor(scope: Construct, id: string, props: IotThingProps) {
        super(scope, id);

        const { thingName, statements, certificate } = props;

        const thing = new CfnThing(this, 'CfnThing', {
            ...props,
        });

        this.thingName = thing.ref;

        const policyDocument = new PolicyDocument({ statements });

        const policy = new CfnPolicy(this, 'Policy', { policyDocument, policyName: thingName });

        new CfnThingPrincipalAttachment(this, 'TPA', {
            thingName: thing.ref,
            principal: Token.asString(certificate.certArn),
        });

        new CfnPolicyPrincipalAttachment(this, 'PPA', {
            policyName: Token.asString(policy.getAtt('Id')),
            principal: Token.asString(certificate.certArn),
        });
    }
}

// class IotCertificate extends Construct {
//     public readonly certId: string;
//     public readonly certArn: string;
// }

export interface IotCertificateFromFilesProps extends ResourceProps {
    readonly certificatePemFile: string; // Eg. "certs/device_cert_filename.pem"
    readonly caCert: IIotCaCertificate;
}

export class IotCertificateFromFiles extends Construct {
    public readonly certId: string;
    public readonly certArn: string;
    constructor(scope: Construct, id: string, props: IotCertificateFromFilesProps) {
        super(scope, id);

        const { caCert, certificatePemFile } = props;

        const { caCertificatePem } = caCert;

        const cert = new CfnCertificate(this, 'Certificate', {
            status: 'ACTIVE',
            certificatePem: readFileSync(resolve(certificatePemFile), 'utf8'),
            caCertificatePem,
        });

        cert.node.addDependency(caCert);

        this.certArn = cert.attrArn;
        this.certId = cert.attrId;
    }
}

export interface IotCaCertificateFromFilesProps extends ResourceProps {
    readonly caCertificatePemFile: string; // Eg. "certs/root_CA_cert_filename.pem"
    readonly verificationCertificatePemFile: string; // Eg. "certs/verification_cert_filename.pem"
}

export class IotCaCertificateFromFiles extends Construct {
    public readonly certId: string;
    public readonly certArn: string;
    public readonly caCertificatePem: string;
    constructor(scope: Construct, id: string, props: IotCaCertificateFromFilesProps) {
        super(scope, id);

        const { caCertificatePemFile, verificationCertificatePemFile } = props;

        const caCert = new CfnCACertificate(this, 'CACertificate', {
            caCertificatePem: readFileSync(resolve(caCertificatePemFile), 'utf8'),
            status: 'ACTIVE',
            verificationCertificatePem: readFileSync(resolve(verificationCertificatePemFile), 'utf8'),
        });

        this.certArn = caCert.attrArn;
        this.certId = caCert.attrId;
        this.caCertificatePem = caCert.caCertificatePem;
    }
}

export interface IotCertificateWithDefaultCaProps extends ResourceProps {
    readonly paramStorePath: string;
}

export class IotCertificateWithDefaultCa extends Construct {
    public readonly certId: string;
    public readonly certArn: string;
    constructor(scope: Construct, id: string, props: IotCertificateWithDefaultCaProps) {
        super(scope, id);

        const { paramStorePath } = props;

        const role = new Role(this, 'LambdaExecutionRole', {
            assumedBy: new CompositePrincipal(new ServicePrincipal('lambda.amazonaws.com')),
        });

        role.addToPolicy(
            new PolicyStatement({
                resources: ['arn:aws:logs:*:*:*'],
                actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
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

        const privKey = lambdaCustomResource.getAtt('privKey').toString();
        const certId = lambdaCustomResource.getAtt('certId').toString();

        new CfnParameter(this, 'Parameter', {
            type: 'String',
            value: privKey,
            name: paramStorePath,
        });

        this.certArn = `arn::${certId}`;
        this.certId = certId;
    }
}

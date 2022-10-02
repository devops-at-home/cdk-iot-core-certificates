import { ResourceProps, Token } from 'aws-cdk-lib';
import { CfnCertificate, CfnPolicyPrincipalAttachment, CfnThingPrincipalAttachment } from 'aws-cdk-lib/aws-iot';
import { CfnPolicy, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnCACertificate, CfnThing } from 'aws-cdk-lib/aws-iot';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
    PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DeleteCertificateFunction } from './lambda/delete-certificate-function';

// From: https://github.com/aws-samples/aws-cdk-examples/pull/717/commits/a7679b0de9a555eff0bbe53dd5dd3eddd3bfb962

interface IIotCoreCertficate {
    readonly certificateId: string;
    readonly certificateArn: string;
}

interface IIotCaCertificate {
    readonly certificateId: string;
    readonly certificateArn: string;
    readonly caCertificatePem: string;
}

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

        // https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/469
        const policyDocument = new PolicyDocument({ statements });

        const policy = new CfnPolicy(this, 'Policy', { policyDocument, policyName: thingName });

        new CfnThingPrincipalAttachment(this, 'TPA', {
            thingName: thing.ref,
            principal: Token.asString(certificate.certificateArn),
        });

        new CfnPolicyPrincipalAttachment(this, 'PPA', {
            policyName: Token.asString(policy.getAtt('Id')),
            principal: Token.asString(certificate.certificateArn),
        });
    }
}

// class IotCertificate extends Construct {
//     public readonly certificateId: string;
//     public readonly certificateArn: string;
// }

export interface IotCertificateFromFilesProps extends ResourceProps {
    readonly certificatePemFile: string; // Eg. "certs/device_cert_filename.pem"
    readonly caCert: IIotCaCertificate;
}

export class IotCertificateFromFiles extends Construct {
    public readonly certificateId: string;
    public readonly certificateArn: string;
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

        this.certificateArn = cert.attrArn;
        this.certificateId = cert.attrId;
    }
}

export interface IotCaCertificateFromFilesProps extends ResourceProps {
    readonly caCertificatePemFile: string; // Eg. "certs/root_CA_cert_filename.pem"
    readonly verificationCertificatePemFile: string; // Eg. "certs/verification_cert_filename.pem"
}

export class IotCaCertificateFromFiles extends Construct {
    public readonly certificateId: string;
    public readonly certificateArn: string;
    public readonly caCertificatePem: string;
    constructor(scope: Construct, id: string, props: IotCaCertificateFromFilesProps) {
        super(scope, id);

        const { caCertificatePemFile, verificationCertificatePemFile } = props;

        const caCert = new CfnCACertificate(this, 'CACertificate', {
            caCertificatePem: readFileSync(resolve(caCertificatePemFile), 'utf8'),
            status: 'ACTIVE',
            verificationCertificatePem: readFileSync(resolve(verificationCertificatePemFile), 'utf8'),
        });

        this.certificateArn = caCert.attrArn;
        this.certificateId = caCert.attrId;
        this.caCertificatePem = caCert.caCertificatePem;
    }
}

export interface IotCertificateWithDefaultCaProps extends ResourceProps {
    readonly paramStorePath: string;
}

export class IotCertificateWithDefaultCa extends Construct {
    public readonly certificateId: string;
    public readonly certificateArn: string;
    constructor(scope: Construct, id: string, props: IotCertificateWithDefaultCaProps) {
        super(scope, id);

        const { paramStorePath } = props;

        const onDeleteFn = new DeleteCertificateFunction(this, 'Function');

        const awsCustom = new AwsCustomResource(this, 'AwsCustomResource', {
            onCreate: {
                service: 'iotcore', // TODO: check this
                action: 'CreateKeysAndCertificate',
                physicalResourceId: PhysicalResourceId.fromResponse('certificateId'),
                parameters: {
                    setAsActive: true,
                },
            },
            onDelete: {
                service: 'lambda',
                action: 'Invoke',
                parameters: {
                    Payload: {
                        certificateId: new PhysicalResourceIdReference(),
                    }, // TODO: Check this is being passed in correctly
                    FunctionName: onDeleteFn.functionName,
                },
            },
            resourceType: 'Custom::IoT::Certificate',
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE, // TODO: Check permissions
            }),
        });

        const privateKey = awsCustom.getResponseField('keyPair.PrivateKey');
        const certificateId = awsCustom.getResponseField('certificateId');
        const certificateArn = awsCustom.getResponseField('certificateArn');

        new CfnParameter(this, 'Parameter', {
            type: 'String',
            value: privateKey,
            name: paramStorePath,
        });

        this.certificateArn = certificateArn;
        this.certificateId = certificateId;
    }
}

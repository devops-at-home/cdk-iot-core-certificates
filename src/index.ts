import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Provider } from "@aws-cdk/custom-resources";
import { RetentionDays } from "@aws-cdk/aws-logs";
import * as ssm from "@aws-cdk/aws-ssm";
import { CfnCustomResource } from "@aws-cdk/aws-cloudformation";

export interface ThingWithCertProps {
  readonly deviceName: string;
  readonly saveToParamStore?: boolean;
  readonly paramPrefix?: string;
}

export class ThingWithCert extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ThingWithCertProps) {
    super(scope, id);

    const { deviceName, saveToParamStore, paramPrefix } = props;

    const lambdaExecutionRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal("lambda.amazonaws.com")
      ),
    });

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["arn:aws:logs:*:*:*"],
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
      })
    );

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["iot:*"],
      })
    );

    const lambdaFunction = new NodejsFunction(this, "lambdaFunction", {
      entry: `${__dirname}/lambda/index.ts`,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(10),
      role: lambdaExecutionRole,
      logRetention: RetentionDays.ONE_DAY,
    });

    const lambdaProvider = new Provider(this, "lambdaProvider", {
      onEventHandler: lambdaFunction,
    });

    const lambdaCustomResource = new CfnCustomResource(
      this,
      "lambdaCustomResource",
      {
        serviceToken: lambdaProvider.serviceToken,
      }
    );

    lambdaCustomResource.addPropertyOverride("ThingName", deviceName);

    if (saveToParamStore) {
      new ssm.CfnParameter(this, "paramStoreCertPem", {
        type: "String",
        value: lambdaCustomResource.getAtt("certPem").toString(),
        name: `${paramPrefix}/${deviceName}/certPem`,
      });

      new ssm.CfnParameter(this, "paramStorePrivKey", {
        type: "String",
        value: lambdaCustomResource.getAtt("privKey").toString(),
        name: `${paramPrefix}/${deviceName}/privKey`,
      });
    }

    new cdk.CfnOutput(this, "thingArn", {
      value: lambdaCustomResource.getAtt("thingArn").toString(),
    });

    new cdk.CfnOutput(this, "certId", {
      value: lambdaCustomResource.getAtt("certId").toString(),
    });

    new cdk.CfnOutput(this, "certPem", {
      value: lambdaCustomResource.getAtt("certPem").toString(),
    });

    new cdk.CfnOutput(this, "privKey", {
      value: lambdaCustomResource.getAtt("privKey").toString(),
    });
  }
}

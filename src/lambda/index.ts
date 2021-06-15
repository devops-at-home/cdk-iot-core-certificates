import * as lambda from "aws-lambda";
import { Iot } from "aws-sdk";
import { thingAdaptor } from "../lambda/adapters/thing";
import { iotAdaptor } from "../lambda/adapters/iot";

type Success = lambda.CloudFormationCustomResourceSuccessResponse;
type Failure = lambda.CloudFormationCustomResourceFailedResponse;

const thingHandler = thingAdaptor(iotAdaptor(new Iot()));

export const handler = async (
  event: lambda.CloudFormationCustomResourceEvent
): Promise<Success | Failure> => {
  console.log(`Received event: ${JSON.stringify(event)}`);
  try {
    const thingName = event.ResourceProperties["ThingName"];
    if (event.RequestType === "Create") {
      const { thingArn, certId, certPem, privKey } = await thingHandler.create(
        thingName
      );
      return {
        Status: "SUCCESS",
        PhysicalResourceId: thingArn,
        LogicalResourceId: event.LogicalResourceId,
        RequestId: event.RequestId,
        StackId: event.StackId,
        Data: {
          certPem: certPem,
          privKey: privKey,
          certId: certId,
        },
      };
    } else if (event.RequestType === "Delete") {
      await thingHandler.delete(thingName);
      return {
        Status: "SUCCESS",
        PhysicalResourceId: event.PhysicalResourceId,
        LogicalResourceId: event.LogicalResourceId,
        RequestId: event.RequestId,
        StackId: event.StackId,
      };
    } else if (event.RequestType === "Update") {
      console.log(`Updating thing: ${thingName}`);
      return {
        Status: "SUCCESS",
        PhysicalResourceId: event.PhysicalResourceId,
        LogicalResourceId: event.LogicalResourceId,
        RequestId: event.RequestId,
        StackId: event.StackId,
      };
    } else {
      throw new Error("Received invalid request type");
    }
  } catch (err) {
    return {
      Status: "FAILED",
      Reason: err.message,
      RequestId: event.RequestId,
      StackId: event.StackId,
      LogicalResourceId: event.LogicalResourceId!,
      // @ts-ignore
      PhysicalResourceId: event.PhysicalResourceId || event.LogicalResourceId,
    };
  }
};

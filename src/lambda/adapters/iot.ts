import { Iot } from "aws-sdk";
import { IotPort } from "../ports/iot";

export const iotAdaptor = (iot: Iot): IotPort => {
  return {
    createThing: async (thingRequest) => {
      return await iot.createThing(thingRequest).promise();
    },
    createKeysAndCertificates: async () => {
      return await iot
        .createKeysAndCertificate({
          setAsActive: true,
        })
        .promise();
    },
    createPolicy: async (thingName) => {
      return await iot
        .createPolicy({
          policyName: thingName,
          policyDocument: policyDoc,
        })
        .promise();
    },
    attachPrincipalPolicy: async (props) => {
      await iot.attachPrincipalPolicy(props).promise();
    },
    attachThingPrincipal: async (props) => {
      return await iot.attachThingPrincipal(props).promise();
    },
    listThingPrincipals: async (thingName) => {
      return await iot
        .listThingPrincipals({
          thingName: thingName,
        })
        .promise();
    },
    detachPrincipalPolicy: async (props) => {
      await iot.detachPrincipalPolicy(props).promise();
    },
    detachThingPrincipal: async (props) => {
      return await iot.detachThingPrincipal(props).promise();
    },
    updateCertificateToInactive: async (certArn) => {
      await iot
        .updateCertificate({
          certificateId: getCertIdFromARN(certArn),
          newStatus: "INACTIVE",
        })
        .promise();
    },
    deleteCertificate: async (certArn) => {
      await iot
        .deleteCertificate({
          certificateId: getCertIdFromARN(certArn),
        })
        .promise();
    },
    deletePolicy: async (policyName) => {
      await iot
        .deletePolicy({
          policyName: policyName,
        })
        .promise();
    },
    deleteThing: async (thingName) => {
      await iot
        .deleteThing({
          thingName: thingName,
        })
        .promise();
    },
  };
};

export const getCertIdFromARN = (arn: string) => {
  return arn.split("/")[1];
};

const policyDoc = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Subscribe",
        "iot:Connect",
        "iot:Receive"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:GetThingShadow",
        "iot:UpdateThingShadow",
        "iot:DeleteThingShadow"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}`;

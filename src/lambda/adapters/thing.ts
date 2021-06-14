import { ThingPort } from "../ports/thing";
import { iotAdaptor } from "./iot";

const iot = iotAdaptor();

export const thingAdaptor = (): ThingPort => {
  return {
    create: async (thingName) => {
      const { thingArn } = await iot.createThing({
        thingName: thingName,
      });
      console.log(`Thing created with ARN: ${thingArn}`);
      const { certificateId, certificateArn, certificatePem, keyPair } =
        await iot.createKeysAndCertificates();
      const { PrivateKey } = keyPair!;
      const { policyArn } = await iot.createPolicy(thingName);
      console.log(`Policy created with ARN: ${policyArn}`);
      await iot.attachPrincipalPolicy({
        policyName: thingName,
        principal: certificateArn!,
      });
      console.log("Policy attached to certificate");
      await iot.attachThingPrincipal({
        principal: certificateArn!,
        thingName: thingName,
      });
      console.log("Certificate attached to thing");
      return {
        certId: certificateId!,
        certPem: certificatePem!,
        privKey: PrivateKey!,
        thingArn: thingArn!,
      };
    },
    delete: async (thingName) => {
      const { principals } = await iot.listThingPrincipals(thingName);
      for await (const certificateArn of principals!) {
        await iot.detachPrincipalPolicy({
          policyName: thingName,
          principal: certificateArn,
        });
        console.log(`Policy detached from certificate for ${thingName}`);
        await iot.detachThingPrincipal({
          principal: certificateArn,
          thingName: thingName,
        });
        console.log(`Certificate detached from thing for ${certificateArn}`);
        await iot.updateCertificateToInactive(certificateArn);
        console.log(`Certificate marked as inactive for ${certificateArn}`);

        await iot.deleteCertificate(certificateArn);
        console.log(`Certificate deleted from thing for ${certificateArn}`);
        await iot.deleteThing(thingName);
        console.log(`Thing deleted with name: ${thingName}`);
      }
      await iot.deletePolicy(thingName);
      console.log(`Policy deleted: ${thingName}`);
    },
  };
};

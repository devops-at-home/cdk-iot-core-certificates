import { ThingPort } from "../ports/thing";
import { IotPort } from "../ports/iot";

export const thingAdaptor = (iotAdaptor: IotPort): ThingPort => {
  return {
    create: async (thingName) => {
      const { thingArn } = await iotAdaptor.createThing({
        thingName: thingName,
      });
      console.log(`Thing created with ARN: ${thingArn}`);
      const { certificateId, certificateArn, certificatePem, keyPair } =
        await iotAdaptor.createKeysAndCertificates();
      const { PrivateKey } = keyPair!;
      const { policyArn } = await iotAdaptor.createPolicy(thingName);
      console.log(`Policy created with ARN: ${policyArn}`);
      await iotAdaptor.attachPrincipalPolicy({
        policyName: thingName,
        principal: certificateArn!,
      });
      console.log("Policy attached to certificate");
      await iotAdaptor.attachThingPrincipal({
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
      const { principals } = await iotAdaptor.listThingPrincipals(thingName);
      for await (const certificateArn of principals!) {
        await iotAdaptor.detachPrincipalPolicy({
          policyName: thingName,
          principal: certificateArn,
        });
        console.log(`Policy detached from certificate for ${thingName}`);
        await iotAdaptor.detachThingPrincipal({
          principal: certificateArn,
          thingName: thingName,
        });
        console.log(`Certificate detached from thing for ${certificateArn}`);
        await iotAdaptor.updateCertificateToInactive(certificateArn);
        console.log(`Certificate marked as inactive for ${certificateArn}`);

        await iotAdaptor.deleteCertificate(certificateArn);
        console.log(`Certificate deleted from thing for ${certificateArn}`);
        await iotAdaptor.deleteThing(thingName);
        console.log(`Thing deleted with name: ${thingName}`);
      }
      await iotAdaptor.deletePolicy(thingName);
      console.log(`Policy deleted: ${thingName}`);
    },
  };
};

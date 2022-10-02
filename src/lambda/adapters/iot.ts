import { Iot } from 'aws-sdk';
import { IotPort } from '../ports/iot';

export const iotAdaptor = (iot: Iot): IotPort => {
    return {
        updateCertificateToInactive: async (certificateId) => {
            await iot
                .updateCertificate({
                    certificateId,
                    newStatus: 'INACTIVE',
                })
                .promise();
        },
        deleteCertificate: async (certificateId) => {
            await iot
                .deleteCertificate({
                    certificateId,
                })
                .promise();
        },
    };
};

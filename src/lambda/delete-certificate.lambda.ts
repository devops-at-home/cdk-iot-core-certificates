import { Iot } from 'aws-sdk';
import { iotAdaptor } from './adapters/iot';

const iotHandler = iotAdaptor(new Iot());

type Event = {
    certificateId: string;
};

export const handler = async (event: Event): Promise<void> => {
    const { certificateId } = event;

    await iotHandler.updateCertificateToInactive(certificateId);

    await iotHandler.deleteCertificate(certificateId);
};

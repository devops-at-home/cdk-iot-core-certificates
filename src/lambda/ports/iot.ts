export interface IotPort {
    updateCertificateToInactive: (certificateId: string) => Promise<void>;
    deleteCertificate: (certificateId: string) => Promise<void>;
}

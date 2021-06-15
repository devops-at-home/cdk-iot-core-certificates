[![NPM version](https://badge.fury.io/js/cdk-iot-core-certificates.svg)](https://badge.fury.io/js/cdk-iot-core-certificates)
![Release](https://github.com/devops-at-home/cdk-iot-core-certificates/workflows/Release/badge.svg)

# cdk-iot-core-certificates

AWS CDK L3 construct for managing certificates for AWS IoT Core

# Sample

```ts
import { ThingWithCert } from 'cdk-iot-core-certificates';

// Creates new AWS IoT Thing called deviceName
// Saves certs to /devices/deviceName/certPem and /devices/deviceName/privKey
new ThingWithCert(stack, 'ThingWithCert', {
  deviceName: 'deviceName',
  saveToParamStore: true,
  paramPrefix: '/devices',
});
```

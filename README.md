# CDK IoT Core Certificates

[![Source](https://img.shields.io/badge/Source-GitHub-blue?logo=github)][source]
[![Release](https://github.com/devops-at-home/cdk-iot-core-certificates/workflows/Release/badge.svg)][release]
[![GitHub](https://img.shields.io/github/license/devops-at-home/cdk-iot-core-certificates)][license]
[![Docs](https://img.shields.io/badge/awscdk.io-cdk--iot--core--certificates-orange)][docs]

[![npm package](https://img.shields.io/npm/v/cdk-iot-core-certificates?color=brightgreen)][npm]

![Downloads](https://img.shields.io/badge/-DOWNLOADS:-brightgreen?color=gray)
[![npm downloads](https://img.shields.io/npm/dt/cdk-iot-core-certificates?label=npm&color=blueviolet)][npm]

[AWS CDK] L3 construct for managing certificates for [AWS IoT Core]

CloudFormation doesn't directly support creation of certificates for AWS IoT Core. This construct provides an easy interface for creating certificates through a [custom CloudFormation resource]. The private key is stored in [AWS Parameter Store].

## Installation

This package has peer dependencies, which need to be installed along in the expected version.

For TypeScript/NodeJS, add these to your `dependencies` in `package.json`:

- cdk-iot-core-certificates
- @aws-cdk/core
- @aws-cdk/aws-iam
- @aws-cdk/aws-lambda
- @aws-cdk/aws-lambda-nodejs
- @aws-cdk/custom-resources
- @aws-cdk/aws-logs
- @aws-cdk/aws-ssm
- @aws-cdk/aws-cloudformation

## Usage

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

[aws cdk]: https://aws.amazon.com/cdk/
[custom cloudformation resource]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html
[aws iot core]: https://aws.amazon.com/iot-core/
[aws parameter store]: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
[npm]: https://www.npmjs.com/package/cdk-iot-core-certificates
[docs]: https://awscdk.io/packages/cdk-iot-core-certificates@0.0.3/#/
[source]: https://github.com/devops-at-home/cdk-iot-core-certificates
[release]: https://github.com/devops-at-home/cdk-iot-core-certificates/actions/workflows/release.yml
[license]: https://github.com/devops-at-home/cdk-iot-core-certificates/blob/main/LICENSE

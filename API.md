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

-   cdk-iot-core-certificates

## Usage

```ts
import { ThingWithCert } from 'cdk-iot-core-certificates';

// Creates new AWS IoT Thing called thingName
// Saves certs to /devices/thingName/certPem and /devices/thingName/privKey
// thingName and paramPrefix cannot start with '/'
const { thingArn, certId, certPem, privKey } = new ThingWithCert(this, 'ThingWithCert', {
    thingName: 'integrationTest',
    saveToParamStore: true,
    paramPrefix: 'devices',
});

new CfnOutput(this, 'Output-ThingArn', {
    value: thingArn,
});

new CfnOutput(this, 'Output-CertId', {
    value: certId,
});

new CfnOutput(this, 'Output-CertPem', {
    value: certPem,
});

new CfnOutput(this, 'Output-PrivKey', {
    value: privKey,
});
```

[aws cdk]: https://aws.amazon.com/cdk/
[custom cloudformation resource]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html
[aws iot core]: https://aws.amazon.com/iot-core/
[aws parameter store]: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
[npm]: https://www.npmjs.com/package/cdk-iot-core-certificates
[docs]: https://awscdk.io/packages/cdk-iot-core-certificates@0.0.4/#/
[source]: https://github.com/devops-at-home/cdk-iot-core-certificates
[release]: https://github.com/devops-at-home/cdk-iot-core-certificates/actions/workflows/release.yml
[license]: https://github.com/devops-at-home/cdk-iot-core-certificates/blob/main/LICENSE

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ThingWithCert <a name="ThingWithCert" id="cdk-iot-core-certificates.ThingWithCert"></a>

#### Initializers <a name="Initializers" id="cdk-iot-core-certificates.ThingWithCert.Initializer"></a>

```typescript
import { ThingWithCert } from 'cdk-iot-core-certificates'

new ThingWithCert(scope: Construct, id: string, props: ThingWithCertProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-iot-core-certificates.ThingWithCertProps">ThingWithCertProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-iot-core-certificates.ThingWithCert.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-iot-core-certificates.ThingWithCert.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-iot-core-certificates.ThingWithCert.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-iot-core-certificates.ThingWithCertProps">ThingWithCertProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-iot-core-certificates.ThingWithCert.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-iot-core-certificates.ThingWithCert.isConstruct"></a>

```typescript
import { ThingWithCert } from 'cdk-iot-core-certificates'

ThingWithCert.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-iot-core-certificates.ThingWithCert.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.property.certId">certId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.property.certPem">certPem</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.property.privKey">privKey</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCert.property.thingArn">thingArn</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-iot-core-certificates.ThingWithCert.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `certId`<sup>Required</sup> <a name="certId" id="cdk-iot-core-certificates.ThingWithCert.property.certId"></a>

```typescript
public readonly certId: string;
```

- *Type:* string

---

##### `certPem`<sup>Required</sup> <a name="certPem" id="cdk-iot-core-certificates.ThingWithCert.property.certPem"></a>

```typescript
public readonly certPem: string;
```

- *Type:* string

---

##### `privKey`<sup>Required</sup> <a name="privKey" id="cdk-iot-core-certificates.ThingWithCert.property.privKey"></a>

```typescript
public readonly privKey: string;
```

- *Type:* string

---

##### `thingArn`<sup>Required</sup> <a name="thingArn" id="cdk-iot-core-certificates.ThingWithCert.property.thingArn"></a>

```typescript
public readonly thingArn: string;
```

- *Type:* string

---


## Structs <a name="Structs" id="Structs"></a>

### ThingWithCertProps <a name="ThingWithCertProps" id="cdk-iot-core-certificates.ThingWithCertProps"></a>

#### Initializer <a name="Initializer" id="cdk-iot-core-certificates.ThingWithCertProps.Initializer"></a>

```typescript
import { ThingWithCertProps } from 'cdk-iot-core-certificates'

const thingWithCertProps: ThingWithCertProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.account">account</a></code> | <code>string</code> | The AWS account ID this resource belongs to. |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.environmentFromArn">environmentFromArn</a></code> | <code>string</code> | ARN to deduce region and account from. |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.physicalName">physicalName</a></code> | <code>string</code> | The value passed in by users to the physical name prop of the resource. |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.region">region</a></code> | <code>string</code> | The AWS region this resource belongs to. |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.thingName">thingName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.paramPrefix">paramPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-iot-core-certificates.ThingWithCertProps.property.saveToParamStore">saveToParamStore</a></code> | <code>boolean</code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="cdk-iot-core-certificates.ThingWithCertProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string
- *Default:* the resource is in the same account as the stack it belongs to

The AWS account ID this resource belongs to.

---

##### `environmentFromArn`<sup>Optional</sup> <a name="environmentFromArn" id="cdk-iot-core-certificates.ThingWithCertProps.property.environmentFromArn"></a>

```typescript
public readonly environmentFromArn: string;
```

- *Type:* string
- *Default:* take environment from `account`, `region` parameters, or use Stack environment.

ARN to deduce region and account from.

The ARN is parsed and the account and region are taken from the ARN.
This should be used for imported resources.

Cannot be supplied together with either `account` or `region`.

---

##### `physicalName`<sup>Optional</sup> <a name="physicalName" id="cdk-iot-core-certificates.ThingWithCertProps.property.physicalName"></a>

```typescript
public readonly physicalName: string;
```

- *Type:* string
- *Default:* The physical name will be allocated by CloudFormation at deployment time

The value passed in by users to the physical name prop of the resource.

`undefined` implies that a physical name will be allocated by
   CloudFormation during deployment.
- a concrete value implies a specific physical name
- `PhysicalName.GENERATE_IF_NEEDED` is a marker that indicates that a physical will only be generated
   by the CDK if it is needed for cross-environment references. Otherwise, it will be allocated by CloudFormation.

---

##### `region`<sup>Optional</sup> <a name="region" id="cdk-iot-core-certificates.ThingWithCertProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string
- *Default:* the resource is in the same region as the stack it belongs to

The AWS region this resource belongs to.

---

##### `thingName`<sup>Required</sup> <a name="thingName" id="cdk-iot-core-certificates.ThingWithCertProps.property.thingName"></a>

```typescript
public readonly thingName: string;
```

- *Type:* string

---

##### `paramPrefix`<sup>Optional</sup> <a name="paramPrefix" id="cdk-iot-core-certificates.ThingWithCertProps.property.paramPrefix"></a>

```typescript
public readonly paramPrefix: string;
```

- *Type:* string

---

##### `saveToParamStore`<sup>Optional</sup> <a name="saveToParamStore" id="cdk-iot-core-certificates.ThingWithCertProps.property.saveToParamStore"></a>

```typescript
public readonly saveToParamStore: boolean;
```

- *Type:* boolean

---




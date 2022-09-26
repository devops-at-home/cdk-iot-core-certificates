import { StandardLogger } from 'aws-cloudformation-custom-resource';
import * as lambda from 'aws-lambda';
import { Iot } from 'aws-sdk';
import { iotAdaptor } from './adapters/iot';
import { thingAdaptor } from './adapters/thing';

const logger = new StandardLogger();

type Success = lambda.CloudFormationCustomResourceSuccessResponse;
type Failure = lambda.CloudFormationCustomResourceFailedResponse;

const thingHandler = thingAdaptor(iotAdaptor(new Iot()));

export const handler = async (event: lambda.CloudFormationCustomResourceEvent): Promise<Success | Failure> => {
    const { RequestType, LogicalResourceId, RequestId, StackId } = event;

    try {
        const thingName = event.ResourceProperties.ThingName;
        if (RequestType === 'Create') {
            const { thingArn, certId, certPem, privKey } = await thingHandler.create(thingName);

            return {
                Status: 'SUCCESS',
                PhysicalResourceId: thingArn,
                LogicalResourceId,
                RequestId,
                StackId,
                Data: {
                    certPem,
                    privKey,
                    certId,
                },
            };
        } else if (event.RequestType === 'Delete') {
            await thingHandler.delete(thingName);

            return {
                Status: 'SUCCESS',
                PhysicalResourceId: event.PhysicalResourceId,
                LogicalResourceId,
                RequestId,
                StackId,
            };
        } else if (event.RequestType === 'Update') {
            logger.info(`Updating thing: ${thingName}`);
            return {
                Status: 'SUCCESS',
                PhysicalResourceId: event.PhysicalResourceId,
                LogicalResourceId,
                RequestId,
                StackId,
            };
        } else {
            throw new Error('Received invalid request type');
        }
    } catch (err) {
        return {
            Status: 'FAILED',
            Reason: err.message,
            RequestId,
            StackId,
            LogicalResourceId,
            // @ts-ignore
            PhysicalResourceId: event.PhysicalResourceId || LogicalResourceId,
        };
    }
};

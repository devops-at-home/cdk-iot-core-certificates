import { getParamStorePath } from '../src/index';

describe('CDK helper unit tests', () => {
    test('Output when thingName param only should be /thingName', () => {
        expect(getParamStorePath('thingName')).toStrictEqual('/thingName');
    });

    test('Output when thingName param and paramPrefix should be /paramPrefix/thingName', () => {
        expect(getParamStorePath('thingName', 'paramPrefix')).toStrictEqual('/paramPrefix/thingName');
    });

    test('Should throw error when thingName has trailing slash', () => {
        expect(() => {
            getParamStorePath('/thingName', 'paramPrefix');
        }).toThrowError("thingName cannot start with '/'");
    });

    test('Should throw error when paramPrefix has trailing slash', () => {
        expect(() => {
            getParamStorePath('thingName', '/paramPrefix');
        }).toThrowError("paramPrefix cannot start with '/'");
    });
});

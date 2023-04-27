import { awscdk } from 'projen';

const project = new awscdk.AwsCdkConstructLibrary({
    author: 'DevOps@Home',
    authorAddress: 'devops.at.home@gmail.com',
    cdkVersion: '2.43.1',
    defaultReleaseBranch: 'main',
    eslint: false,
    name: 'cdk-iot-core-certificates',
    projenrcTs: true,
    repositoryUrl: 'git@github.com:devops-at-home/cdk-iot-core-certificates.git',
    license: 'MIT',
    gitignore: ['.idea'],
    devDeps: ['esbuild', '@types/aws-lambda', 'aws-lambda', 'aws-sdk'],
    prettier: true,
    prettierOptions: {
        settings: {
            printWidth: 120,
            tabWidth: 4,
            singleQuote: true,
        },
    },
    githubOptions: {
        pullRequestLint: false,
    },
    autoApproveUpgrades: true,
    autoApproveOptions: {
        allowedUsernames: ['devops-at-home'],
    },
    majorVersion: 1,
    publishToPypi: {
        distName: 'devops-at-home.cdk-iot-core-certificates',
        module: 'devops_at_home_cdk_iot_core_certficates',
    },
});

project.jest!.addTestMatch('**/?(*.)@(spec|test).[tj]s?(x)');

project.tasks.tryFind('package:python')?.prependExec('pip3 install packaging');

project.synth();

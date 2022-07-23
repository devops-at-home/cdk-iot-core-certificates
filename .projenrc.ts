import { awscdk } from 'projen';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'DevOps@Home',
  authorAddress: 'devops.at.home@gmail.com',
  cdkVersion: '2.30.0',
  defaultReleaseBranch: 'main',
  eslint: false,
  name: 'cdk-iot-core-certificates',
  projenrcTs: true,
  repositoryUrl: 'git@github.com:devops-at-home/cdk-iot-core-certificates.git',
  license: 'MIT',
  gitignore: ['.idea', '.DS_Store'],
  devDeps: [
    'esbuild',
    '@types/aws-lambda',
    '@types/jest@27.4.1',
    'aws-lambda',
    'aws-sdk',
    'aws-cloudformation-custom-resource',
  ],
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 120,
      tabWidth: 2,
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
});

project.jest!.addTestMatch('**/?(*.)@(spec|test).[tj]s?(x)');

project.synth();

const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  author: 'DevOps@Home',
  authorAddress: 'devops.at.home@gmail.com',
  cdkVersion: '1.108.1',
  defaultReleaseBranch: 'main',
  name: 'cdk-iot-core-certificates',
  repositoryUrl: 'git@github.com:devops-at-home/cdk-iot-core-certificates.git',
  license: 'MIT',
  dependabot: true,

  gitignore: ['.idea', '.DS_Store'],
  releaseToNpm: true,

  bundledDeps: [
    'aws-lambda',
    'aws-sdk',
    'aws-cloudformation-custom-resource',
  ],

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/custom-resources',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-ssm',
    '@aws-cdk/aws-cloudformation',
  ],

  devDeps: [
    'esbuild',
    '@types/aws-lambda',
  ],

  jestOptions: {
    jestConfig: {
      testPathIgnorePatterns: ['.idea'],
    },
  },

});
project.synth();
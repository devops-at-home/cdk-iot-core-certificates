import { awscdk } from "projen";
const project = new awscdk.AwsCdkConstructLibrary({
  author: "DevOps@Home",
  authorAddress: "devops.at.home@gmail.com",
  cdkVersion: "2.27.0",
  defaultReleaseBranch: "main",
  eslint: false,
  name: "cdk-iot-core-certificates",
  projenrcTs: true,
  repositoryUrl: "git@github.com:devops-at-home/cdk-iot-core-certificates.git",

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
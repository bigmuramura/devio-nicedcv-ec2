#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkNicedcvEc2Stack } from "../lib/cdk-nicedcv-ec2-stack";

const app = new cdk.App();
new CdkNicedcvEc2Stack(app, "CdkNicedcvEc2Stack", {
  env: { account: "123456789012", region: "ap-northeast-1" },
});

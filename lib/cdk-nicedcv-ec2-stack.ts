import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { AmiHardwareType } from "aws-cdk-lib/aws-ecs";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";

export class CdkNicedcvEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const inputVpcId = "vpc-054b8c5b1c1012441";
    const inputAmiId = "ami-0cf3cd949d1122c35";
    const inputKeyPairName = "sandbox-key";

    // 既存VPCを指定
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
      vpcId: inputVpcId,
    });

    // SecurityGroup作成
    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description: "NICE DCV Security Group",
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8443),
      "Allow NICE DCV Access"
    );

    // IAM Policy作成
    const niceLicensePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ["s3:GetObject"],
          resources: ["arn:aws:s3:::dcv-license.ap-northeast-1/*"],
        }),
      ],
    });

    // IAM Role作成
    const role = new iam.Role(this, "dev-licence-role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      description: "Licensing the NICE DCV",
      inlinePolicies: {
        niceLicensePolicy: niceLicensePolicy,
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    // EC2作成
    const amiId = new ec2.LookupMachineImage({
      name: "DCV-AmazonLinux2-x86_64-2022.2.13907-NVIDIA-510.85.02-2022-11-10T13-42-07.900Z",
    });

    const ec2Instance = new ec2.Instance(this, "nice-dcv", {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.LARGE
      ),
      machineImage: amiId,
      securityGroup: securityGroup,
      keyName: inputKeyPairName,
      role: role,
    });
  }
}

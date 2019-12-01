import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import * as k8sx from "./func/k8sx";

import * as iam from "./1.iam";
import * as vpc from "./2.vpc";
import * as sg from "./3.sg";
import * as eks from './4.eks';

const baseName = `sample-pulumi-${pulumi.getStack()}`;

export const userDataBase64 = k8sx.eksUserDataBase64(eks.eksCluster);
export const eksNode = k8sx.getEksAmi(eks.eksCluster);

export const launchConfiguration = new aws.ec2.LaunchConfiguration("eks-lc", {
  associatePublicIpAddress: true,
  iamInstanceProfile: iam.eksWorkerRole.instanceProfile.id,
  imageId: eksNode.imageId,
  instanceType: "t3.medium",
  namePrefix: "eks-node",
  enableMonitoring: false,

  rootBlockDevice: {
    volumeType: "gp2",
    volumeSize: 50
  },

  securityGroups: [sg.clusterWorkerSG.id],
  userDataBase64: userDataBase64
});



export const eksAsg = new aws.autoscaling.Group("eks-asg", {
  name: "EKS cluster nodes",
  desiredCapacity: 3,
  launchConfiguration : launchConfiguration.id,
  maxSize: 8,
  minSize: 2,
  vpcZoneIdentifiers: vpc.subnets.map(subnet => subnet.id),
  tags: [
    {
      key: "Name",
      value: `${baseName}-nodes`,
      propagateAtLaunch: true
    },
    {
      key: eks.eksCluster.name.apply(name=>`kubernetes.io/cluster/${name}`) ,
      value: "owned",
      propagateAtLaunch: true
    },

    {
      key: "Project",
      value: `${baseName}-project`,
      propagateAtLaunch: true
    },

    {
      key: "Terraform",
      value: "true",
      propagateAtLaunch: true
    },
  ]
});

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as vpc from "./vpc";
import * as lc from './launch-configuration';
import * as eks from './eks';

const baseName = `sample-pulumi-${pulumi.getStack()}`;

export const eksAsg = new aws.autoscaling.Group("eks-asg", {
  name: "EKS cluster nodes",
  desiredCapacity: 3,
  launchConfiguration : lc.launchConfiguration.id,
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

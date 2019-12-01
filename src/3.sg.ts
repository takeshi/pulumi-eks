import * as aws from "@pulumi/aws";
import { vpc } from "./2.vpc";

export const clusterMasterSG = new aws.ec2.SecurityGroup("cluster-master", {
  name: "cluster-master",
  description: "EKS cluster master security group",

  vpcId: vpc.id,

  ingress: [
    {
      fromPort: 443,
      toPort: 443,
      protocol: "tcp",
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],

  egress: [
    {
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"]
    }
  ]
});

export const clusterWorkerSG = new aws.ec2.SecurityGroup("cluster-worker", {
  name: "cluster-worker",
  description: "EKS cluster worker security group",

  vpcId: vpc.id,

  ingress: [
    {
      description: "Allow cluster master to access cluster nodes",
      fromPort: 1025,
      toPort: 65535,
      protocol: "tcp",
      securityGroups: [clusterMasterSG.id]
    },

    {
      description: "Allow cluster master to access cluster nodes",
      fromPort: 1025,
      toPort: 65535,
      protocol: "udp",
      securityGroups: [clusterMasterSG.id]
    },

    {
      description: "Allow inter pods communication",
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      self: true
    }
  ],

  egress: [{
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"]
  }]

});

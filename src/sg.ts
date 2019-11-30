import * as aws from "@pulumi/aws";
import { vpc } from "./vpc";

// resource "aws_security_group" "cluster-master" {
//   name        = "cluster-master"
//   description = "EKS cluster master security group"

//   tags = "${merge(local.default_tags,map("Name","eks-master-sg"))}"

//   vpc_id = "${aws_vpc.vpc.id}"

//   ingress {
//     from_port   = 443
//     to_port     = 443
//     protocol    = "tcp"
//     cidr_blocks = ["0.0.0.0/0"]
//   }

//   egress {
//     from_port   = 0
//     to_port     = 0
//     protocol    = "-1"
//     cidr_blocks = ["0.0.0.0/0"]
//   }
// }
export const clusterMasterSG = new aws.ec2.SecurityGroup("cluster-master", {
  name: "cluster-master",
  description: "EKS cluster master security group",

  // tags = "${merge(local.default_tags,map("Name","eks-master-sg"))}"

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

// resource "aws_security_group" "cluster-nodes" {
//   name        = "cluster-nodes"
//   description = "EKS cluster nodes security group"

//   tags   = "${merge(local.default_tags,map("Name","eks-nodes-sg"))}"
//   vpc_id = "${aws_vpc.vpc.id}"

//   ingress {
//     description = "Allow cluster master to access cluster nodes"
//     from_port   = 1025
//     to_port     = 65535
//     protocol    = "tcp"

//     security_groups = ["${aws_security_group.cluster-master.id}"]
//   }

//   ingress {
//     description = "Allow cluster master to access cluster nodes"
//     from_port   = 1025
//     to_port     = 65535
//     protocol    = "udp"

//     security_groups = ["${aws_security_group.cluster-master.id}"]
//   }

//   ingress {
//     description = "Allow inter pods communication"
//     from_port   = 0
//     to_port     = 0
//     protocol    = "-1"
//     self        = true
//   }

//   egress {
//     from_port   = 0
//     to_port     = 0
//     protocol    = "-1"
//     cidr_blocks = ["0.0.0.0/0"]
//   }
// }

export const clusterWorkerSG = new aws.ec2.SecurityGroup("cluster-worker", {
  //   name        = "cluster-nodes"
  //   description = "EKS cluster nodes security group"
  name: "cluster-worker",
  description: "EKS cluster master security group",

  //   tags   = "${merge(local.default_tags,map("Name","eks-nodes-sg"))}"

  //   vpc_id = "${aws_vpc.vpc.id}"
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

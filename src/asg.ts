import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as vpc from "./vpc";
import * as lc from './lc';
import * as eks from './eks';

const baseName = `sample-pulumi-${pulumi.getStack()}`;

export const eksAsg = new aws.autoscaling.Group("eks-asg", {
  //   name                 = "EKS cluster nodes"
  name: "EKS cluster nodes",
  //   desired_capacity     = "${var.num_subnets}"
  desiredCapacity: 3,
  //   launch_configuration = "${aws_launch_configuration.eks-lc.id}"
  launchConfiguration : lc.lc.id,

  //   max_size             = "${var.num_subnets}"
  //   min_size             = "${var.num_subnets}"
  maxSize: 8,
  minSize: 2,
  //   vpc_zone_identifier = ["${aws_subnet.subnet.*.id}"]
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

    // {
    //   key: "Environment",
    //   value: "${var.environment}",
    //   propagateAtLaunch: true
    // }
  ]
  //   lifecycle {
  //     create_before_destroy = true
  //   }
  // }
});

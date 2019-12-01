import * as aws from "@pulumi/aws";
import * as vpcx from "./func/vpcx";

export const vpc = new aws.ec2.Vpc("eks-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { Name: "eks-vpc" }
});

export const igw = new aws.ec2.InternetGateway("igw", {
  vpcId: vpc.id,
  tags: {
    Name: "eks-igw"
  }
});

export const routeTable = new aws.ec2.RouteTable("rtb", {
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: igw.id
    }
  ],
  tags: {
    Name: "eks-rtb"
  },
  vpcId: vpc.id
});

export const subnets = [
  vpcx.generateSubnet("eks-subnet-b", {
    cidrBlock: "10.0.1.0/24",
    vpc: vpc,
    igw: igw,
    routeTable:routeTable,
    az: "ap-northeast-1b",
  }),
  vpcx.generateSubnet("eks-subnet-c", {
    cidrBlock: "10.0.2.0/24",
    vpc: vpc,
    igw: igw,
    routeTable:routeTable,
    az: "ap-northeast-1c"
  }),
  vpcx.generateSubnet("eks-subnet-d", {
    cidrBlock: "10.0.3.0/24",
    vpc: vpc,
    igw: igw,
    routeTable:routeTable,
    az: "ap-northeast-1d"
  })
];
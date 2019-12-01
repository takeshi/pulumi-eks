import * as aws from "@pulumi/aws";


export function createPublicSubnet(
  name: string,
  args: { cidrBlock: string; vpc: aws.ec2.Vpc; az: string,igw:aws.ec2.InternetGateway }
) {
  const subnet = new aws.ec2.Subnet(name, {
    cidrBlock: args.cidrBlock,
    vpcId: args.vpc.id,
    availabilityZone: args.az,
    mapPublicIpOnLaunch: true
  });

  const routeTable = new aws.ec2.RouteTable(name + "/RouteTable", {
    routes: [
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: args.igw.id
      }
    ],
    tags: {
      Name: name + "/RouteTable"
    },
    vpcId: args.vpc.id
  });

  const routeTableAssociation = new aws.ec2.RouteTableAssociation(
    name + "/RouteTableAssociation",
    {
      subnetId: subnet.id,
      routeTableId: routeTable.id,
    }
  );
  return {
    vpc: args.vpc,
    subnet: subnet,
    routeTable: routeTable,
    routeTableAssociation: routeTableAssociation
  };
}

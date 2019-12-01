import * as aws from "@pulumi/aws";

export function generateSubnet(
  name: string,
  args: {
    cidrBlock: string;
    vpc: aws.ec2.Vpc;
    az: string;
    igw: aws.ec2.InternetGateway;
    routeTable:aws.ec2.RouteTable
  }
){
  const subnet = new aws.ec2.Subnet(name, {
    cidrBlock: args.cidrBlock,
    vpcId: args.vpc.id,
    availabilityZone: args.az,
    mapPublicIpOnLaunch: true
  });

  const routeTableAssociation = new aws.ec2.RouteTableAssociation(
    name + "-rtba",
    {
      subnetId: subnet.id,
      routeTableId: args.routeTable.id
    }
  );

  return subnet;
};
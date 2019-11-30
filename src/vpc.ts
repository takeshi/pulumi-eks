import * as aws from "@pulumi/aws";

// data "aws_availability_zones" "available" {}
 
// resource "aws_vpc" "vpc" {
//   cidr_block           = "${var.vpc_cidr_block}"
//   enable_dns_hostnames = true
//   enable_dns_support   = true
//   tags                 = "${merge(local.default_tags, map("Name", "${local.base_name}-vpc"))}"
// }

export const vpc = new aws.ec2.Vpc("my-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames:true,
  enableDnsSupport:true,
  tags: { Name: "my-vpc" },
});


// resource "aws_subnet" "subnet" {
//   count                   = "${var.num_subnets}"
//   vpc_id                  = "${aws_vpc.vpc.id}"
//   availability_zone       = "${data.aws_availability_zones.available.names[ count.index % var.num_subnets ]}"
//   cidr_block              = "${cidrsubnet(var.vpc_cidr_block, 8, count.index + var.num_subnets * 0 )}"
//   map_public_ip_on_launch = true
 
//   tags = "${merge(local.default_tags, map("Name", "${local.base_name}-subnet-${count.index+1}"))}"
// }

const generateSubnet = (name: string, cidr: string, vpc: aws.ec2.Vpc,az:string) => {
  return new aws.ec2.Subnet(name, {
    cidrBlock: cidr,
    vpcId: vpc.id,
    availabilityZone:az,
    mapPublicIpOnLaunch:true
  });
};

 
export const subnets = [
  generateSubnet("my-subnet1", "10.0.1.0/24", vpc,"ap-northeast-1b"),
  generateSubnet("my-subnet2", "10.0.2.0/24", vpc,"ap-northeast-1d"),
  generateSubnet("my-subnet3", "10.0.3.0/24", vpc,"ap-northeast-1c")
]

// resource "aws_internet_gateway" "igw" {
//   vpc_id = "${aws_vpc.vpc.id}" 
//   tags = "${merge(local.default_tags, map("Name", "${local.base_name}-igw"))}"
// }
const igw = new aws.ec2.InternetGateway("igw",{
  vpcId : vpc.id,
  tags : {
    Name : "example-igw"
  }
}
)
 
// resource "aws_route_table" "rtb" {
//   vpc_id = "${aws_vpc.vpc.id}"
//   route {
//     cidr_block = "0.0.0.0/0"
//     gateway_id = "${aws_internet_gateway.igw.id}"
//   }
//   tags = "${merge(local.default_tags, map("Name", "${local.base_name}-rtb"))}"
// }

const routeTable = new aws.ec2.RouteTable("rtb", {
     routes: [
         {
             cidrBlock: "0.0.0.0/0",
             gatewayId: igw.id,
         },
     ],
     tags: {
         Name: "example-rtb",
     },
     vpcId: vpc.id,
 },
 );

let count = 0;
for(let subnet of subnets){
  count++;
  const routeTableAssociation = new aws.ec2.RouteTableAssociation("rtba-"+count,{
    subnetId : subnet.id,
    routeTableId : routeTable.id
  })
}

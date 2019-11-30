import * as aws from "@pulumi/aws";

export const vpc = new aws.ec2.Vpc("my-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames:true,
  enableDnsSupport:true,
  tags: { Name: "my-vpc" },
});

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

const igw = new aws.ec2.InternetGateway("igw",{
  vpcId : vpc.id,
  tags : {
    Name : "example-igw"
  }
}
)
 
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

import * as aws from "@pulumi/aws";

// resource "aws_iam_role" "eks-master-role" {
//   name = "eks-master-role"
 
//   assume_role_policy = <<EOS
// {
//   "Version": "2012-10-17",
//   "Statement": [
//     {
//       "Action": "sts:AssumeRole",
//       "Principal": {
//         "Service": "eks.amazonaws.com"
//       },
//       "Effect": "Allow"
//     }
//   ]
// }
// EOS
// }
export const eksMasterRole = new aws.iam.Role("eks-master-role",{
  assumeRolePolicy:{
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
});
 
// resource "aws_iam_role_policy_attachment" "eks-cluster-policy" {
//   policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
//   role       = "${aws_iam_role.eks-master-role.name}"
// }
export const eksClusterPolicy = new aws.iam.PolicyAttachment("eks-cluster-policy",{
  policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
  roles:[eksMasterRole]
});

// resource "aws_iam_role_policy_attachment" "eks-service-policy" {
//   policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
//   role       = "${aws_iam_role.eks-master-role.name}"
// }
export const eksServicePolicy = new aws.iam.PolicyAttachment("ks-service-policy",{
  policyArn: "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
  roles:[eksMasterRole]
});

 
// resource "aws_iam_role" "eks-node-role" {
//   name = "eks-node-role"
//   assume_role_policy = <<EOS
// {
//   "Version": "2012-10-17",
//   "Statement": [
//     {
//       "Action": "sts:AssumeRole",
//       "Principal": {
//         "Service": "ec2.amazonaws.com"
//       },
//       "Effect": "Allow"
//     }
//   ]
// }
// EOS
// }
export const eksWorkerRole = new aws.iam.Role("eks-worker-role",{
  assumeRolePolicy:{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ] 
  }
});
 
// resource "aws_iam_role_policy_attachment" "eks-worker-node-policy" {
//   policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
//   role       = "${aws_iam_role.eks-node-role.name}"
// }
new aws.iam.PolicyAttachment("eksWorkerNodePolicy",{
  policyArn:"arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
  roles:[eksWorkerRole]
});
 

// resource "aws_iam_role_policy_attachment" "eks-cni-policy" {
//   policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
//   role       = "${aws_iam_role.eks-node-role.name}"
// }
new aws.iam.PolicyAttachment("eksCniPolicy",{
  policyArn:"arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
  roles:[eksWorkerRole]
});
 
// resource "aws_iam_role_policy_attachment" "ec2-container-registry-readonly" {
//   policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
//   role       = "${aws_iam_role.eks-node-role.name}"
// }
new aws.iam.PolicyAttachment("ec2-container-registry-readonly",{
  policyArn:"arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
  roles:[eksWorkerRole]
});
 
// resource "aws_iam_role_policy_attachment" "ec2-role-for-ssm" {
//   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM"
//   role       = "${aws_iam_role.eks-node-role.name}"
// }
new aws.iam.PolicyAttachment("ec2-role-for-ssm",{
  policyArn:"arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM",
  roles:[eksWorkerRole]
});

// resource "aws_iam_instance_profile" "eks-node-role-profile" {
//   name = "eks-node-role-profile"
//   role = "${aws_iam_role.eks-node-role.name}"
// }
export const eksNodeRoleProfile = new aws.iam.InstanceProfile("eks-node-role-profile",{
  name : "eks-node-role-profile",
  role : eksWorkerRole
})

import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

export function createEksMasterRole(name: string) {
  const eksMasterRole = new aws.iam.Role(name,{
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

  const amazonEKSClusterPolicy = new aws.iam.PolicyAttachment(name +"/AmazonEKSClusterPolicy", {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    roles: [eksMasterRole]
  });

  const amazonEKSServicePolicy = new aws.iam.PolicyAttachment(name + "/AmazonEKSServicePolicy", {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
    roles: [eksMasterRole]
  });

  return {
    role: eksMasterRole,
    amazonEKSClusterPolicy: amazonEKSClusterPolicy,
    amazonEKSServicePolicy: amazonEKSServicePolicy 
  };
}

export function createEksWorkerRole(name:string){
  const eksWorkerRole =  new aws.iam.Role(name,{
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
   
  const eKSWorkerNodePolicy = new aws.iam.PolicyAttachment(name + "/EKSWorkerNodePolicy",{
    policyArn:"arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    roles:[eksWorkerRole]
  });
   
  const amazonEKS_CNI_Policy = new aws.iam.PolicyAttachment(name + "/AmazonEKS_CNI_Policy",{
    policyArn:"arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    roles:[eksWorkerRole]
  });
   
  const amazonEC2ContainerRegistryReadOnly = new aws.iam.PolicyAttachment(name + "/AmazonEC2ContainerRegistryReadOnly",{
    policyArn:"arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    roles:[eksWorkerRole]
  });
   
  const amazonEC2RoleforSSM = new aws.iam.PolicyAttachment(name + "/AmazonEC2RoleforSSM",{
    policyArn:"arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM",
    roles:[eksWorkerRole]
  });
  
  const instanceProfile = new aws.iam.InstanceProfile(name + "/InstanceProfile",{
    name : "eks-node-role-profile",
    role : eksWorkerRole
  })

  return {
    role:eksWorkerRole,
    eKSWorkerNodePolicy:eKSWorkerNodePolicy,
    amazonEKS_CNI_Policy:amazonEKS_CNI_Policy,
    amazonEC2ContainerRegistryReadOnly:amazonEC2ContainerRegistryReadOnly,
    amazonEC2RoleforSSM:amazonEC2RoleforSSM,
    instanceProfile:instanceProfile
  }
  
}

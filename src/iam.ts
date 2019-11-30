import * as aws from "@pulumi/aws";

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
 
export const eksClusterPolicy = new aws.iam.PolicyAttachment("eks-cluster-policy",{
  policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
  roles:[eksMasterRole]
});

export const eksServicePolicy = new aws.iam.PolicyAttachment("ks-service-policy",{
  policyArn: "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
  roles:[eksMasterRole]
});

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
 
export const eksWorkerNodePolicy = new aws.iam.PolicyAttachment("eksWorkerNodePolicy",{
  policyArn:"arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
  roles:[eksWorkerRole]
});
 
export const eksCniPolicy = new aws.iam.PolicyAttachment("eksCniPolicy",{
  policyArn:"arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
  roles:[eksWorkerRole]
});
 
export const ec2ContainerRegistryReadonly = new aws.iam.PolicyAttachment("ec2-container-registry-readonly",{
  policyArn:"arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
  roles:[eksWorkerRole]
});
 
export const ec2RoleForSsm = new aws.iam.PolicyAttachment("ec2-role-for-ssm",{
  policyArn:"arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM",
  roles:[eksWorkerRole]
});

export const eksNodeRoleProfile = new aws.iam.InstanceProfile("eks-node-role-profile",{
  name : "eks-node-role-profile",
  role : eksWorkerRole
})

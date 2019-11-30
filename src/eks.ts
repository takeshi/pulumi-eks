import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {eksMasterRole,eksWorkerRole,eksClusterPolicy,eksServicePolicy} from './iam';
import {subnets} from './vpc';
import {clusterMasterSG} from './sg';
import * as k8s from "@pulumi/kubernetes";
import * as iam from "./iam";

// resource "aws_eks_cluster" "eks-cluster" {
//   name     = "${local.cluster_name}"
//   role_arn = "${aws_iam_role.eks-master-role.arn}"
//   version  = "${local.cluster_version}"
 
//   vpc_config {
//     security_group_ids = ["${aws_security_group.cluster-master.id}"]
 
//     subnet_ids = ["${aws_subnet.subnet.*.id}"]
//   }
 
//   depends_on = [
//     "aws_iam_role_policy_attachment.eks-cluster-policy",
//     "aws_iam_role_policy_attachment.eks-service-policy",
//   ]
// }

export const eksCluster = new aws.eks.Cluster("eks-cluster", {
  roleArn: eksMasterRole.arn,
  vpcConfig: {
      securityGroupIds : [clusterMasterSG.id],
      subnetIds: subnets.map(subnet=>subnet.id),
  },
},
{
  dependsOn:[eksClusterPolicy,eksServicePolicy]
}
);

export const kubeconfig = pulumi.all([
  eksCluster.endpoint,
  eksCluster.certificateAuthority,
  eksCluster.name
]).apply(([endpoint,certificateAuthority,name])=>{
return `
apiVersion: v1
clusters:
- cluster:
    server: ${endpoint}
    certificate-authority-data: ${certificateAuthority.data}
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: aws
  name: aws
current-context: aws
kind: Config
preferences: {}
users:
- name: aws
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1alpha1
      command: aws-iam-authenticator
      args:
        - "token"
        - "-i"
        - "${name}"
`});
 

 export const eksConfigmap = eksWorkerRole.arn.apply(arn=>{
 return `apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapRoles: |
    - rolearn: ${arn}
      username: system:node:{{EC2PrivateDNSName}}
      groups:
        - system:bootstrappers
        - system:nodes
`
})

export const provider = new k8s.Provider("k8s",{
  kubeconfig:kubeconfig
})

new k8s.core.v1.ConfigMap("aws-auth",{
  metadata:{
    name:"aws-auth",
    namespace:"kube-system"
  },
  data:{
    mapRoles: iam.eksWorkerRole.arn.apply(arn=>{
      return`- rolearn: ${arn}
  username: system:node:{{EC2PrivateDNSName}}
  groups:
    - system:bootstrappers
    - system:nodes
`;
    })
  }
},{
  provider:provider
})
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";

import * as k8sx from "./func/k8sx";

import * as iam from "./1.iam";
import {subnets} from './2.vpc';
import {clusterMasterSG} from './3.sg';

export const eksCluster = new aws.eks.Cluster("eks-cluster", {
  roleArn: iam.eksMasterRole.role.arn,
  vpcConfig: {
      securityGroupIds : [clusterMasterSG.id],
      subnetIds: subnets.map(subnet=>subnet.id),
  },
},
{
  dependsOn:[iam.eksMasterRole.amazonEKSClusterPolicy,iam.eksMasterRole.amazonEKSServicePolicy]
}
);

export const kubeconfig = k8sx.kubeconfig(eksCluster);

export const provider = new k8s.Provider("k8s",{
  kubeconfig:kubeconfig
})

export const configMap = k8sx.awsAuthConfigMap(iam.eksWorkerRole.role,provider);
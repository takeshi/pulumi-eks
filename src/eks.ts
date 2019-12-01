import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {eksMasterRole} from './iam';
import {subnets} from './vpc';
import {clusterMasterSG} from './sg';
import * as k8s from "@pulumi/kubernetes";
import * as iam from "./iam";
import * as k8sx from "./func/k8sx";

export const eksCluster = new aws.eks.Cluster("eks-cluster", {
  roleArn: eksMasterRole.role.arn,
  vpcConfig: {
      securityGroupIds : [clusterMasterSG.id],
      subnetIds: subnets.map(subnet=>subnet.id),
  },
},
{
  dependsOn:[eksMasterRole.amazonEKSClusterPolicy,eksMasterRole.amazonEKSServicePolicy]
}
);

export const kubeconfig = k8sx.kubeconfig(eksCluster);

export const provider = new k8s.Provider("k8s",{
  kubeconfig:kubeconfig
})

export const configMap = k8sx.awsAuthConfigMap(iam.eksWorkerRole.role,provider);
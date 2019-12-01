import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

export function kubeconfig(eksCluster: aws.eks.Cluster) {
  return pulumi
    .all([
      eksCluster.endpoint,
      eksCluster.certificateAuthority,
      eksCluster.name
    ])
    .apply(([endpoint, certificateAuthority, name]) => {
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
  `;
    });
}

export function awsAuthConfigMap(
  eksWorkerRole: aws.iam.Role,
  provider: k8s.Provider
) {
  return new k8s.core.v1.ConfigMap(
    "aws-auth",
    {
      metadata: {
        name: "aws-auth",
        namespace: "kube-system"
      },
      data: {
        mapRoles: eksWorkerRole.arn.apply(arn => {
          return `- rolearn: ${arn}
  username: system:node:{{EC2PrivateDNSName}}
  groups:
   - system:bootstrappers
   - system:nodes
`;
        })
      }
    },
    {
      provider: provider
    }
  );
}

export function eksUserDataBase64(eksCluster: aws.eks.Cluster) {
  return pulumi
    .all([
      eksCluster.endpoint,
      eksCluster.certificateAuthority,
      eksCluster.name
    ])
    .apply(([endpoint, certificateAuthority, name]) => {
      const userdata = `#!/bin/bash
set -o xtrace
/etc/eks/bootstrap.sh --apiserver-endpoint "${endpoint}" --b64-cluster-ca "${certificateAuthority.data}" "${name}"
`;
      var buffer1 = Buffer.from(userdata, "ascii");
      var base64 = buffer1.toString("base64");
      return base64;
    });
}

export function getEksAmi(eksCluster: aws.eks.Cluster) {
  return eksCluster.version.apply(version => {
    return aws.getAmi({
      mostRecent: true,
      owners: ["602401143452"],
      filters: [
        {
          name: "name",
          values: [`amazon-eks-node-${version}-*`]
        }
      ]
    });
  });
}

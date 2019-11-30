import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as eks from "./eks";
import * as iam from "./iam";
import * as sg from "./sg";

export const userdata = pulumi
  .all([
    eks.eksCluster.endpoint,
    eks.eksCluster.certificateAuthority,
    eks.eksCluster.name
  ])
  .apply(([endpoint, certificateAuthority, name]) => {
    return `#!/bin/bash
set -o xtrace
/etc/eks/bootstrap.sh --apiserver-endpoint "${endpoint}" --b64-cluster-ca "${certificateAuthority.data}" "${name}"
`;
  });

export const eksNode = eks.eksCluster.version.apply(version => {
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

export const launchConfiguration = new aws.ec2.LaunchConfiguration("eks-lc", {
  associatePublicIpAddress: true,
  iamInstanceProfile: iam.eksNodeRoleProfile.id,
  imageId: eksNode.imageId,
  instanceType: "t3.medium",
  namePrefix: "eks-node",
  enableMonitoring: false,

  rootBlockDevice: {
    volumeType: "gp2",
    volumeSize: 50
  },

  securityGroups: [sg.clusterWorkerSG.id],
  userDataBase64: userdata.apply(userdata=>{
    var buffer1 = Buffer.from(userdata, 'ascii');
    var base64 = buffer1.toString('base64');
    return base64;
  })
});


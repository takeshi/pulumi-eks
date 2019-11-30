import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as eks from "./eks";
import * as iam from "./iam";
import * as sg from "./sg";

// locals {
//   userdata = <<USERDATA
// #!/bin/bash
// set -o xtrace
// /etc/eks/bootstrap.sh --apiserver-endpoint "${aws_eks_cluster.eks-cluster.endpoint}" --b64-cluster-ca "${aws_eks_cluster.eks-cluster.certificate_authority.0.data}" "${aws_eks_cluster.eks-cluster.name}"
// USERDATA
// }

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

// data "aws_ami" "eks-node" {
//   most_recent = true
//   owners      = ["602401143452"]

//   filter {
//     name   = "name"
//     values = ["amazon-eks-node-${local.cluster_version}-*"]
//   }
// }

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

// resource "aws_launch_configuration" "eks-lc" {
export const lc = new aws.ec2.LaunchConfiguration("eks-lc", {
  //   associate_public_ip_address = true
  associatePublicIpAddress: true,
  //   iam_instance_profile        = "${aws_iam_instance_profile.eks-node-role-profile.id}"
  iamInstanceProfile: iam.eksNodeRoleProfile.id,
  //   image_id                    = "${data.aws_ami.eks-node.image_id}"
  imageId: eksNode.imageId,
  //   instance_type               = "t3.medium"
  instanceType: "t3.medium",
  //   name_prefix                 = "eks-node"
  namePrefix: "eks-node",
  //   key_name                    = "${var.key_name}"
  //   enable_monitoring           = false
  enableMonitoring: false,

  //   root_block_device {
  //     volume_type = "gp2"
  //     volume_size = "50"
  //   }

  rootBlockDevice: {
    volumeType: "gp2",
    volumeSize: 50
  },

  //   security_groups  = ["${aws_security_group.cluster-nodes.id}"]
  securityGroups: [sg.clusterWorkerSG.id],
  //   user_data_base64 = "${base64encode(local.userdata)}"
  userDataBase64: userdata.apply(userdata=>{
    var buffer1 = new Buffer(userdata, 'ascii');
    var base64 = buffer1.toString('base64');
    return base64;
  })
  //   lifecycle {
  //     create_before_destroy = true
  //   }
  // }
});


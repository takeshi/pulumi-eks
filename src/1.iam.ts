import * as aws from "@pulumi/aws";
import * as iamx from "./func/iamx";

export const eksMasterRole =iamx.createEksMasterRole("eks-master-role");
export const eksWorkerRole = iamx.createEksWorkerRole("eks-worker-role");
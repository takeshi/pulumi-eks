// import  './iam';
// import  './vpc';
// import   './sg';

import * as pulumi from '@pulumi/pulumi';
import * as eks from './src/eks';
import * as lc from './src/lc';
import { isDryRun } from '@pulumi/pulumi/runtime';
import * as fs from 'fs';
import './src/asg';
import './src/nginx';


// export const userdata = lc.userdata;
// export const eksNode = lc.eksNode;

const kubeconf = eks.kubeconfig;

const configMap = eks.eksConfigmap;

// if(!isDryRun()){
//   fs.writeFileSync("kubeconf.yaml",kubeconf.get());
//   fs.writeFileSync("configMap.yaml",configMap.get());
// }

if (!isDryRun()) {
  kubeconf.apply(async kubeconfig => {
    await new Promise(resolve => fs.writeFile(`./kubeconfig.yml`, kubeconfig, resolve))
  })
  configMap.apply(async confgiMap=>{
    await new Promise(resolve => fs.writeFile(`./configmap.yml`, confgiMap, resolve))
  });
}
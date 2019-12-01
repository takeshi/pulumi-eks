import * as fs from 'fs';
import { isDryRun } from '@pulumi/pulumi/runtime';

import * as eks from './src/4.eks';
import './src/5.asg';
import * as nginx from './src/6.k8s-nginx';

const kubeconf = eks.kubeconfig;

if (!isDryRun()) {
  kubeconf.apply(async kubeconfig => {
    await new Promise(resolve => fs.writeFile(`./kubeconfig.yml`, kubeconfig, resolve))
  })
}

export const frontendIp = nginx.frontendIp;


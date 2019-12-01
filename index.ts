import * as eks from './src/eks';
import { isDryRun } from '@pulumi/pulumi/runtime';
import * as fs from 'fs';
import './src/asg';
import './src/nginx';

const kubeconf = eks.kubeconfig;

if (!isDryRun()) {
  kubeconf.apply(async kubeconfig => {
    await new Promise(resolve => fs.writeFile(`./kubeconfig.yml`, kubeconfig, resolve))
  })
}
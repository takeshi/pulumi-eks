import * as k8s from "@pulumi/kubernetes";

import * as eks from "./4.eks";

const provider = eks.provider;

const appName = "hello-world";
const namespaceName = new k8s.core.v1.Namespace(
  appName,
  {
    metadata: {
      name: appName
    }
  },
  {
    provider: provider
  }
);

const nginxLabels = { app: "nginx" };
export const nginxDeployment = new k8s.apps.v1.Deployment(
  "nginx-deployment",
  {
    metadata: {
      name: appName,
      namespace: namespaceName.metadata.name
    },
    spec: {
      selector: { matchLabels: nginxLabels },
      replicas: 2,
      template: {
        metadata: { labels: nginxLabels },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:1.7.9",
              ports: [{ containerPort: 80 }]
            }
          ]
        }
      }
    }
  },
  {
    provider: provider
  }
);

// Expose proxy to the public Internet.
const frontend = new k8s.core.v1.Service(appName, {
  metadata: { 
    labels: nginxDeployment.spec.template.metadata.labels,
    namespace: namespaceName.metadata.name
  },
  spec: {
      type: "LoadBalancer",
      ports: [{ port: 80, targetPort: 80, protocol: "TCP" }],
      selector: nginxLabels,
  },
}, { provider: provider });

// Export the frontend IP.
export const frontendIp = frontend.status.loadBalancer.ingress[0].ip;

// import * as k8s from "@pulumi/kubernetes";
// import * as eks from "./eks";

// const provider = eks.provider;

// const name = "hello-world";
// const ns = new k8s.core.v1.Namespace(name, {
//   metadata:{
//     name:name
//   }
// }, { 
//   provider: provider 
// });

// export const namespaceName = ns.metadata.name;

// const nginxLabels = { app: "nginx" };
// const nginxDeployment = new k8s.apps.v1.Deployment("nginx-deployment", {
//     metadata:{
//       name: name,
//       namespace: namespaceName,
//     },
//     spec: {
//         selector: { matchLabels: nginxLabels },
//         replicas: 2,
//         template: {
//             metadata: { labels: nginxLabels },
//             spec: {
//                 containers: [{
//                     name: "nginx",
//                     image: "nginx:1.7.9",
//                     ports: [{ containerPort: 80 }],
//                 }],
//             },
//         },
//     },
// },{
//   provider: provider,
// }
// );

// export const nginx = nginxDeployment.metadata.name;
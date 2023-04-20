# kubecon2023
Just some notes on KubeCon 2023

![](kubecon2023.png)

# Interesting topics in general

* https://katacontainers.io (isolated containers)
* MicroVMs and weaveworks liquidmetal
* Crossplane with ArgoCD and vcluster (k8s in k8s)
* WebAssembly/WASM with Spin or/and with Kubernetes
* eBPF
* https://www.devspace.sh - Docker Compose for Kubernetes
* Kubevela and Open Application Model https://kubevela.io/docs/getting-started/core-concept



# A CI/CD Platform in the Palm of Your Hand - Claudia Beresford, Weaveworks

![](ci-cd-platform-01.png)

## MicroVMs

MicroVMs for a better sweet spot for CI than security-flawed containers or full-blown VMs (see https://itnext.io/microvm-another-level-of-abstraction-for-serverless-computing-5f106b030f15?gi=62ad462da87f).


Deployment on MicroVMs or directly on bare metal:

https://github.com/weaveworks-liquidmetal


clusterctl CLI

> ngrok is a simplified API-first ingress-as-a-service that adds connectivity,
security, and observability to your apps in one line 

https://ngrok.com/

![](ci-cd-platform-02.png)


# How We Securely Scaled Multi-Tenancy with VCluster, Crossplane, and Argo CD - Ilia Medvedev & Kostis Kapelonis, Codefresh

![](argocd-per-namespace.png)

![](new-cluster-with-argocd-for-every-cluster.png)

3rd option:

https://www.vcluster.com/

k8s cluster in k8s cluster - clusterception

![](virtual-cluster-pros.png)

![](treat-vcluster-as-infrastructure-using-crossplane.png)

Really cool, here's there are architecture

![](argocd-crossplane-vcluster-argocd-architecture.png)

Install crossplane using Helm with ArgoCD

Demo repo https://github.com/ilia-medvedev-codefresh/kubecon-2023-demo


ArgoCD certification https://learning.codefresh.io/


# Hands on with WebAssembly Microservices and Kubernetes - Jiaxiao Zhou, David Justice & Kate Goldenring, Microsoft & Radu Matei, Fermyon

https://github.com/deislabs/kc-eu-2023-k8s-wasm-microservices

## WebAssembly (Wasm)

> Is a compilation target producing small binaries, that start up really fast

![](compile-and-run-webassembly.png)

- run inside or outside of the Browser

Wasm supported languages:

![](wasm-language-support.png)

### WebAssembly Runtimes:

JavaScript and WASI (server-side)

![](webassembly-runtimes-js-wasi.png)

e.g. https://wasmtime.dev/

WASI features

portable, secure, small, quick

![](wasi-features-overview.png)


### 3 options to run WebAssembly

![](options-to-run-wasm.png)

* Use a runtime like wasmtime

* Use a framework like spin https://github.com/fermyon/spin

* Use Kubernetes with runwasi


### Spin

> the developer tool for Serverless WebAssembly

![](spin-overview.png)

> right now there's no multithreading inside Spin applications 

commands remind us to Docker:

```shell
$ spin new

$ spin build

$ spin up
```

Spin produces OCI containers... 

### Workshop

prepare https://github.com/deislabs/kc-eu-2023-k8s-wasm-microservices/blob/main/workshop/00-setup.md

```shell
# install spin
$ curl -fsSL https://developer.fermyon.com/downloads/install.sh | bash
$ sudo mv spin /usr/local/bin/
# check command
spin --version

# configure templates
# Install the official Spin templates.
$ spin templates install --git https://github.com/fermyon/spin --update
$ spin templates install --git https://github.com/fermyon/spin-js-sdk --update

# Install a few templates we will use to build applications.
$ spin templates install --git https://github.com/radu-matei/spin-kv-explorer --update

# Install the JavaScript plugin for Spin.
$ spin plugin install js2wasm -y

```

Spin 101 https://github.com/deislabs/kc-eu-2023-k8s-wasm-microservices/blob/main/workshop/01-spin-getting-started.md

```shell
$ spin new http-ts hello-typescript --accept-defaults && cd hello-typescript

$ tree
.
├── README.md
├── package.json
├── spin.toml
├── src
│   └── index.ts
├── tsconfig.json
└── webpack.config.js
```

build app with

```shell
$ npm install

$ spin build
```

run and access app

```shell
$ spin up

$ curl localhost:3000
```

![](wasm-spin-running.png)



## Wasm in Kubernetes

https://github.com/deislabs/kc-eu-2023-k8s-wasm-microservices/blob/main/workshop/02-run-your-first-wasm-on-k3d.md

![](wasm-run-webassembly-in-kubernetes.png)

runwasi is a shim implementation to run WebAssembly

Pod spec runtime class defintion - wasmtime-spin

`RuntimeClass` CRD for that:

![](wasm-k8s-runtime-class.png)

Create 

```shell
$ k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.5.1 -p "8081:80@loadbalancer" --agents 2
```

ContainerD can have multiple shims installed (slight + Spin for example)

Multiple RuntimeClasses: https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/runtime.yaml

Add kubeconfig to your local config:

```shell
k3d kubeconfig get wasm-cluster
```

Install RuntimeClasses & workload

```shell
kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/runtime.yaml
kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/workload.yaml
```

check with 

```shell
echo "waiting 5 seconds for workload to be ready"
sleep 5
curl -v http://127.0.0.1:8081/spin/hello
```

cleanup

```shell
k3d cluster delete wasm-cluster
```


### Deploy Wasm Applications to Kubernetes

https://github.com/deislabs/kc-eu-2023-k8s-wasm-microservices/blob/main/workshop/03-deploy-spin-to-k8s.md

Install the Spin k8s plugin https://github.com/chrismatteson/spin-plugin-k8s :

```shell
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
```

Spin scaffold will create Dockerfile with your registry:

```shell
spin k8s scaffold ghcr.io/my-registry  && spin k8s build
```



# Verifiable GitHub Actions with eBPF - Jose Donizetti, Aqua

https://github.com/aquasecurity/tracee

eBPF in GitHub Actions didn't work - so they created tracee:

> because production time is different than build time

![](tracee-forensics-events-overview.png)

-> build time is predictable: clone, build, test, deploy etc.


GitHub Actions for starting and stopping tracing in the CI/CD process

![](tracee-github-actions-integration.png)

![](ebpf-tracee-tracing-scope-cicd.png)

Policies look like this:

![](tracee-container-build-policy.png)


# Experience with “Hard Multi-Tenancy” in Kubernetes Using Kata Containers - Shuo Chen, Databricks

VM-isolation instead of Container isolation :)

![](kata-containers-architecture.png)


dedicated CPU, storage, dedicated kernel, K8s networking - container network policies

![](kata-container-isolation.png)

![](kata-container-isolation-network.png)


Special RuntimeClass `kata-qemu`:

![](kata-container-runtime.png)


### Cons and how to handle them

**Performance!**

3-6x slower

--> because Kata introduces another abstraction layer!

![](kata-container-performance-problem.png)

How to handle performance:

* local SSDs instead of CloudProvider default
* SPDK (storage performance development kit) + Kata Direct Volumes
--> develop own CSI at Databricks + Kata Virtual Block device

* CPU isolation, CPU pinning and CPU state tuning:

![](kata-container-cpu-tuning.png)

* NUMA (non uniform memory access): prevent Kata VM using cross NUMA resources
* autobalancing load for different NUMA nodes on same host
--> done with NUMA control


### Other Cons

* more infrastructure resources needed than vanilla k8s
--> need to allocate additional Kata Container overhead
* GPU-load not really great for Kata



# Unlocking Argo CD’s Hidden Tools for Chaos Engineering - Featuring VCluster and More - Dan Garfield & Brandon Phillips, Codefresh

> When is one ArgoCD instance not enough anymore?

A ton of tweaks for performance etc. in Argo

![](argocd-when-to-scale.png)

![](argocd-dont-need-to-tweak-before-you-reach-these-numbers.png)


https://github.com/argoproj/argo-cd/tree/master/hack/gen-resources

Works with vcluster

![](argocd-gen-resources.png)

Creates clusters, apps, projects and repos

> Sometimes the Kubernetes API is to slow :)

```shell
# build tool
go build -o ../argocd-generator
```

--> Testing ArgoCD instance! This tool uses all example apps from all ArgoCD forks on GitHub

--> ArgoCD (with autopilot?) also deploys vclusters :)))


Bootstrap ArgoCD with autopilot

https://argocd-autopilot.readthedocs.io/en/stable/

```
Argo CD Autopilot saves operators time by:

    Installing and managing the Argo CD application using GitOps.
    Providing a clear structure for how applications are to be added and updated, all from git.
    Creating a simple pattern for making updates to applications and promoting those changes across environments.
    Enabling better disaster recovery by being able to bootstrap new clusters with all the applications previously installed.
    Handling secrets for Argo CD to prevent them from spilling into plaintext git. (Soon to come)

The Argo-CD Autopilot is a tool which offers an opinionated way of installing Argo-CD and managing GitOps repositories.
```

Check ArgoCD with Prometheus if using big deployments


![](argocd-more-scaling-options.png)



# Tips from the Trenches: GitOps at Adobe - Larisa Andreea Danaila & Ionut-Maxim Margelatu, Adobe

https://kubecon-cloudnativecon-europe.com/session-virtual/?v2477da705118cc74fd14460db021e1784e2eed5a7982c6482ec95cb2e86d259644b8741959f52a49e0e6908b82a9d860=2016E10153E8DDF8D4AFD910808FF61044396EA6C3381AB756ED4A6AE9CD1DF89D9DAD1DF17CED47C6201172D587F6E7

![](gitops-adobe-journey.png)

![](gitops-adobe-environment-config-part-of-app-repo.png)

![](argo-k8s-preview-deployments-from-prs.png)

`argo sync-wave="-1"` -- deploy Apps before other apps (in a specific order)


![](argo-hooks.png)


Discussing separation of app and config repository:

![](argo-separate-config-and-app-repo-or-not.png)

There might be situations where it is better to not separate them.

--> adressing the issues of one repo with filters

Using pre-sync-hooks in ArgoCD to first let the source code build, then trigger the deployment

Using umbrella-charts when using Helm instead of copying the k8s manifests

This is what Adobe does:

![](argo-separate-1-app-repo-and-chart-and-2-deploy-repo-with-values.png)

--> separating app repo WITH chart manifest - and the actual staging values as deploy repo for Argo

![](gitops-argo-adobe-ci-pipeline.png)


### Really big problem to have app deployment and infrastructure separate @ Adobe

Workflows for Argo (app deployment) and Terraform (infrastructure) is separate - that leads to many problems:

![](workflow-deploying-applications-with-argo-and-infrastructure-with-terraform-is-separated.png)


### Adobe uses Crossplane with ArgoCD


![](adobe-unified-approch-app-deployment-and-infrastructure.png)

--> solution using Crossplane also

![](adobe-ci-cd-argo-with-crossplane.png)



Adobe uses official Upbound Provider: https://marketplace.upbound.io/providers/upbound/provider-azure/v0.5.1

They seem to have composite resources in there!!! `dbforpostgresl.azure.upbound.io` :

![](adobe-crossplane-postgres-azure-upbound-provider.png)

https://marketplace.upbound.io/providers/upbound/provider-azure/v0.5.1/resources/dbforpostgresql.azure.upbound.io/FlexibleServer/v1beta1

> Direct usage of Managed Resources is an antipattern!

```yaml
apiVersion: dbforpostgresql.azure.upbound.io/v1beta1
kind: FlexibleServer
metadata:
  name: example-flexible-psqlserver
spec:
  forProvider:
    administratorLogin: psqladminun
    administratorPasswordSecretRef:
      key: password
      name: psql-password
      namespace: crossplane-system
    location: East US
    resourceGroupNameRef:
      name: example
    skuName: GP_Standard_D4s_v3
    storageMb: 32768
    version: "12"
  providerConfigRef:
    name: example
```




They use Crossplane simply as normal Helm chart part:

![](adobe-crossplane-just-one-of-argo-managed-charts.png)

which is than managed by ArgoCD:

![](adobe-crossplane-just-one-of-argo-managed-resources-that-deploys-postgres.png)


There's one problem: Argo thinks a Crossplane resource is green, but thats only the Crossplane pod - not the actual infrastructure (like a database):

![](argdo-crossplane-problem-crossplane-resource-there-but-not-its-deployment.png)

Adobe solved this by creating custom resource health checks for Crossplane in ArgoCD:

![](custom-resource-health-checks-for-crossplane-in-argocd.png)

see https://argo-cd.readthedocs.io/en/stable/operator-manual/health/#custom-health-checks


Full CI/CD overview

![](adobe-app-and-infra-part-of-the-same-cicd.png)


Summary

![](adobe-summary.png)



# Unlocking the Potential of KEDA: New Features and Best Practices - Jorge Turrado Ferrero, SCRM Lidl International Hub & Zbynek Roubalik, Red Hat

https://kubecon-cloudnativecon-europe.com/session-virtual/?v2477da705118cc74fd14460db021e1784e2eed5a7982c6482ec95cb2e86d259644b8741959f52a49e0e6908b82a9d860=B45791AD389A82A2C2018DD36A4FA69AE22DF977A1B45839F3488C22932C121493398BDDE1ACB2B9C6FF15D89E9D5C9F

Scaling application on vanilla k8s only possible based on CPU and memory.

![](keda-scale-app-based-on-rabbitmq-metrics.png)


KEDA allows autoscale deployment resources or jobs based on events (+60 event sources: Prometheus, RabbitMQ, Kafka, SQS, PostGres...)

![](keda-architecture.png)

To use KEDA create a `ScaledObject` (or `ScaledJob`) CRD. These look like:

![](keda-scaledobject.png)



# Use Knative When You Can, and Kubernetes When You Must - David Hadas & Michael Maximilien, IBM

Michael Maximilien, IBM + David Hadas

https://kubecon-cloudnativecon-europe.com/session-virtual/?v2477da705118cc74fd14460db021e1784e2eed5a7982c6482ec95cb2e86d259644b8741959f52a49e0e6908b82a9d860=39F88A776E774D00DB3B97CD962859EDC0E794A1C8B6DA18228BA45EE595066E1A01E902967B7274893F187A1FD0BD59


![](knative-what-is-serverless.png)

Completely dynamic range for resource scaling: From fixed to fully flexible and in between ("I want to have between 1 to 10 containers, but not more - since I won't pay for that"):

![](knative-from-fixed-resources-to-fully-dynamic-resources.png)

What is Knative for?

Twelve Factor Microservices, Serverless Containers and Serverless functions:

![](knative-what-is-it-for.png)

Kubernetes is an absolutely non-opinionated system: you can run anything! That's good - but often times - especially for Microservices - Knative is opinionated!

![](knative-reduces-skills-needed-to-run-kubernetes-apps.png)

Knavite reduces overprovisioning by implementing autoscaling 

![](knative-autoscaling-reduce-overprovisioning.png)

![](knative-idle-resources-vs-suspended-vms.png)

--> Testdrive with load testing on services 

Knative also helps with blue-green & canary deployments

### Knative fosters Security

Knative can even take over TLS and certificate handling! (no Service Mesh needed)

![](knative-security.png)

Check uniform services automatically.

Avoids misconfiguration! --> automatically goes back to configuration in Git


Always asume that your Microservice are volnerable - you have to keep an eye on them! Monitor them all the time



### Limitations of Knative

Non-HTTP-Traffic! Integrate with normal Kubernetes deployments

![](knative-main-limitations.png)

### Build-in Eventing!

![](knative-build-in-eventing-pluggable.png)

you can even plugin your own eventing solution (like Kafka, RabbitMQ, Redis...)


![](knative-summary.png)




# Automating Configuration and Permissions Testing for GitOps with OPA Conftest - Eve Ben Ezra & Michael Hume, The New York Times

https://kubecon-cloudnativecon-europe.com/session-virtual/?v2477da705118cc74fd14460db021e1784e2eed5a7982c6482ec95cb2e86d259644b8741959f52a49e0e6908b82a9d860=20BA2EB7CB288D78F42226BCAAE18BD6B8BF26B6C40BBDB3BD10BD398A5ED69A510796CD64A409BEA6727340921BFF0A

NYTimes Platform Engineering 

![](conftest-argo-pipeline.png)

![](conftest-early-feedback-with-opa-conftest-policies.png)

Use Rego for Conftest. Has it's learning curve!

For example automatic Argo AppProject spec checking.

Demo

https://github.com/ecbenezra/kubecon-eu-2023-conftest

![](conftest-example-rego-policy.png)



# Tutorial: Deploying Cloud-Native Applications Using Kubevela and OAM - Daniel Higuero, Napptive

https://github.com/napptive/kubecon-23-oam-kubevela-tutorial

https://kubevela.io/docs/getting-started/core-concept

Open Application Model (OAM): High level abstraction for your application (born 2019)

https://oam.dev/

provider agnostic, infrastructure agnostic

![](oam-open-application-model-overview.png)

![](oam-kubernetes-hard-to-learn.png)

OAM / Kubevela creates all basic K8s components automatically (Pods, Deployments, Services, Ingress, Volumes etc.)


Kubevela is OAM runtime for k8s - CNCF incubating project

![](oam-kubevela-overview.png)

![](oam-kubevela-reconciler.png)

![](oam-application-crd.png)

Applications have `components`, `traits` (sidecars, logs), `policies` (same as traits, but no need to copy trait to every application), `workflows` (define, how application are deployed)
# Celeb plus Layers

### Deployment

* In order to deploy celeb-common layers, run the following command
```bash
  $ STAGE=<stage_name> npm run deploy-celeb-common-libs

  # example for production stage
  $ STAGE=prod npm run deploy-celeb-common-libs
```
* In order to deploy on local for testing purpose
```bash
  $ npm run local
```

* Before deploying Layers service be sure that this repository has already been added as a submodule to the related project on your local.
In root folder of the related project
```bash
  $ git submodule add https://github.com/spinprotocol/celebplus-layers.git
```
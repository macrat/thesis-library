Thesis Library
==============

[![Build Status](https://travis-ci.org/macrat/thesis-library.svg?branch=master)](https://travis-ci.org/macrat/thesis-library)

The graduation thesis library of [Meguro laboratory](http://megurozemi.com/).

![logo](client/static/favicon.svg)


## How to start

``` shell
$ git clone https://github.com/macrat/thesis-library && cd thesis-library
$ npm install
$ npm test  # optional
$ npm start  # or  $ npm run debug
```

And, open http://localhost:8080/


## Environment variables

- GCLOUD\_PROJECT: Project name of Google Cloud Platform. Required.
- GCLOUD\_BUCKET: Bucket name of Google Cloud Storage. Required.
- GCLOUD\_SERVICE\_ACCOUNT: Credential json data of service account for access to Google Cloud Platform. Use default way to login if omitted.

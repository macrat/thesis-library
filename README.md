Thesis Library
==============

[![Build Status](https://travis-ci.org/macrat/thesis-library.svg?branch=master)](https://travis-ci.org/macrat/thesis-library)

The graduation thesis library of [Meguro laboratory](http://megurozemi.com/).

![logo](client/static/favicon.svg)


## How to start

Install,

``` shell
$ git clone https://github.com/macrat/thesis-library && cd thesis-library
$ npm install
```

Make a setting file like this,

``` shell
$ cat .env
GCLOUD_BUCKET="bucket-name-of-your-google-cloud-storage"
PASSWORD_SECRET="secret string for encrypting user passwords"
```

Start debugging server,

``` shell
$ npm run debug
```

Or start production server,

``` shell
$ npm start
```

And, opening http://localhost:8080/


## Environment variables

### Required

- GCLOUD\_PROJECT: Project name of Google Cloud Platform. Don't have to set if you using console tools of GCP.
- GCLOUD\_BUCKET: Bucket name of Google Cloud Storage.
- PASSWORD\_SECRET: Secret string for encrypting user passwords.

### Optional

- GCLOUD\_SERVICE\_ACCOUNT: Credential json data of service account for access to Google Cloud Platform. Use default way to login if omitted.
- ANALYTICS\_ID: Google Analytics ID. If omitted, don't track user access.


## CORS Settings of Google Cloud Storage
You have to CORS settings because Thesis Library uses GCS from the client.

First, make settings file like this.

``` json
[{
	"maxAgeSeconds": 3600,
	"method": ["GET", "HEAD"],
	"origin": ["http://localhost:8080"],
	"responseHeader": ["Content-Type", "x-goog-meta-metadata"]
}]
```

Please change an origin to your domain if need.

Then, send settings to GCS.

``` shell
$ gsutil cors set [FILENAME].json gs://[YOUR-BUCKET-NAME]
```

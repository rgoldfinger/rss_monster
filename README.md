# rss monster

## Deployment

Install gcloud https://cloud.google.com/sdk/docs/

```
docker build -t gcr.io/rss-monster/app:latest .
docker push gcr.io/rss-monster/app:latest
```

```
# create
 gcloud compute instances create-with-container app \
     --container-image gcr.io/rss-monster/app:latest \
     --machine-type f1-micro
# had to manually give it Cloud Datastore access

# update
 gcloud compute instances update-container app \
     --container-image gcr.io/rss-monster/app:latest \
     --container-env-file ./.env
```

```
gcloud beta run deploy rss-monster --image gcr.io/rss-monster/app:latest --platform managed --region us-central1
```

## logs

https://console.cloud.google.com/logs/viewer?project=rss-monster&minLogLevel=0&expandAll=false&timestamp=2019-08-20T03:47:51.911000000Z&customFacets=&limitCustomFacetWidth=true&advancedFilter=resource.type%3D%22gce_instance%22%0AlogName%3D%22projects%2Frss-monster%2Flogs%2Fcos_containers%22%0Aresource.labels.instance_id%3D%223538570136585175675%22&dateRangeStart=2019-08-20T02:48:09.669Z&dateRangeEnd=2019-08-20T03:48:09.669Z&interval=PT1H&scrollTimestamp=2019-08-20T03:35:49.866935851Z

https://cloud.google.com/compute/docs/containers/deploying-containers#viewing_docker_event_logs

Docker engine logs:

https://console.cloud.google.com/logs/viewer?project=rss-monster&minLogLevel=0&expandAll=false&timestamp=2019-08-20T03:45:28.041000000Z&customFacets=&limitCustomFacetWidth=true&advancedFilter=resource.type%3D%22gce_instance%22%0AlogName%3D%22projects%2Frss-monster%2Flogs%2Fcos_system%22%0AjsonPayload._HOSTNAME%3D%22app%22%0AjsonPayload.SYSLOG_IDENTIFIER%3D%22docker%22&dateRangeStart=2019-08-20T02:46:07.147Z&dateRangeEnd=2019-08-20T03:46:07.147Z&interval=PT1H&scrollTimestamp=2019-08-20T03:35:39.619194000Z

## Cloud Datastore

https://googleapis.dev/nodejs/datastore/latest/index.html

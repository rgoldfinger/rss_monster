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

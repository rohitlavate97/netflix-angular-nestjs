#!/bin/sh
# Initialize MinIO Buckets
/usr/bin/mc alias set local http://minio:9000 minioadmin minioadmin
/usr/bin/mc mb local/netflix-media --ignore-existing
/usr/bin/mc mb local/netflix-thumbnails --ignore-existing
/usr/bin/mc anonymous set download local/netflix-thumbnails
echo "MinIO buckets created successfully"

docker-compose --file docker-compose-repliset.yml up -d 
echo "Waiting 25sec for the mongop container to stabilize..."
sleep 25
docker exec mongop /scripts/rs-init.sh

docker-compose up -d
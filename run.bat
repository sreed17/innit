docker-compose --file docker-compose-repliset.yml up -d 
echo "Waiting till the mongop container stabilize..."
timeout /t 25
docker exec mongop /scripts/rs-init.sh

docker-compose up -d
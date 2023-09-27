#!/bin/bash

DELAY=5

mongosh --eval <<EOF
var config = {
    "_id": "innit-db-set",
    "members": [
        {
            "_id": 0,
            "host": "mongop:27017",
        },
    ]
};
rs.initiate(config, { force: true });
use innit
EOF

echo "Waiting for ${DELAY} seconds for replicaset configuration to be applied..."

sleep ${DELAY}

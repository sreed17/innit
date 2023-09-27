# innit-mono

## HOW TO RUN

Uses docker, install it before continuing
For running the innit network in docker follow the instructions below:

```ps
# clone the repo
git clone https://github.com/flamigo-social/innit-mono.git

# change directory to the one previously cloned
cd innit-mono

# run the run.bat file
./run.bat

```

The containers containing the microservices and mongodb replset would have started by now. You can access core-api, media-server in the ports 50000 and 60000 respectively.

---

## COMMON ISSUES:

```ps
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

Occurs when the mongop container haven't stabilized before you skipped to the next step

```ps
OCI runtime exec failed: exec failed: unable to start container process: exec /scripts/rs-init.sh: no such file or directory: unknown
```

This happens due to encoding issue, changing end-of-line-squence to LR (from CRLF) for the mongo_db/scripts/rs-init.sh file will fix this.

---

Note: For dev: use yarn as main package manager since the project uses yarn workspaces

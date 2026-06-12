FROM mongo:7.0

LABEL maintainer="bo.com.proj"
LABEL project="mongoECommerce"
LABEL version="1.0.0"

ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=admin123
ENV MONGO_INITDB_DATABASE=ecommerce_multitienda

EXPOSE 27017
VOLUME ["/data/db"]

COPY init-mongo.js /docker-entrypoint-initdb.d/

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD mongosh --eval 'db.adminCommand("ping")' || exit 1

CMD ["mongod", "--auth", "--bind_ip_all", "--wiredTigerCacheSizeGB", "1.5"]
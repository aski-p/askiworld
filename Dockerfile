# Java 11 base image
FROM openjdk:11-jre-slim

# Tomcat 다운로드 및 설정
RUN apt-get update && apt-get install -y curl && \
    curl -O https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.82/bin/apache-tomcat-9.0.82.tar.gz && \
    tar -xzf apache-tomcat-9.0.82.tar.gz && \
    mv apache-tomcat-9.0.82 /usr/local/tomcat && \
    rm apache-tomcat-9.0.82.tar.gz

# 작업 디렉터리 설정
WORKDIR /usr/local/tomcat

# 웹 애플리케이션 복사
COPY webapp webapps/deadlock-stats

# 포트 노출
EXPOSE 8080

# 환경 변수 설정
ENV CATALINA_HOME=/usr/local/tomcat
ENV PATH=$CATALINA_HOME/bin:$PATH

# Tomcat 시작
CMD ["catalina.sh", "run"]
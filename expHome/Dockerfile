FROM gcr.io/google.com/cloudsdktool/cloud-sdk:latest
RUN curl -O https://nodejs.org/dist/v18.12.1/node-v18.12.1-linux-x64.tar.xz
RUN tar -xvf node-v18.12.1-linux-x64.tar.xz && \
    rm node-v18.12.1-linux-x64.tar.xz && \
    mv node* node18 && \
    echo "export PATH=$PATH:$(pwd)/node18/bin" >> /root/.profile && \
    echo "export PATH=$PATH:$(pwd)/node18/bin" >> /root/.bashrc
RUN bash -c "source /root/.profile && npm install -g firebase-tools"
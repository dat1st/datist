FROM rustlang/rust:nightly

WORKDIR /my-source
ADD . /my-source

WORKDIR /my-source/web

RUN curl -fsSL https://deno.land/x/install/install.sh | sh
RUN curl https://nodejs.org/dist/v19.7.0/node-v19.7.0-linux-x64.tar.gz | tar xzvf - --exclude CHANGELOG.md --exclude LICENSE --exclude README.md --strip-components 1 -C /usr/local/
RUN npm install -g pnpm
RUN pnpm install

RUN /root/.deno/bin/deno run --unstable --allow-read --allow-write --allow-run ./tasks/build.ts

WORKDIR /my-source

ENV RUSTFLAGS "-C target-cpu=native"

RUN apt update; apt install -y libclang-dev clang

RUN cd /my-source
RUN cargo rustc --verbose --release
RUN mv /my-source/target/release/datist /datist

WORKDIR /my-source

CMD ["/datist"]
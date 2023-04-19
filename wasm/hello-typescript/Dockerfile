FROM scratch AS build
WORKDIR /Users/jonashecht/dev/conferences/kubecon2023/wasm/hello-typescript
COPY . .

FROM scratch
COPY --from=build /Users/jonashecht/dev/conferences/kubecon2023/wasm/hello-typescript/spin.toml .
COPY --from=build /Users/jonashecht/dev/conferences/kubecon2023/wasm/hello-typescript/target/spin-http-js.wasm ./target/spin-http-js.wasm

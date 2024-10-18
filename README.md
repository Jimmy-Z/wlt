example:
```
deno run \
--allow-net=0.0.0.0:80 \
--allow-read=www/index.html,www/script.js \
--allow-ffi=/lib/x86_64-linux-gnu/libnftables.so.1 \
main.ts 80
```

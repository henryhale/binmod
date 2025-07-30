# BinMod

The initial goal was to create a program that reprograms itself.

## Overview
A C program that compile to a binary. The binary can be executed normally without arguments to work normally. Or supply `rewrite` argument followed by the new code.

Imagine a `Hello World` example and you want to produce a different outcome without rebuilding the binary to produce `Hallo Jason`. Same size, same binary functionality.

Something like:
```sh
# normal execution
$ ./main
Hello World

# self reprogramming/modification
$ ./main rewrite "Hallo Jason"

# running again
$ ./main
Hallo Jason
```

Well, that has not worked out yet.

After researching and writing a basic prototype, i found out that the OS
locks the executing binary to avoid self-modification or race conditions.
Furthermore, it is not possible to write to the same binary file as long as the process is running.

## Getting Started

> Tested on Ubuntu 24, might not work other systems
> because of the ELF binary format or tools used

- check that you have these installed: `node`, `make`, `gcc`, `xxd`, `readelf`, `nm`
- build source: `make clean && make build`
- compute target location: `node ./compute.js main code_slot`
- confirm & update `main.c` - `CODE_SLOT_ADRR` if the result is different
- build again
- run with: `./main`
- rewrite test: `./main rewrite 123`

## Lessons

- Binary file patching already exists with tools like `xxd`
- The OS enforces strict mechanisms when executing programs

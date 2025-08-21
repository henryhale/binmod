# reprogram

An attempt to create a program that reprograms itself.

## Overview

A C program that, when run with an argument, rewrites its own binary so that next time it runs, it prints that new string without needing the argument. No config files. No dynamic memory.

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

## The Approach

The C program begins by reserving a constant/fixed size of memory to store what is likely to change later, that is, `code_slot` which appears in `.rodata` section of the final binary.

We need to know its actual location of within the binary after compilation; [compute.js](./compute.js) script does exactly that.
First write a demo program with `code_slot` defined and used - build with `make all`.

```sh
$ gcc -Wall -Wextra -g -o main main.c
```

Then run `node ./compute.js main code_slot` to calculate it's address within the binary.

```sh
$ node ./compute.js main code_slot
FOUND SYMBOL:
 0000000000002008 000000000000000b R code_slot

VAM (virtual address in memory): 0x2008
LEN (size in bytes): 0xb

RODATA SECTION:
   [18] .rodata           PROGBITS         0000000000002000  00002000

VAB (base virtual address in file): 0x2000
FO (file offest): 0x2000

LOCATION of code_slot: 0x2008

First 16 bytes from 0x2008
00002008: 4141 4141 4141 4141 4141 0072 6577 7269  AAAAAAAAAA.rewri
```

Update `CODE_SLOT_ADDR` within the program with the calculated address and build the program again.
```c
#define CODE_SLOT_ADDR 0x2008
```

The `update_code` function attempts to read the binary's path and modifies the contents of `code_slot` by moving the file pointer from the start of the file to the calculated offset `CODE_SLOT_ADDR`. The new data is written within the bounds of the predefined size of `code_slot`.

Without `rewrite` argument:

```sh
$ ./main
Size: 11
Data: AAAAAAAAAA
```

With `rewrite` argument:

```sh
$ ./main rewrite BBBBBBBBBB
cannot open file: Text file busy
```

## Getting Started

> Tested on Ubuntu 24, might not work other systems
> because of the ELF binary format or tools used

- check that you have these installed: `node`, `make`, `gcc`, `xxd`, `readelf`, `nm`
- build source: `make clean && make all`
- compute target location: `node ./compute.js main code_slot`
- confirm & update `main.c` - `CODE_SLOT_ADRR` if the result is different
- build again
- run with: `./main`
- rewrite test: `./main rewrite 123`

## Lessons

- Binary file patching already exists with tools like `xxd`
- The OS enforces strict mechanisms when executing programs

## Conclusion

While the search for an alternative approach still stands, 
I am archiving this repository until something substantial comes up.

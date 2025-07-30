import { argv, argv0, exit } from "node:process";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const FILE = argv0;

const BINARY = argv[2];
const CODESLOT = argv[3];

// both binary file and symbol are required
if (!BINARY?.length || !CODESLOT?.length) {
    console.log(`usage: node ./getaddress.js [binary] [symbol]\n`);
    console.log(`\tbinary - name to binary file to search from\n`);
    console.log(`\tvariable to locate under .rodata section\n`);
    exit(1);
}

// promisify exec function
const pexec = promisify(exec);

// get symbols and sections from ELF binary, filter results
const { stdout } = await pexec(
    `nm -S --defined-only ${BINARY} | grep ${CODESLOT}`,
);

console.log(`FOUND SYMBOL:\n`, stdout);

// hex helper
const toHex = (x) => "0x" + Number(x).toString(16);

// parse output to extract memory addresses
const [x, y] = stdout.split(" ");
const VAM = Number.parseInt(x, 16);
const LEN = Number.parseInt(y, 16);

console.log("VAM (virtual address in memory):", toHex(VAM));
console.log("LEN (size in bytes):", toHex(LEN));

// get information on ELF file, locate for .rodata section
// - constant variables are stored in .rodata section
const { stdout: output } = await pexec(`readelf -S ${BINARY} | grep ".rodata"`);

console.log(`\nRODATA SECTION:\n`, output);

// parse output to extract memory address with respect to the binary
const parts = output
    .replace(/\n/g, "")
    .split(" ")
    .filter((x) => x.length);
const FO = Number.parseInt(parts.pop(), 16);
const VAB = Number.parseInt(parts.pop(), 16);

console.log("VAB (base virtual address in file):", toHex(VAB));
console.log("FO (file offest):", toHex(FO));

// compute the target address
const LOCATION = VAM - VAB + FO;
console.log(`\nLOCATION of ${CODESLOT}:`, toHex(LOCATION));

// confirm it is the right address
// by making a hex dump of the first 16 bytes
const { stdout: result } = await pexec(
    `xxd -s ${toHex(LOCATION)} -l 16 ${BINARY}`,
);

console.log(`\nFirst 16 bytes from ${toHex(LOCATION)}`);
console.log(result);

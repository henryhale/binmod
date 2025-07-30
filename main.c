#include<stdio.h>
#include<string.h>

// fixed storage location for the program's code
const char code_slot[] = "AAA";

// the computed location of `code_slot` in resultant binary
//
// confirm memory address below using:
// - manually use either tool: hexedit or xdd
// - use pre-written script: node ./compute.js
#define CODE_SLOT_ADDR 0x2020

// function to update binary's code contents
int update_code(char* filename, char* data);

// dummy processing work for the binary
void print_code();

int main(int argc, char** argv) {
    printf("Hello world!\n");

    if (argc == 3 && strcmp(argv[1], "rewrite") == 0) {
        // update with new code
        int status = update_code(argv[0], argv[2]);
        return status;
    }

    // otherwise, do the work normally
    print_code();

    return 0;
}

int update_code(char* filename, char* data) {
    // open file for writing binary data
    FILE* fp = fopen(filename, "r+b");
    if (!fp) {
        perror("cannot open file");
        return 1;
    }
    // move file internal file pointer to the beginning of the file
    // then move to `code_slot` location
    fseek(fp, CODE_SLOT_ADDR, SEEK_SET);
    //now write the new code
    size_t size = sizeof(char);
    size_t count = sizeof(data) / size;
    // don't overwrite other things & keep null terminator character at the end
    size_t limit = (sizeof(code_slot) / size) - 1;
    count = count > limit ? limit : count;
    fwrite(data, size, count, fp);
    // close file
    fclose(fp);
    // success
    return 0;
}

void print_code() {
    size_t size = sizeof(code_slot) / sizeof(code_slot[0]);

    printf("Size: %ld\nData: %s\n",size, code_slot);
}

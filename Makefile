# compiler and flags
CC = gcc
CFLAGS = -Wall -Wextra -g

# target binary
TARGET = main

# source file
SOURCE = main.c

# default target
all: $(TARGET)

$(TARGET):
	$(CC) $(CFLAGS) -o $(TARGET) $(SOURCE)

clean:
	rm -f $(TARGET)

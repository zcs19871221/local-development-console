package com.cs.home.process;

import java.io.RandomAccessFile;

@FunctionalInterface
public interface FileHandler<T> {
    T execute(RandomAccessFile randomAccessFile) throws Exception; // Define logic here
}
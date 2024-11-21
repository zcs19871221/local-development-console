package com.cs.home.process;

import java.time.Instant;

public class MockProcess {
    public static void main(String[] args) throws InterruptedException {
        int count = 0;
        while (true) {
            if (count == 0) {
                System.out.print("count " + count + "\n");
            } else if (count == 1) {
                System.out.print("count " + count + "\n");
            } else if (count == 2) {
                System.out.print("success\n");
            } else if (count == 3) {
                System.out.print("success error\n");
            } else if (count == 4) {
                System.out.print("error compiling..." +
                        "\nc:/work/processOutputLog.txt(3,4)\n" +
                        "/tmp/a.java\nd:\\work\\e.tsx");
            } else {
                break;
            }
            count++;
            Thread.sleep(500); // Simulate some work
        }
    }
}

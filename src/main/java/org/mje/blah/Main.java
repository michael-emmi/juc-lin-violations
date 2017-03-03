package org.mje.blah;

import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {

    public static void main(String... args) {
        try {

            Class<?> c = Class.forName("java.util.concurrent.ConcurrentLinkedQueue");
            Harness h = HarnessFactory.allAgainstOne(
                new Invocation(c.getConstructor()),
                new Invocation(c.getMethod("add", Object.class), 1),
                new Invocation(c.getMethod("add", Object.class), 2),
                new Invocation(c.getMethod("clear")),
                new Invocation(c.getMethod("peek"))
            );

            Path root = Paths.get("src", "jcstress", "java");
            Path auto = Paths.get(root.toString(), h.getPackage().split("[.]"));
            Path file = Paths.get(auto.toString(), h.getName() + ".java");

            File dir = new File(auto.toString());
            if (!dir.exists())
                dir.mkdir();

            try(PrintWriter out = new PrintWriter(file.toString())) {
                out.println(new JCStressHarnessPrinter(h).toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("CLASS PROBLEMS: " + e);
        }
    }
}
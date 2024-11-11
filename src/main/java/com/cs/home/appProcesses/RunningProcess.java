package com.cs.home.appProcesses;

import com.cs.home.appProcessStatus.AppProcessStatusResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Set;


@RequiredArgsConstructor
@Getter
@Setter
public class RunningProcess {
    private static File pidFile = new File(System.getProperty("java.io" +
            ".tmpdir"));
    private final FileInputStream fileInputStream;
    private final BufferedReader br;
    private Logger logger = LoggerFactory.getLogger(RunningProcess.class);
    private Process process;
    private ProcessBuilder pb;
    private String label;
    private String color;
    private Integer appProcessId;
    private Boolean running = true;
    private Set<AppProcessStatusResponse> appProcessStatuses;

    RunningProcess(String[] commands, String cwd, File log,
                   Set<AppProcessStatusResponse> _appProcessStatuses) throws IOException {

        start(commands, cwd, log);
        fileInputStream = new FileInputStream(log);
        br = new BufferedReader(new InputStreamReader(fileInputStream,
                StandardCharsets.UTF_8)
        );
        appProcessStatuses = _appProcessStatuses;
    }

    public void destory() throws IOException {
        this.br.close();
        this.fileInputStream.close();
    }

    public void start(String[] commands, String cwd, File log) throws IOException {
        String[] newCommands = commands.clone();
        if ("npm".equals(commands[0]) && System.getProperty("os.name").startsWith("Windows")) {
            newCommands[0] = "npm.cmd";
        }
        pb = new ProcessBuilder(newCommands);

        pb.directory(new File(cwd));
        pb.redirectErrorStream(true);
        pb.redirectOutput(log);
        process = pb.start();
        logger.info("execute command: {} , pid is : {}", Arrays.toString(commands),
                process.pid());


    }
}

package com.cs.home.process;

import com.cs.home.log_monitor.LogStatusResponse;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Observable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Getter
@Setter
public class RunningProcess extends Observable {
    private static final String DIRECTORY_NAME_OR_FILE_NAME_REGEXP = "[^\\s\\n\\\\/:*?\"<>|]+";
    private static final Pattern PATH_PATTERN =
            Pattern.compile("(^|[\\s\\n(']+)((?:[a-z]:)?([/\\\\]+)(?:"
                            + DIRECTORY_NAME_OR_FILE_NAME_REGEXP + "\\3)*" +
                            DIRECTORY_NAME_OR_FILE_NAME_REGEXP +
                            "\\.[a-z][a-z\\d]+([:(](\\d+)[,:]?(\\d+)?[:)]?)?(?=[\\s\\n)']+|$))",
                    Pattern.CASE_INSENSITIVE);
    private static boolean IS_WINDOWS = System.getProperty("os.name").startsWith("Windows");
    private static Logger LOGGER = LoggerFactory.getLogger(RunningProcess.class);
    private static Map<String, String> COMMAND_EXTENSIONS = Map.of(
            "npm", ".cmd",
            "code", ".cmd"
    );
    private BufferedReader br;
    private Long offsetByteInOutputLog = 0L;
    private LogStatusResponse logStatus = null;
    private Integer processId;
    private boolean running = false;
    private java.lang.Process systemProcess;
    private ProcessBuilder processBuilder;
    private List<LogStatusResponse> logStatuses;
    private File processOutputLog;
    private File formattedLog;
    private String[] commands;
    private String currentWorkingDirectory;
    private boolean isWriting;

    public RunningProcess(String[] commands,
                          String currentWorkingDirectory,
                          List<LogStatusResponse> logStatuses,
                          Integer processId) throws IOException {
        commands[0] = ensureCommand(commands[0]);
        this.commands = commands;
        this.currentWorkingDirectory = currentWorkingDirectory;
        this.logStatuses = logStatuses;
        this.processId = processId;
    }

    private void tryWrite(FileHandler fileHandler) throws Exception {
        if (isWriting) {
            addObserver(new FileWriterObserver(this));
            return;
        }
        try {
            fileHandler.execute();
        } finally {
            isWriting = false;
        }
    }

    private String ensureCommand(String command) {
        if (command.contains(".") || !IS_WINDOWS) {
            return command;
        }

        if (!COMMAND_EXTENSIONS.containsKey(command)) {
            LOGGER.warn("command {} in windows platform will add ext .exe, if there is not the .exe file, will throw error", command);
            return command;
        }

        return command + COMMAND_EXTENSIONS.getOrDefault(command, "");
    }

    public void setStatusAndHighlightLog() throws Exception {
        tryWrite(this::doSetStatusAndHighlightLog);
    }

    public void doSetStatusAndHighlightLog() throws Exception {
        String incrementalLog;
        StringBuilder log = new StringBuilder();
        while ((incrementalLog = br.readLine()) != null) {
            LogStatusResponse matchedLogStatus = null;
            int lastMatchedStart = -1;
            for (LogStatusResponse logStatus : logStatuses) {
                Pattern statusPattern =
                        Pattern.compile("([\\s\\n]+|^)(" +
                                        Arrays.stream(logStatus.getLogMatchPatterns()).
                                                map(p -> "(?:" + Pattern.quote(p) + ")").
                                                collect(Collectors.joining("|")) +
                                        ")([\\s\\n]+|$)",
                                Pattern.CASE_INSENSITIVE);
                Matcher matcher = statusPattern.matcher(incrementalLog);
                Integer currentLastMatchedStart = null;
                while (matcher.find()) {
                    currentLastMatchedStart = matcher.start() + matcher.group(1).length();
                }
                if (currentLastMatchedStart == null) {
                    continue;
                }
                if (currentLastMatchedStart > lastMatchedStart) {
                    matchedLogStatus = logStatus;
                    lastMatchedStart = currentLastMatchedStart;
                }
                if (logStatus.getIsErrorStatus()) {
                    incrementalLog = matcher.replaceAll("$1<-TAG_WRAPPER>$2</-TAG_WRAPPER>$3");
                }
            }
            if (matchedLogStatus != null) {
                logStatus = matchedLogStatus;
            }

            Matcher matcher = PATH_PATTERN.matcher(incrementalLog);
            if (matcher.find()) {
                incrementalLog = matcher.replaceAll("$1<-PATH_WRAPPER row=$5 col=$6 to-remove=$4>$2</-PATH_WRAPPER>");
            }
            log.append(incrementalLog);
            log.append("\n");
        }
        Files.write(formattedLog.toPath(), log.toString().getBytes(), StandardOpenOption.APPEND);

    }


    public void start() throws IOException {
        if (isRunning()) {
            return;
        }

        processBuilder = new ProcessBuilder(commands);
        String baseDir = System.getProperty("java.io.tmpdir");
        logStatus = null;
        processOutputLog = new File(Paths.get(baseDir, processId +
                ".outputLog").toString());
        formattedLog = new File(Paths.get(baseDir, processId +
                ".formatedLog").toString());


        Files.writeString(processOutputLog.toPath(), "");
        Files.writeString(formattedLog.toPath(), "");
        LOGGER.debug("process output log file: " + processOutputLog);
        LOGGER.debug("process formated output log file: " + formattedLog);
        offsetByteInOutputLog = 0L;
        processBuilder.directory(new File(currentWorkingDirectory));
        processBuilder.redirectErrorStream(true);
        processBuilder.redirectOutput(processOutputLog);
        FileInputStream fileInputStream = new FileInputStream(processOutputLog);
        br = new BufferedReader(new InputStreamReader(fileInputStream));
        systemProcess = processBuilder.start();
        running = true;
        LOGGER.info("execute command: {} at {}, pid is : {}", String.join(" ", commands),
                currentWorkingDirectory, systemProcess.pid());
    }

    public void stop() throws IOException {
        running = false;
        if (systemProcess != null && systemProcess.isAlive()) {
            systemProcess.descendants().forEach(ProcessHandle::destroy);
            systemProcess.destroy();
        }
        LOGGER.info("command: {}  stopped",
                String.join(" ", commands));
    }

    public String readLog() throws Exception {
        return Files.readString(formattedLog.toPath());
    }

    public void clearLog() throws Exception {
        if (!Files.exists(formattedLog.toPath())) {
            return;
        }

        tryWrite(() -> {
            Files.writeString(processOutputLog.toPath(), "");
        });

    }

}

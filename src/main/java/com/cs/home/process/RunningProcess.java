package com.cs.home.process;

import com.cs.home.common.ApplicationException;
import com.cs.home.log_monitor.LogStatusResponse;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Getter
@Setter
public class RunningProcess {
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

    public RunningProcess(String[] commands,
                          String currentWorkingDirectory,
                          List<LogStatusResponse> logStatuses,
                          Integer processId) throws IOException {
        commands[0] = ensureCommand(commands[0]);
        this.commands = commands;
        this.currentWorkingDirectory = currentWorkingDirectory;
        // make clearLogOnMatch ahead others, because we could delete useless log before other
        // status handle it
        this.logStatuses = logStatuses.stream()
                .sorted((a, b) -> Boolean.compare(b.getClearLogOnMatch(), a.getClearLogOnMatch()))
                .collect(Collectors.toList());
        this.processId = processId;
    }

    /**
     * Handles file operations with retries and locking mechanism.
     *
     * @param file          The target file to process.
     * @param fileHandler   A callback to define file processing logic.
     * @param maxRetry      Maximum retry attempts.
     * @param retryInterval Interval between retries in milliseconds.
     * @throws Exception If processing fails after retries.
     */
    public static <T> T processWithLock(File file, int maxRetry, int retryInterval, FileHandler<T> fileHandler) throws Exception {
        int retryCount = 0;
        // Validate inputs to ensure correct usage
        validateInputs(file, fileHandler, maxRetry, retryInterval);

        while (retryCount++ < maxRetry) {
            try (RandomAccessFile targetFile = new RandomAccessFile(file, "rw");
                 FileChannel channel = targetFile.getChannel();
                 FileLock lock = channel.tryLock()) {

                if (lock == null) {
                    LOGGER.info("File lock unavailable. Retrying... Attempt: {}", retryCount);
                    Thread.sleep(retryInterval);
                    continue;
                }

                return fileHandler.execute(targetFile);
            } catch (OverlappingFileLockException e) {
                LOGGER.warn("File is already locked. Retrying... Attempt: {}", retryCount);
                Thread.sleep(retryInterval);
            } catch (Exception e) {
                throw new ApplicationException("Error occurred while accessing or processing the locked file: " + file.toPath(), e);
            }
        }

        throw new IllegalStateException("Max retries " + maxRetry + "reached. File processing failed.");
    }

    /**
     * Validates input parameters to ensure they are correct.
     */
    private static <T> void validateInputs(File file, FileHandler<T> fileHandler, int maxRetry, int retryInterval) {
        if (file == null || !file.exists()) {
            throw new IllegalArgumentException("File must not be null and should exist.");
        }
        if (fileHandler == null) {
            throw new IllegalArgumentException("FileHandler must not be null.");
        }
        if (maxRetry <= 0) {
            throw new IllegalArgumentException("maxRetry must be greater than 0.");
        }
        if (retryInterval <= 0) {
            throw new IllegalArgumentException("retryInterval must be greater than 0.");
        }
    }

    private List<LogStatusResponse> sortLogStatuses(List<LogStatusResponse> logStatuses) {
        return logStatuses.stream()
                .sorted((a, b) -> Boolean.compare(b.getClearLogOnMatch(), a.getClearLogOnMatch()))
                .collect(Collectors.toList());
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
        running = systemProcess.isAlive();
        try (RandomAccessFile processOutputFile = new RandomAccessFile(processOutputLog,
                "r")) {
            if (processOutputFile.length() == offsetByteInOutputLog) {
                return;
            }
            processWithLock(formattedLog, 10, 100, (formatedLogFile) -> {
                String incrementalLog = readIncrementalLog(processOutputFile);

                LogStatusResponse matchedLogStatus = null;
                int lastMatchedStart = -1;
                boolean clearLog = false;

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
                    if (logStatus.getClearLogOnMatch()) {
                        incrementalLog = incrementalLog.substring(lastMatchedStart);
                        clearLog = true;
                        continue;
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

                byte[] incrementalLogBytes = incrementalLog.getBytes();
                if (clearLog) {
                    formatedLogFile.seek(0);
                    formatedLogFile.write(incrementalLogBytes);
                    formatedLogFile.setLength(incrementalLogBytes.length);
                    return null;
                }
                formatedLogFile.seek(formatedLogFile.length());
                formatedLogFile.write(incrementalLogBytes);
                return null;
            });
        }
    }

    private String readIncrementalLog(RandomAccessFile processOutputFile) throws IOException {
        int len = (int) (processOutputFile.length() - offsetByteInOutputLog);
        byte[] incrementalByte = new byte[len];
        processOutputFile.seek(offsetByteInOutputLog);
        processOutputFile.read(incrementalByte, 0, len);
        offsetByteInOutputLog = processOutputFile.length();
        return new String(incrementalByte, StandardCharsets.UTF_8);
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
        if (!Files.exists(formattedLog.toPath())) {
            return "";
        }
        return processWithLock(formattedLog, 200, 10, (formatedLogFile) -> {
            byte[] fileBytes = new byte[(int) formatedLogFile.length()];
            formatedLogFile.readFully(fileBytes);
            return new String(fileBytes, StandardCharsets.UTF_8);
        });
    }

    public void clearLog() throws Exception {
        if (!Files.exists(formattedLog.toPath())) {
            return;
        }
        processWithLock(formattedLog, 200, 10, (formatedLogFile) -> {
            formatedLogFile.setLength(0);
            return null;
        });
    }

}

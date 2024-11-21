package com.cs.home.process;

import com.cs.home.log_monitor.LogStatusResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Getter
@Setter
public class RunningProcess {
    public static boolean isWindows = System.getProperty("os.name").startsWith("Windows");
    private static Map<String, String> commandMapExt = Map.of(
            "npm", ".cmd",
            "code", ".cmd"
    );

    private Long offsetByteInOutputLog = 0L;
    private LogStatusResponse logStatus = null;
    private Integer processId;
    private boolean running = false;
    private Logger logger = LoggerFactory.getLogger(RunningProcess.class);
    private java.lang.Process systemProcess;
    private ProcessBuilder pb;
    private List<LogStatusResponse> logStatuses;
    private File processOutputLog;
    private File formatedLog;
    private String[] commands;
    private String cwd;
    private String directoryNameOrFileNameRegexp = "[^\\s\\n\\\\/:*?\"<>|]+";

    public RunningProcess(String[] commands,
                          String cwd,
                          List<LogStatusResponse> logStatuses,
                          Integer processId) throws IOException {
        commands[0] = ensureCommand(commands[0]);
        this.commands = commands;
        this.cwd = cwd;
        this.logStatuses = logStatuses;
        this.processId = processId;
        this.logStatuses.sort((a, b) -> {
            if (a.getClearLogOnMatch() && b.getClearLogOnMatch()) {
                return 0;
            }
            if (a.getClearLogOnMatch()) {
                return -1;
            }
            return 1;
        });
    }

    private String ensureCommand(String command) {
        if (command.contains(".") || !isWindows) {
            return command;
        }

        if (!commandMapExt.containsKey(command)) {
            logger.warn("command {} in windows platform will add ext .exe, if there is not the .exe file, will throw error", command);
            return command;
        }

        return command + commandMapExt.getOrDefault(command, "");
    }

    public void setStatusAndHighLightLog() {
        running = systemProcess.isAlive();
        int maxRetry = 10;
        int retry = 0;
        try (RandomAccessFile processOutputFile = new RandomAccessFile(processOutputLog,
                "r")) {
            if (processOutputFile.length() == offsetByteInOutputLog) {
                return;
            }
            while (retry++ < maxRetry) {
                try (RandomAccessFile formatedLogFile = new RandomAccessFile(formatedLog, "rw");
                     FileChannel channel = formatedLogFile.getChannel();
                     FileLock lock = channel.tryLock()) {
                    if (lock == null) {
                        Thread.sleep(100); // Wait for 1 second before retrying
                        continue;
                    }
                    int len = (int) (processOutputFile.length() - offsetByteInOutputLog);
                    byte[] incrementalByte = new byte[len];
                    processOutputFile.seek(offsetByteInOutputLog);
                    processOutputFile.read(incrementalByte, 0, len);
                    offsetByteInOutputLog = processOutputFile.length();

                    String incrementalLog = new String(incrementalByte, StandardCharsets.UTF_8);

                    LogStatusResponse matchedLogStatus = null;
                    int lastMatchedStart = -1;
                    boolean clearBefore = false;

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
                            clearBefore = true;
                            continue;
                        }
                        if (logStatus.getIsErrorStatus()) {
                            incrementalLog = matcher.replaceAll("$1<-TAG_WRAPPER>$2</-TAG_WRAPPER>$3");
                        }
                    }
                    if (matchedLogStatus != null) {
                        logStatus = matchedLogStatus;
                    }

                    Pattern pathPattern =
                            Pattern.compile("(^|[\\s\\n(']+)((?:[a-z]:)?([/\\\\]+)(?:"
                                            + directoryNameOrFileNameRegexp + "\\3)*" +
                                            directoryNameOrFileNameRegexp +
                                            "\\.[a-z][a-z\\d]+([:(](\\d+)[,:]?(\\d+)?[:)]?)?(?=[\\s\\n)']+|$))",
                                    Pattern.CASE_INSENSITIVE);
                    Matcher matcher = pathPattern.matcher(incrementalLog);
                    if (matcher.find()) {
                        incrementalLog = matcher.replaceAll("$1<-PATH_WRAPPER row=$5 col=$6 to-remove=$4>$2</-PATH_WRAPPER>");
                    }


                    byte[] incrementalLogBytes = incrementalLog.getBytes();
                    if (clearBefore) {
                        formatedLogFile.seek(0);
                        formatedLogFile.write(incrementalLogBytes);
                        formatedLogFile.setLength(incrementalLogBytes.length);
                        return;
                    }
                    formatedLogFile.seek(formatedLogFile.length());
                    formatedLogFile.write(incrementalLogBytes);
                    return;
                } catch (IOException | InterruptedException e) {
//                    logger.error("exception when setStatusAndHighLightLog", e);
                }
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }

    public void start() throws IOException {
        if (isRunning()) {
            return;
        }

        pb = new ProcessBuilder(commands);

        String baseDir = System.getProperty("java.io.tmpdir");
        logStatus = null;
        processOutputLog = new File(Paths.get(baseDir, processId +
                ".outputLog").toString());
        formatedLog = new File(Paths.get(baseDir, processId +
                ".formatedLog").toString());
        Files.writeString(processOutputLog.toPath(), "");
        Files.writeString(formatedLog.toPath(), "");
        logger.debug("process output log file: " + processOutputLog);
        logger.debug("process formated output log file: " + formatedLog);
        offsetByteInOutputLog = 0L;
        pb.directory(new File(cwd));
        pb.redirectErrorStream(true);
        pb.redirectOutput(processOutputLog);

        systemProcess = pb.start();
        running = true;
        logger.info("execute command: {} at {}, pid is : {}", String.join(" ", commands),
                cwd, systemProcess.pid());
    }

    public void stop() throws IOException {
        running = false;
        if (systemProcess != null && systemProcess.isAlive()) {
            systemProcess.descendants().forEach(ProcessHandle::destroy);
            systemProcess.destroy();
        }
        logger.info("command: {}  stopped",
                String.join(" ", commands));
    }

    public String readLog() throws Exception {
        if (Files.exists(formatedLog.toPath())) {
//            return Files.readString(formatedLog.toPath());
            int tryCount = 0;
            int maxTry = 5;
            while (tryCount++ < maxTry) {
                try (RandomAccessFile formatedLogFile = new RandomAccessFile(formatedLog, "rw");
                     FileChannel channel = formatedLogFile.getChannel();
                     FileLock lock = channel.tryLock()) {
                    if (lock == null) {
                        Thread.sleep(500);
                        continue;
                    }
                    byte[] fileBytes = new byte[(int) formatedLogFile.length()];
                    formatedLogFile.readFully(fileBytes);
                    return new String(fileBytes, StandardCharsets.UTF_8);
                } catch (Exception e) {
                    Thread.sleep(500);
                }

            }
        }
        return "";
    }

}
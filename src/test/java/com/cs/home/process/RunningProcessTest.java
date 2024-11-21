package com.cs.home.process;

import com.cs.home.log_monitor.LogStatusResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


class RunningProcessTest {

    private final LogStatusResponse compiling = LogStatusResponse.builder().logMatchPatterns(new String[]{"compiling..."}).clearLogOnMatch(true).label("compiling").labelColor("blue").isErrorStatus(false).build();

    private final LogStatusResponse errorLogStatus = LogStatusResponse.builder().logMatchPatterns(new String[]{"error", "wrong"}).isErrorStatus(true).label("error").labelColor("red").clearLogOnMatch(false).build();

    private final LogStatusResponse success = LogStatusResponse.builder().logMatchPatterns(new String[]{"success"}).label("success").labelColor("green").clearLogOnMatch(false).isErrorStatus(false).build();

    private List<LogStatusResponse> logStatusList = new ArrayList<>();

    private RunningProcess runningProcess;


    @BeforeEach
    public void setUp() throws IOException {
        List<LogStatusResponse> logStatusList = new ArrayList<>();
        logStatusList.add(errorLogStatus);
        logStatusList.add(success);
        logStatusList.add(compiling);
        this.logStatusList = logStatusList;
        runningProcess = new RunningProcess(
                new String[]{"java", "MockProcess.java"},
                "C:\\work\\local-development-console\\src\\test\\java\\com\\cs\\home\\process",
                logStatusList,
                996);
    }

    @AfterEach
    public void close() throws IOException {
        runningProcess.stop();
    }


    @Test
    void shouldGetCorrect() throws IOException {
        try {
            runningProcess.start();
            Thread.sleep(1050);

            runningProcess.setStatusAndHighLightLog();
            assertNull(runningProcess.getLogStatus());
            assertTrue(runningProcess.isRunning());
            assertEquals("count 0\ncount 1\n", runningProcess.readLog());

            Thread.sleep(505);
            runningProcess.setStatusAndHighLightLog();
            assertEquals(success.getLabel(), runningProcess.getLogStatus().getLabel());
            assertEquals("count 0\ncount 1\nsuccess\n",
                    runningProcess.readLog());

            Thread.sleep(505);
            runningProcess.setStatusAndHighLightLog();
            assertEquals(errorLogStatus.getLabel(), runningProcess.getLogStatus().getLabel());
            assertEquals("count 0\ncount 1\nsuccess\nsuccess <-TAG_WRAPPER>error</-TAG_WRAPPER>\n",
                    runningProcess.readLog());


            Thread.sleep(505);
            runningProcess.setStatusAndHighLightLog();
            assertEquals(compiling.getLabel(), runningProcess.getLogStatus().getLabel());
            assertEquals("compiling...\n<-PATH_WRAPPER row=3 " +
                            "col=4>c:/work/processOutputLog" +
                            ".txt(3,4)</-PATH_WRAPPER>\n" +
                            "<-PATH_WRAPPER row= col=>/tmp/a" +
                            ".java</-PATH_WRAPPER>\n<-PATH_WRAPPER row= " +
                            "col=>d:\\work\\e.tsx</-PATH_WRAPPER>",
                    runningProcess.readLog());

            runningProcess.stop();
            assertEquals(compiling.getLabel(), runningProcess.getLogStatus().getLabel());
            assertFalse(runningProcess.isRunning());

        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            runningProcess.stop();
        }

    }
}

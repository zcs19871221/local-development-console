package com.cs.home.appProcesses;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface AppProcessService {
    void start(Integer appProcessId) throws Exception;

    void stop(Integer appProcessId) throws Exception;

    void restart(Integer appProcessId) throws Exception;

    void clearLog(Integer appProcessId) throws IOException;

    String logs(Integer appProcessId) throws Exception;

    AppProcessResponse create(AppProcessCreated processCreated) throws Exception;

    AppProcessResponse update(AppProcessUpdated processUpdated) throws Exception;

    void delete(Integer processId) throws IOException;

    void stopAll() throws IOException;

    List<AppProcessResponse> list() throws Exception;

    Map<Integer, RunningProcessResponse> runningProcesses() throws IOException;

    List<String> paths();
}

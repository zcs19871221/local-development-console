package com.cs.home.process;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ProcessService {
    RunningProcess start(Integer processId) throws Exception;

    void stop(Integer processId) throws Exception;

    void restart(Integer processId) throws Exception;

    void clearLog(Integer processId) throws Exception;

    String getLog(Integer processId) throws Exception;

    ProcessResponse create(ProcessCreated processCreated) throws Exception;

    ProcessResponse update(ProcessUpdated processUpdated) throws Exception;

    void delete(Integer processId) throws IOException;

    void destroyAll() throws Exception;

    List<ProcessResponse> getAll() throws Exception;

    Map<Integer, RunningProcessResponse> runningProcesses() throws Exception;

    List<String> getDistinctProcessPaths();
}

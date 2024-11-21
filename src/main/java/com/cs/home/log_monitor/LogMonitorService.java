package com.cs.home.log_monitor;

import java.util.List;

public interface LogMonitorService {

    LogMonitorResponse create(LogMonitorCreated logMonitorCreated);

    LogMonitorResponse update(LogMonitorUpdated logMonitorUpdated);

    void delete(Integer logMonitorId);

    List<LogMonitorResponse> getAll();

    LogMonitorResponse getById(Integer logMonitorId);

    void validLogMonitorExists(Integer logMonitorId);
}

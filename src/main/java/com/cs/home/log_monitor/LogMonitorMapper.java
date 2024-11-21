package com.cs.home.log_monitor;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;

@Mapper(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LogMonitorMapper {

    LogMonitor map(LogMonitorCreated logMonitorCreated);

    LogMonitor map(LogMonitorUpdated logMonitorUpdated);

    LogMonitorResponse map(LogMonitor logMonitor);

    LogStatusResponse map(LogStatus logStatus);

    List<LogMonitorResponse> mapList(List<LogMonitor> logMonitors);

    List<LogStatusResponse> map(List<LogStatus> logStatuses);

}

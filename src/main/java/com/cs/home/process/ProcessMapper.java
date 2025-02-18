package com.cs.home.process;

import com.cs.home.log_monitor.LogMonitorMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.concurrent.atomic.AtomicBoolean;

@Mapper(nullValuePropertyMappingStrategy =
        NullValuePropertyMappingStrategy.IGNORE, uses =
        LogMonitorMapper.class)
public interface ProcessMapper {
    @Mapping(target = "logMonitor", source = "logMonitorId", ignore = true)
    Process map(ProcessUpdated processUpdated);

    Process map(ProcessCreated processCreated);

    ProcessResponse map(Process process);

    RunningProcessResponse map(RunningProcess runningProcess);


    default boolean map(AtomicBoolean running) {
        return running.get();
    }
}

package com.cs.home.process;

import com.cs.home.log_monitor.LogMonitorResponse;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;


@Data
public class ProcessResponse {
    private Integer id;

    private String command;

    private String description;

    private String path;

    private LogMonitorResponse logMonitor;
}

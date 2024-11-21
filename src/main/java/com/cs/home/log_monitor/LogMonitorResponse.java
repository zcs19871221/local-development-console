package com.cs.home.log_monitor;

import lombok.Data;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Data
@Getter
public class LogMonitorResponse {
    private Integer id;
    
    private String name;

    private List<LogStatusResponse> statusConfigurations = new ArrayList<>();
}

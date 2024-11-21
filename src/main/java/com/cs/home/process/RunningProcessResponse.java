package com.cs.home.process;

import com.cs.home.log_monitor.LogStatusResponse;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class RunningProcessResponse {
    private Integer processId;

    private LogStatusResponse logStatus;

    private boolean running;

}
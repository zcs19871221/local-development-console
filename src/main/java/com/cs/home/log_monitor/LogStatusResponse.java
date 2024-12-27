package com.cs.home.log_monitor;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class LogStatusResponse {
    private String label;   // Label to display for the status

    private String labelColor;  // Color for the status label

    private String[] logMatchPatterns;  // Regex pattern to match in the processOutputLog

    private Boolean isErrorStatus;  // Indicates if this status is an error
}

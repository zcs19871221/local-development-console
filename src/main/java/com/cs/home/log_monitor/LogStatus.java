package com.cs.home.log_monitor;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Embeddable
@Data
public class LogStatus {
    @NotEmpty
    private String label;   // Label to display for the status

    @NotEmpty
    private String labelColor;  // Color for the status label

    @NotEmpty
    @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
    private String[] logMatchPatterns;  // Regex pattern to match in the processOutputLog

    @NotNull
    private Boolean isErrorStatus = false;  // Indicates if this status is an error

    @NotNull
    private Boolean clearLogOnMatch = false; // If true, clear the processOutputLog when the pattern matches

}

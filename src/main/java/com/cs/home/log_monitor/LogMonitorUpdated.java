package com.cs.home.log_monitor;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Data
public class LogMonitorUpdated {

    @NotNull
    private Integer id;

    @NotEmpty
    private String name;

    @NotNull
    @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
    private List<LogStatus> statusConfigurations = new ArrayList<>();

}

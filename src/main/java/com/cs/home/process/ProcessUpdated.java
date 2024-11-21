package com.cs.home.process;

import com.cs.home.common.Directory;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.HashSet;

@Data
public class ProcessUpdated {
    @NotNull
    private Integer id;

    @NotEmpty
    private String command;

    private String description;

    @NotNull
    @Directory
    private String path;

    private Integer logMonitorId;

}

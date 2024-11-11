package com.cs.home.appProcesses;

import com.cs.home.common.Directory;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.HashSet;

@Data
public class AppProcessUpdated {

    @NotEmpty
    private String command;

    private String description;

    @NotNull
    private Integer id;

    @NotNull
    @Directory
    private String path;

    private Integer port;

    @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
    private HashSet<Integer> appProcessStatusIds = new HashSet<>();

}

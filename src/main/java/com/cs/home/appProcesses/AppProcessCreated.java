package com.cs.home.appProcesses;

import com.cs.home.common.Directory;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Data
public class AppProcessCreated {

    @NotEmpty
    private String command;

    private String description;

    @NotNull
    @Directory
    private String path;

    @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
    private Set<Integer> appProcessStatusIds = new HashSet<>();

}

package com.cs.home.appProcesses;

import com.cs.home.appProcessStatus.AppProcessStatusResponse;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;


@Data
public class AppProcessResponse {
    private Integer id;

    private String command;

    private String description;

    private String path;

    private Set<AppProcessStatusResponse> appProcessStatuses =
            new HashSet<>();
}

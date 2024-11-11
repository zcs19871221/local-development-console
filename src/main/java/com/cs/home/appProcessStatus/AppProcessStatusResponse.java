package com.cs.home.appProcessStatus;

import lombok.Data;
import lombok.Getter;

import java.util.Set;

@Data
@Getter
public class AppProcessStatusResponse {
    private Integer id;

    private Set<String> matchers;

    private String label;

    private String color;

    private Boolean clear;

    private String name;
}

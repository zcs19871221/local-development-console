package com.cs.home.appProcessStatus;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Data
public class AppProcessStatusUpdated {

    @NotNull
    private Integer id;

    @NotEmpty
    private Set<String> matchers;

    @NotEmpty
    private String label;

    @NotEmpty
    private String color;

    private Boolean clear = false;

    @NotEmpty
    private String name;

}

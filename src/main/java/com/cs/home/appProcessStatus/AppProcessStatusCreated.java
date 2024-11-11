package com.cs.home.appProcessStatus;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import java.util.Set;

@Data
public class AppProcessStatusCreated {
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

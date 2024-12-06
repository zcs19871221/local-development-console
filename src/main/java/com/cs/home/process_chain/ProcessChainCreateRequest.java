package com.cs.home.process_chain;

import lombok.Data;

import javax.persistence.ElementCollection;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Data
public class ProcessChainCreateRequest {
    @NotEmpty
    private String name;

    @ElementCollection
    @NotNull
    @Size(min = 1)
    private List<ProcessChainConfigRequest> processChainConfigs;
}

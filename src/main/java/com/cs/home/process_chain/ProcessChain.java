package com.cs.home.process_chain;

import com.cs.home.log_monitor.LogMonitor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Entity
@Getter
@Setter
@Valid
@EqualsAndHashCode
public class ProcessChain {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @NotEmpty
    private String name;

    @ElementCollection
    @NotNull(message = "{processChainConfigsNotEmpty}")
    @Size(min = 1, message = "{processChainConfigsNotEmpty}")
    private List<ProcessChainConfig> processChainConfigs;
}

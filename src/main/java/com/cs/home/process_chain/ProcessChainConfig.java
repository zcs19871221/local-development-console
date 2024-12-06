package com.cs.home.process_chain;

import lombok.Data;

import javax.persistence.*;
import java.util.List;

@Entity
@Data
public class ProcessChainConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Delay in milliseconds before starting the process
    private int delayInMilliseconds;

    // ID of the process to start
    private Integer processId;

    // Whether to start this process after the previous one finishes
    private boolean waitForPreviousCompletion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    // Child process configurations in the chain
    private List<ProcessChainConfig> childProcessChainConfigs;

    @Version
    private Long version;
}
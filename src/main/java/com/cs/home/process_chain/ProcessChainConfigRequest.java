package com.cs.home.process_chain;

import lombok.Data;

import javax.persistence.Embeddable;
import java.util.List;

@Embeddable
@Data
public class ProcessChainConfigRequest {
    // Delay in milliseconds before starting the process
    private int delayInMilliseconds;

    private Integer id;
    
    // ID of the process to start
    private Integer processId;

    // Whether to start this process after the previous one finishes
    private boolean waitForPreviousCompletion;

    // Child process configurations in the chain
    private List<ProcessChainConfigRequest> childProcessChainConfigs;

    private Long version;
}

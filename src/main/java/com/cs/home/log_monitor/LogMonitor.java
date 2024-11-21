package com.cs.home.log_monitor;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.util.List;

@Entity
@Getter
@Setter
@Valid

@EqualsAndHashCode
public class LogMonitor {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @NotEmpty
    private String name; // Name of the processOutputLog monitor

    @ElementCollection
    private List<LogStatus> statusConfigurations; // Collection of processOutputLog status configurations

}

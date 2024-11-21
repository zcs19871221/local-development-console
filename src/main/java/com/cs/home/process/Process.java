package com.cs.home.process;

import com.cs.home.log_monitor.LogMonitor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;

@Entity
@Getter
@Setter
@Valid
@EqualsAndHashCode
public class Process {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @NotEmpty
    private String command;

    @NotEmpty
    private String path;

    private String description;

    @ManyToOne(cascade = {
            CascadeType.PERSIST,
            CascadeType.MERGE
    })
    private LogMonitor logMonitor;


}

package com.cs.home.appProcesses;

import com.cs.home.appProcessStatus.AppProcessStatus;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Valid
@EqualsAndHashCode
public class AppProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @NotEmpty
    private String command;

    @NotEmpty
    private String path;

    private String description;

    @ManyToMany(cascade = {
            CascadeType.PERSIST,
            CascadeType.MERGE
    })
    private Set<AppProcessStatus> appProcessStatuses = new HashSet<>();

    public void add(AppProcessStatus appProcessStatus) {
        if (appProcessStatus == null) {
            return;
        }
        appProcessStatuses.add(appProcessStatus);
    }

    public void remove(AppProcessStatus appProcessStatus) {

        if (appProcessStatus == null) {
            return;
        }
        appProcessStatuses.remove(appProcessStatus);
    }


}

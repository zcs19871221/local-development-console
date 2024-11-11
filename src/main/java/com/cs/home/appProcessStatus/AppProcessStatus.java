package com.cs.home.appProcessStatus;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.util.Set;

@Entity
@Getter
@Setter
@Valid

@EqualsAndHashCode
public class AppProcessStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @NotEmpty
    @ElementCollection
    private Set<String> matchers;

    @NotEmpty
    private String label;

    @NotEmpty
    @Column(unique = true)
    private String name;

    @NotEmpty
    private String color;

    private Boolean clear;

}

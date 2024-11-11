package com.cs.home.common;

import lombok.Data;

import java.io.Serializable;

@Data
public class Pagination<T> implements Serializable {
    private T list;
    private Integer page;
    private Integer total;
    private Integer pageSize;

}

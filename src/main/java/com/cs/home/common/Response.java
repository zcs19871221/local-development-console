package com.cs.home.common;

import lombok.Data;

import java.io.Serializable;

@Data
public class Response<T> implements Serializable {
    private T data;

    private Response(T data) {
        this.data = data;
    }

    public static <T> Response<T> create(T data) {
        return new Response<T>(data);
    }


    public static Response<String> EmptyResponse() {
        return new Response<>("");
    }
}

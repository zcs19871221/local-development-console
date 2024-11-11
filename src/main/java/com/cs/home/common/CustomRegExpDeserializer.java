package com.cs.home.common;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

public class CustomRegExpDeserializer extends JsonDeserializer<Pattern> {


    @Override
    public Pattern deserialize(
            JsonParser jsonparser, DeserializationContext context)
            throws IOException {

        String pattern = jsonparser.getValueAsString();

        try {
            return Pattern.compile(URLDecoder.decode(pattern, StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}


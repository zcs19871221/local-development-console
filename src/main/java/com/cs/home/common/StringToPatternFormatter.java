package com.cs.home.common;

import org.springframework.format.Formatter;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Locale;
import java.util.regex.Pattern;

public final class StringToPatternFormatter implements Formatter<Pattern> {

    @Override
    public Pattern parse(String text, Locale locale) throws ParseException {
        return Pattern.compile(URLDecoder.decode(text, StandardCharsets.UTF_8));
    }

    @Override
    public String print(Pattern pattern, Locale locale) {
        return pattern.toString();
    }
}
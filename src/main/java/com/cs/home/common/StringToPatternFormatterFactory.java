package com.cs.home.common;

import org.springframework.format.AnnotationFormatterFactory;
import org.springframework.format.Parser;
import org.springframework.format.Printer;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public final class StringToPatternFormatterFactory
        implements AnnotationFormatterFactory<StringToPattern> {

    public Set<Class<?>> getFieldTypes() {
        return Collections.singleton(Pattern.class);
    }

    public Printer<?> getPrinter(StringToPattern annotation, Class<?> fieldType) {
        return new StringToPatternFormatter();
    }

    public Parser<?> getParser(StringToPattern annotation, Class<?> fieldType) {
        return new StringToPatternFormatter();
    }


}
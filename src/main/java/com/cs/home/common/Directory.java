package com.cs.home.common;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = DirectoryValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Directory {
    String message() default "{directoryNotExists}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
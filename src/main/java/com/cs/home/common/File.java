package com.cs.home.common;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = FileValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface File {
    String message() default "File not exists";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
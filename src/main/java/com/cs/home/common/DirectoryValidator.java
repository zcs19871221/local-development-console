package com.cs.home.common;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class DirectoryValidator implements
        ConstraintValidator<Directory, String> {

    @Override
    public boolean isValid(String pathStr,
                           ConstraintValidatorContext cxt) {
        java.io.File file = new java.io.File(pathStr);
        return file.isDirectory();
    }

}
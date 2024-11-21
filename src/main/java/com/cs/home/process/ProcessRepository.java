package com.cs.home.process;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface ProcessRepository extends JpaRepository<Process,
        Integer>,
        QuerydslPredicateExecutor<Process> {

}
